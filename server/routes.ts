import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import cors from "cors";
import { agentRequestSchema, batchAgentRequestSchema, auditRequestSchema, checkoutRequestSchema } from "@shared/schema";
import { parseUserQuestion } from "./services/openai";
import { executeAnalysis } from "./services/analysisExecutor";
import { sendWebhook } from "./services/webhook";
import { crawlWebsite } from "./services/websiteCrawler";
import { generateTasks } from "./services/taskGenerator";
import { websiteAnalysisRequestSchema } from "@shared/schema";
import { auditCode } from "./services/deepseek";
import { saveFile, getFile, deleteFile } from "./services/fileStorage";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for cross-origin requests
  app.use(cors());

  // Health check endpoint to verify Browserless functionality
  app.get("/api/health", async (req, res) => {
    const apiKey = process.env.BROWSERLESS_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        status: "degraded",
        browserless: "unconfigured",
        message: "BROWSERLESS_API_KEY is not configured",
      });
    }
    
    try {
      const response = await fetch("https://production-sfo.browserless.io/function?token=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/javascript" },
        body: `export default async function ({ page }) {
  await page.goto('https://example.com', { waitUntil: 'networkidle2' });
  return { status: 'ok' };
}`,
      });

      if (response.ok) {
        res.json({
          status: "healthy",
          browserless: "operational",
          message: "Browser automation is working correctly"
        });
      } else {
        res.status(503).json({
          status: "degraded",
          browserless: "unavailable",
          message: "Browserless API returned error: " + response.status,
        });
      }
    } catch (error: any) {
      res.status(503).json({
        status: "degraded",
        browserless: "unavailable",
        message: "Failed to connect to Browserless service",
        error: error.message
      });
    }
  });

  app.post("/api/agent", async (req, res) => {
    try {
      // Support multiple field names for compatibility (content, query, message, prompt, text)
      const body = req.body;
      const rawContent = body.content || body.query || body.message || body.prompt || body.text;
      
      // Validate request body
      const validation = agentRequestSchema.safeParse({
        content: rawContent,
        webhookUrl: body.webhookUrl,
      });
      if (!validation.success) {
        return res.status(400).json({
          content: "Invalid request. Please provide a question with a valid URL (e.g., 'How many buttons on example.com?').",
        });
      }

      const { content, webhookUrl } = validation.data;

      // Parse the user's question using OpenAI
      const parsed = await parseUserQuestion(content);

      // Check if we have URLs to analyze
      if (parsed.urls.length === 0) {
        return res.status(400).json({
          content: "I couldn't find a valid URL in your question. Please include a website URL (e.g., example.com or https://example.com).",
        });
      }

      // Execute analysis using shared executor (handles caching internally)
      const response = await executeAnalysis({ parsed, rawContent: content, storage });
      
      // Send webhook if provided
      if (webhookUrl) {
        sendWebhook(webhookUrl, {
          event: "analysis_complete",
          timestamp: new Date().toISOString(),
          result: response,
          originalRequest: content,
        }).catch(err => console.error("Webhook error:", err));
      }

      res.json(response);

    } catch (error: any) {
      console.error("Error processing request:", error);

      // Provide helpful error messages based on common issues
      if (error.message?.includes("timeout")) {
        return res.status(504).json({
          content: `The site took too long to respond. It might be down or blocking automated access. Please try a different URL or try again later.`,
        });
      } else if (error.message?.includes("net::ERR")) {
        return res.status(502).json({
          content: `I couldn't access that URL. Please check that it's valid and publicly accessible. Make sure the URL includes the protocol (e.g., https://).`,
        });
      } else if (error.message?.includes("browser")) {
        return res.status(503).json({
          content: `The browser automation service is currently unavailable. This is likely because the service requires Chromium dependencies that aren't available in this environment. Please try deploying to an environment that supports Playwright.`,
        });
      } else {
        return res.status(500).json({
          content: `An error occurred while analyzing the website: ${error.message || "Unknown error"}`,
        });
      }
    }
  });

  // Batch analysis endpoint
  app.post("/api/agent/batch", async (req, res) => {
    try {
      // Support multiple field names for compatibility
      const normalizedRequests = (req.body.requests || []).map((r: any) => ({
        content: r.content || r.query || r.message || r.prompt || r.text || "",
      }));
      
      // Validate request body
      const validation = batchAgentRequestSchema.safeParse({
        requests: normalizedRequests,
        webhookUrl: req.body.webhookUrl,
      });
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request. Please provide 'requests' array with 1-10 items, each with a question including a URL.",
        });
      }

      const { requests, webhookUrl } = validation.data;
      
      // Process all requests in parallel using shared executor
      const results = await Promise.all(
        requests.map(async ({ content }) => {
          try {
            const parsed = await parseUserQuestion(content);
            
            if (parsed.urls.length === 0) {
              return {
                content: "I couldn't find a valid URL in your question. Please include a website URL.",
              };
            }

            return await executeAnalysis({ parsed, rawContent: content, storage });
          } catch (error: any) {
            return {
              content: `Error: ${error.message || "Unknown error"}`,
            };
          }
        })
      );

      const response = { results };

      // Send webhook if provided
      if (webhookUrl) {
        sendWebhook(webhookUrl, {
          event: "batch_complete",
          timestamp: new Date().toISOString(),
          result: response,
          originalRequests: requests,
        }).catch(err => console.error("Webhook error:", err));
      }

      res.json(response);

    } catch (error: any) {
      console.error("Batch processing error:", error);
      return res.status(500).json({
        error: `Batch processing failed: ${error.message || "Unknown error"}`,
      });
    }
  });

  // Website analysis endpoint - crawls entire site and generates task list
  app.post("/api/agent/analyze-website", async (req, res) => {
    try {
      // Validate request
      const validation = websiteAnalysisRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request. Please provide a valid 'url'.",
        });
      }

      const { url, maxPages = 50, webhookUrl } = validation.data;

      // Check if we have recent analysis for this URL
      const existing = await storage.getWebsiteAnalysis(url);
      if (existing) {
        const response = {
          url,
          pagesAnalyzed: existing.pagesAnalyzed,
          totalIssues: (existing.issues as any).totalIssues || 0,
          tasks: existing.tasks,
          summary: existing.summary,
        };

        // Send webhook if provided
        if (webhookUrl) {
          sendWebhook(webhookUrl, {
            event: "website_analysis_complete",
            timestamp: new Date().toISOString(),
            result: response,
            fromCache: true,
          }).catch(err => console.error("Webhook error:", err));
        }

        return res.json(response);
      }

      // Crawl the website with configurable page limit
      const { pages } = await crawlWebsite(url, maxPages);
      
      // Generate task list
      const { tasks, summary } = generateTasks(pages);

      // Store analysis results
      const pagesAnalyzed = pages.map(p => p.url);
      const totalIssues = pages.reduce((sum, p) => {
        let count = 0;
        count += p.accessibilityIssues.missingAltText;
        count += p.accessibilityIssues.missingAriaLabels;
        count += p.accessibilityIssues.headingIssues.length;
        count += p.contentIssues.brokenLinks.length;
        count += p.contentIssues.missingImages;
        count += p.seoIssues.noMetaDescription ? 1 : 0;
        count += p.seoIssues.missingH1 ? 1 : 0;
        count += p.seoIssues.duplicateHeadings ? 1 : 0;
        count += p.performance.unoptimizedAssets;
        return sum + count;
      }, 0);

      await storage.setWebsiteAnalysis({
        url,
        pagesAnalyzed,
        issues: { totalIssues, details: pages } as any,
        tasks: tasks as any,
        summary,
      }).catch(err => console.error("Analysis storage error:", err));

      const response = {
        url,
        pagesAnalyzed,
        totalIssues,
        tasks,
        summary,
      };

      // Send webhook if provided
      if (webhookUrl) {
        sendWebhook(webhookUrl, {
          event: "website_analysis_complete",
          timestamp: new Date().toISOString(),
          result: response,
          fromCache: false,
        }).catch(err => console.error("Webhook error:", err));
      }

      res.json(response);

    } catch (error: any) {
      console.error("Website analysis error:", error);

      if (error.message?.includes("timeout")) {
        return res.status(504).json({
          error: "Analysis timed out. The website may be slow or unreachable.",
        });
      } else if (error.message?.includes("browser")) {
        return res.status(503).json({
          error: "Browser service unavailable. This feature requires Chromium dependencies.",
        });
      } else {
        return res.status(500).json({
          error: `Analysis failed: ${error.message || "Unknown error"}`,
        });
      }
    }
  });

  // Quick site scan endpoint - crawls site and returns per-category metrics
  app.post("/api/agent/quick-site-scan", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          error: "URL is required",
        });
      }

      // Ensure URL has protocol
      const finalUrl = url.startsWith("http") ? url : `https://${url}`;

      console.log(`[Quick Site Scan] Starting scan for: ${finalUrl}`);

      // Crawl the website with a modest page limit for quick results
      const { pages } = await crawlWebsite(finalUrl, 10);
      
      // Aggregate REAL metrics across all pages
      let totalButtons = 0;
      let totalLogos = 0;
      let totalForms = 0;
      let totalImages = 0;
      let totalMissingAlt = 0;
      let totalNavItems = 0;
      let totalH1 = 0;
      let headingIssues = 0;
      let accessibilityIssues = 0;
      let hasFavicon = false;
      let hasLogo = false;

      for (const page of pages) {
        // Use real metrics from the enhanced crawl
        if (page.metrics) {
          totalButtons += page.metrics.buttonCount;
          totalForms += page.metrics.formCount;
          totalImages += page.metrics.imageCount;
          totalNavItems += page.metrics.navItemCount;
          totalH1 += page.metrics.h1Count;
          
          // Logo and favicon - any page having it counts
          if (page.metrics.hasLogo) hasLogo = true;
          if (page.metrics.hasFavicon) hasFavicon = true;
        }
        
        // Accessibility issues from existing data
        totalMissingAlt += page.accessibilityIssues?.missingAltText || 0;
        accessibilityIssues += page.accessibilityIssues?.missingAriaLabels || 0;
        accessibilityIssues += (page.accessibilityIssues?.headingIssues?.length || 0);
        
        // Heading issues
        if (page.seoIssues?.missingH1) {
          headingIssues++;
        }
        if (page.seoIssues?.duplicateHeadings) {
          headingIssues++;
        }
      }

      // Calculate unique nav items (avoid counting duplicates across pages)
      const avgNavItems = pages.length > 0 ? Math.ceil(totalNavItems / pages.length) : 0;

      const response = {
        url: finalUrl,
        pagesScanned: pages.length,
        categories: {
          buttons: {
            count: totalButtons,
            status: totalButtons > 0 ? 'ok' : 'warning',
            message: totalButtons > 0 ? `Found ${totalButtons} buttons` : 'No buttons detected'
          },
          logos: {
            count: hasLogo ? 1 : 0,
            status: hasLogo ? 'ok' : 'warning',
            message: hasLogo ? 'Logo detected' : 'No logo found'
          },
          favicon: {
            found: hasFavicon,
            status: hasFavicon ? 'ok' : 'error',
            message: hasFavicon ? 'Favicon present' : 'Missing favicon'
          },
          navigation: {
            items: avgNavItems,
            status: avgNavItems > 0 ? 'ok' : 'warning',
            message: `${avgNavItems} navigation items`
          },
          accessibility: {
            issues: accessibilityIssues + totalMissingAlt,
            status: accessibilityIssues + totalMissingAlt === 0 ? 'ok' : 
                   accessibilityIssues + totalMissingAlt < 5 ? 'warning' : 'error',
            message: accessibilityIssues + totalMissingAlt === 0 ? 'No issues' : 
                    `${accessibilityIssues + totalMissingAlt} issues found`
          },
          forms: {
            count: totalForms,
            status: 'ok',
            message: `${totalForms} forms detected`
          },
          images: {
            count: totalImages,
            missingAlt: totalMissingAlt,
            status: totalMissingAlt === 0 ? 'ok' : 
                   totalMissingAlt < 5 ? 'warning' : 'error',
            message: totalMissingAlt === 0 ? 'All images have alt text' : 
                    `${totalMissingAlt} images missing alt text`
          },
          headings: {
            h1Count: totalH1,
            issues: headingIssues,
            status: headingIssues === 0 ? 'ok' : 
                   headingIssues < 3 ? 'warning' : 'error',
            message: headingIssues === 0 ? 'Heading structure OK' : 
                    `${headingIssues} heading issues`
          }
        },
        summary: `Scanned ${pages.length} pages on ${new URL(finalUrl).hostname}. ` +
                 `Found ${totalButtons} buttons, ${totalForms} forms, ${totalImages} images. ` +
                 `${accessibilityIssues + totalMissingAlt} accessibility issues, ` +
                 `${headingIssues} heading issues. ` +
                 (accessibilityIssues + totalMissingAlt + headingIssues === 0 
                   ? 'Site looks healthy!' 
                   : 'Some improvements recommended.')
      };

      console.log(`[Quick Site Scan] Completed: ${pages.length} pages scanned`);
      res.json(response);

    } catch (error: any) {
      console.error("Quick site scan error:", error);

      if (error.message?.includes("timeout")) {
        return res.status(504).json({
          error: "Scan timed out. The website may be slow or unreachable.",
        });
      } else if (error.message?.includes("browser")) {
        return res.status(503).json({
          error: "Browser service unavailable.",
        });
      } else {
        return res.status(500).json({
          error: `Scan failed: ${error.message || "Unknown error"}`,
        });
      }
    }
  });

  // Code audit endpoint using DeepSeek
  app.post("/api/audit", async (req, res) => {
    try {
      const validation = auditRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request. Please provide code to audit.",
          details: validation.error.errors,
        });
      }

      const { code, language, question } = validation.data;

      const result = await auditCode({ code, language, question });

      res.json(result);
    } catch (error: any) {
      console.error("Code audit error:", error);

      if (error.message?.includes("DeepSeek API")) {
        return res.status(503).json({
          error: "DeepSeek service is currently unavailable. Please try again later.",
        });
      } else if (error.message?.includes("not configured")) {
        return res.status(503).json({
          error: "Code auditing is not configured. Please set up your DeepSeek API key.",
        });
      } else {
        return res.status(500).json({
          error: `Audit failed: ${error.message || "Unknown error"}`,
        });
      }
    }
  });

  // File upload endpoint
  app.post("/api/upload", async (req, res) => {
    try {
      // Get file from body as base64 string
      const { file, name, type } = req.body;

      if (!file || !name) {
        return res.status(400).json({
          error: "Missing file or name",
        });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(file, "base64");

      const metadata = saveFile(buffer, name, type || "application/octet-stream");

      res.json(metadata);
    } catch (error: any) {
      console.error("File upload error:", error);
      res.status(500).json({
        error: `Upload failed: ${error.message || "Unknown error"}`,
      });
    }
  });

  // File download endpoint
  app.get("/api/download/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const result = getFile(id);
      if (!result) {
        return res.status(404).json({
          error: "File not found",
        });
      }

      const { buffer, metadata } = result;

      res.setHeader("Content-Type", metadata.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${metadata.originalName}"`
      );
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error: any) {
      console.error("File download error:", error);
      res.status(500).json({
        error: `Download failed: ${error.message || "Unknown error"}`,
      });
    }
  });

  // File delete endpoint
  app.delete("/api/upload/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!deleteFile(id)) {
        return res.status(404).json({
          error: "File not found",
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("File delete error:", error);
      res.status(500).json({
        error: `Delete failed: ${error.message || "Unknown error"}`,
      });
    }
  });

  // Conversation endpoints
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error: any) {
      console.error("Failed to fetch conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { title } = req.body;
      const conversation = await storage.createConversation({ title: title || "New Conversation" });
      res.json(conversation);
    } catch (error: any) {
      console.error("Failed to create conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getConversationMessages(id);
      res.json(messages);
    } catch (error: any) {
      console.error("Failed to fetch conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const { role, content } = req.body;
      const message = await storage.addMessageToConversation({ conversationId: id, role, content });
      res.json(message);
    } catch (error: any) {
      console.error("Failed to add message:", error);
      res.status(500).json({ error: "Failed to add message" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConversation(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // ─── Payment Flow (swipesblue.com) ───────────────────────────────────

  const SWIPESBLUE_API = "https://swipesblue.com/api/v1";

  // POST /api/checkout — create a checkout session
  const PLAN_PRICING: Record<string, { amount: number; description: string }> = {
    comprehensive: { amount: 1000, description: "Comprehensive Analysis" },
    bundle: { amount: 1500, description: "Comprehensive Analysis + Auditor" },
    questions: { amount: 500, description: "5 Additional Auditor Questions" },
  };

  app.post("/api/checkout", async (req, res) => {
    try {
      const validation = checkoutRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request. Provide assessmentId, email, and websiteUrl.",
        });
      }

      const { assessmentId, email, websiteUrl, plan = "comprehensive" } = validation.data;
      const planInfo = PLAN_PRICING[plan] || PLAN_PRICING.comprehensive;

      // Create the purchase record
      const purchase = await storage.createPurchase({
        assessmentId,
        email,
        websiteUrl,
        amountCents: planInfo.amount,
        paymentStatus: "pending",
        reportStatus: "pending",
      });

      // Call swipesblue.com to create a checkout session
      const swipesResponse = await fetch(`${SWIPESBLUE_API}/checkout/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SWIPESBLUE_API_KEY}`,
        },
        body: JSON.stringify({
          amount: planInfo.amount,
          currency: "usd",
          description: `${planInfo.description} — ${websiteUrl}`,
          customerEmail: email,
          metadata: {
            purchaseId: purchase.id,
            assessmentId,
            websiteUrl,
            plan,
            platform: "scansblue.com",
          },
          successUrl: `${req.protocol}://${req.get("host")}/success?session_id={SESSION_ID}`,
          cancelUrl: `${req.protocol}://${req.get("host")}/purchase?canceled=true`,
          webhookUrl: `${req.protocol}://${req.get("host")}/api/payment-webhook`,
        }),
      });

      if (!swipesResponse.ok) {
        const errText = await swipesResponse.text();
        console.error("swipesblue.com checkout error:", errText);
        return res.status(502).json({
          error: "Payment service unavailable. Please try again.",
        });
      }

      const session = await swipesResponse.json() as { id: string; url: string };

      // Store the session ID on the purchase record
      if (session.id) {
        await storage.updatePurchaseSessionId(purchase.id, session.id);
      }

      res.json({
        checkoutUrl: session.url,
        sessionId: session.id,
        purchaseId: purchase.id,
      });

    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({
        error: `Checkout failed: ${error.message || "Unknown error"}`,
      });
    }
  });

  // GET /api/verify-session — verify that a payment completed
  app.get("/api/verify-session", async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.status(400).json({ error: "session_id is required" });
      }

      // Call swipesblue.com to check session status
      const swipesResponse = await fetch(`${SWIPESBLUE_API}/checkout/sessions/${sessionId}`, {
        headers: {
          "Authorization": `Bearer ${process.env.SWIPESBLUE_API_KEY}`,
        },
      });

      if (!swipesResponse.ok) {
        return res.status(502).json({ error: "Could not verify payment status" });
      }

      const session = await swipesResponse.json() as {
        id: string;
        paymentStatus: string;
        metadata?: { purchaseId?: string; assessmentId?: string };
        customerEmail?: string;
      };

      const paid = session.paymentStatus === "paid" || session.paymentStatus === "complete";

      // If paid, update our purchase record
      if (paid && session.metadata?.purchaseId) {
        await storage.updatePurchasePaymentStatus(
          session.metadata.purchaseId,
          "paid",
          new Date()
        );
      }

      // Look up purchase for assessment ID
      const purchase = session.metadata?.purchaseId
        ? await storage.getPurchase(session.metadata.purchaseId)
        : await storage.getPurchaseBySessionId(sessionId);

      res.json({
        paid,
        assessmentId: purchase?.assessmentId || session.metadata?.assessmentId,
        customerEmail: purchase?.email || session.customerEmail,
        purchaseId: purchase?.id,
      });

    } catch (error: any) {
      console.error("Verify session error:", error);
      res.status(500).json({
        error: `Verification failed: ${error.message || "Unknown error"}`,
      });
    }
  });

  // POST /api/payment-webhook — receives payment completion callbacks from swipesblue.com
  app.post("/api/payment-webhook", async (req, res) => {
    try {
      // Verify webhook signature from swipesblue.com
      const webhookSecret = process.env.SWIPESBLUE_WEBHOOK_SECRET;
      if (webhookSecret) {
        const signature = req.headers["x-swipesblue-signature"] || req.headers["x-webhook-signature"];
        if (!signature) {
          console.warn("[Payment Webhook] Missing signature header");
          return res.status(401).json({ error: "Missing webhook signature" });
        }

        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(JSON.stringify(req.body))
          .digest("hex");

        const sigString = Array.isArray(signature) ? signature[0] : signature;
        if (!crypto.timingSafeEqual(Buffer.from(sigString), Buffer.from(expectedSignature))) {
          console.warn("[Payment Webhook] Invalid signature");
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      }

      const { event, data } = req.body;

      if (event === "payment.completed" || event === "checkout.session.completed") {
        const purchaseId = data?.metadata?.purchaseId;
        const assessmentId = data?.metadata?.assessmentId;
        const websiteUrl = data?.metadata?.websiteUrl;

        if (purchaseId) {
          // Mark purchase as paid
          await storage.updatePurchasePaymentStatus(purchaseId, "paid", new Date());

          // Trigger full report scan
          if (websiteUrl) {
            await storage.updatePurchaseReportStatus(purchaseId, "processing");

            // Kick off the full website analysis asynchronously
            (async () => {
              try {
                const { pages } = await crawlWebsite(websiteUrl, 50);
                const { tasks, summary } = generateTasks(pages);

                const reportData = {
                  url: websiteUrl,
                  pagesAnalyzed: pages.map(p => p.url),
                  totalPages: pages.length,
                  tasks,
                  summary,
                  generatedAt: new Date().toISOString(),
                };

                // Store report and mark as complete
                await storage.updatePurchaseReportStatus(
                  purchaseId,
                  "completed",
                  reportData,
                  new Date()
                );

                console.log(`[Payment Webhook] Report generated for purchase ${purchaseId}`);
              } catch (err: any) {
                console.error(`[Payment Webhook] Report generation failed for purchase ${purchaseId}:`, err);
                await storage.updatePurchaseReportStatus(purchaseId, "failed");
              }
            })();
          }
        }
      }

      // Acknowledge the webhook immediately
      res.json({ received: true });

    } catch (error: any) {
      console.error("Payment webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // POST /api/report-webhook — receives callbacks when reports finish processing
  app.post("/api/report-webhook", async (req, res) => {
    try {
      const { assessmentId, reportData } = req.body;

      if (!assessmentId) {
        return res.status(400).json({ error: "assessmentId is required" });
      }

      // Look up the purchase by assessment ID
      const purchase = await storage.getPurchaseByAssessmentId(assessmentId);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found for this assessment" });
      }

      // Update report status
      await storage.updatePurchaseReportStatus(
        purchase.id,
        "completed",
        reportData,
        new Date()
      );

      // In production, this is where you'd send the report email to purchase.email
      // For now, log the delivery target
      console.log(`[Report Webhook] Report ready for ${purchase.email} (assessment: ${assessmentId})`);

      res.json({
        received: true,
        purchaseId: purchase.id,
        customerEmail: purchase.email,
      });

    } catch (error: any) {
      console.error("Report webhook error:", error);
      res.status(500).json({ error: "Report webhook processing failed" });
    }
  });

  // GET /api/purchase-status — check status of a purchase by ID
  app.get("/api/purchase-status", async (req, res) => {
    try {
      const purchaseId = req.query.id as string;
      if (!purchaseId) {
        return res.status(400).json({ error: "Purchase ID is required" });
      }

      const purchase = await storage.getPurchase(purchaseId);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      res.json({
        id: purchase.id,
        websiteUrl: purchase.websiteUrl,
        paymentStatus: purchase.paymentStatus,
        reportStatus: purchase.reportStatus,
        paidAt: purchase.paidAt,
        deliveredAt: purchase.deliveredAt,
      });

    } catch (error: any) {
      console.error("Purchase status error:", error);
      res.status(500).json({ error: "Failed to get purchase status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
