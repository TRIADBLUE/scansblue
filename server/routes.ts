import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { agentRequestSchema, batchAgentRequestSchema } from "@shared/schema";
import { parseUserQuestion } from "./services/openai";
import { executeAnalysis } from "./services/analysisExecutor";
import { sendWebhook } from "./services/webhook";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for cross-origin requests
  app.use(cors());

  // Health check endpoint to verify Playwright functionality
  app.get("/api/health", async (req, res) => {
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      await browser.close();
      res.json({
        status: "healthy",
        playwright: "operational",
        message: "Browser automation is working correctly"
      });
    } catch (error: any) {
      res.status(503).json({
        status: "degraded",
        playwright: "unavailable",
        message: "Browser automation is not available. System dependencies may be missing.",
        error: error.message
      });
    }
  });

  app.post("/api/agent", async (req, res) => {
    try {
      // Validate request body
      const validation = agentRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          content: "Invalid request. Please provide a 'content' field with your question.",
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
      // Validate request body
      const validation = batchAgentRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request. Please provide 'requests' array with 1-10 content items.",
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

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Try to launch browser to verify Playwright is working
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      await browser.close();

      res.json({
        status: "healthy",
        browser: "operational",
        message: "Site Inspector Agent is ready"
      });
    } catch (error: any) {
      res.status(503).json({
        status: "degraded",
        browser: "unavailable",
        message: "Browser automation unavailable - likely missing system dependencies",
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
