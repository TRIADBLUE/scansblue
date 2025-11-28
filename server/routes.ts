import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { agentRequestSchema, batchAgentRequestSchema, auditRequestSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
