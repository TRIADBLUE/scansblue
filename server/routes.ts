import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { agentRequestSchema } from "@shared/schema";
import { parseUserQuestion } from "./services/openai";
import {
  countButtons,
  findLogos,
  checkFavicon,
  analyzeNavigation,
  compareEnvironments,
} from "./services/playwright";
import {
  formatButtonAnalysis,
  formatLogoAnalysis,
  formatFaviconAnalysis,
  formatNavigationAnalysis,
  formatComparison,
} from "./services/formatter";

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

      const { content } = validation.data;

      // Parse the user's question using OpenAI
      const parsed = await parseUserQuestion(content);

      // Check if we have URLs to analyze
      if (parsed.urls.length === 0) {
        return res.status(400).json({
          content: "I couldn't find a valid URL in your question. Please include a website URL (e.g., example.com or https://example.com).",
        });
      }

      let responseContent: string;

      try {
        // Handle different analysis types
        if (parsed.analysisType === "compare" && parsed.urls.length >= 2) {
          // Comparison between two environments
          const [url1, url2] = parsed.urls;
          
          // Determine what to compare (default to navigation if not specified)
          let comparisonType: "buttons" | "logos" | "favicon" | "navigation" = "navigation";
          if (content.toLowerCase().includes("button")) comparisonType = "buttons";
          else if (content.toLowerCase().includes("logo")) comparisonType = "logos";
          else if (content.toLowerCase().includes("favicon")) comparisonType = "favicon";

          const comparison = await compareEnvironments(url1, url2, comparisonType);
          responseContent = formatComparison(url1, url2, comparisonType, comparison);

        } else if (parsed.analysisType === "buttons") {
          const analysis = await countButtons(parsed.urls[0]);
          responseContent = formatButtonAnalysis(parsed.urls[0], analysis);

        } else if (parsed.analysisType === "logos") {
          const analysis = await findLogos(parsed.urls[0]);
          responseContent = formatLogoAnalysis(parsed.urls[0], analysis);

        } else if (parsed.analysisType === "favicon") {
          const analysis = await checkFavicon(parsed.urls[0]);
          responseContent = formatFaviconAnalysis(parsed.urls[0], analysis);

        } else if (parsed.analysisType === "navigation") {
          const analysis = await analyzeNavigation(parsed.urls[0]);
          responseContent = formatNavigationAnalysis(parsed.urls[0], analysis);

        } else {
          // Unknown analysis type - try to infer from question
          if (content.toLowerCase().includes("button")) {
            const analysis = await countButtons(parsed.urls[0]);
            responseContent = formatButtonAnalysis(parsed.urls[0], analysis);
          } else if (content.toLowerCase().includes("logo")) {
            const analysis = await findLogos(parsed.urls[0]);
            responseContent = formatLogoAnalysis(parsed.urls[0], analysis);
          } else if (content.toLowerCase().includes("favicon")) {
            const analysis = await checkFavicon(parsed.urls[0]);
            responseContent = formatFaviconAnalysis(parsed.urls[0], analysis);
          } else {
            // Default to navigation analysis
            const analysis = await analyzeNavigation(parsed.urls[0]);
            responseContent = formatNavigationAnalysis(parsed.urls[0], analysis);
          }
        }

        res.json({ content: responseContent });

      } catch (analysisError: any) {
        console.error("Analysis error:", analysisError);

        // Provide helpful error messages based on common issues
        if (analysisError.message?.includes("timeout")) {
          return res.status(504).json({
            content: `The site took too long to respond. It might be down or blocking automated access. Please try a different URL or try again later.`,
          });
        } else if (analysisError.message?.includes("net::ERR")) {
          return res.status(502).json({
            content: `I couldn't access that URL. Please check that it's valid and publicly accessible. Make sure the URL includes the protocol (e.g., https://).`,
          });
        } else {
          return res.status(500).json({
            content: `I encountered an error while analyzing the website: ${analysisError.message || "Unknown error"}. Please try again or try a different URL.`,
          });
        }
      }

    } catch (error: any) {
      console.error("Request error:", error);
      res.status(500).json({
        content: "An unexpected error occurred. Please try again.",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
