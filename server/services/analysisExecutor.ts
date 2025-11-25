import type { ParsedQuestion } from "./openai";
import type { AgentResponse } from "@shared/schema";
import {
  countButtons,
  findLogos,
  findFavicon,
  analyzeNavigation,
  compareEnvironments,
  analyzeForms,
  analyzeImages,
  analyzeHeadings,
  performComprehensiveAnalysis,
} from "./browserless";
import { analyzeAccessibility } from "./accessibility";
import {
  formatButtonAnalysis,
  formatLogoAnalysis,
  formatFaviconAnalysis,
  formatNavigationAnalysis,
  formatComparison,
  formatAccessibilityAnalysis,
  formatFormsAnalysis,
  formatImagesAnalysis,
  formatHeadingsAnalysis,
  formatComprehensiveAnalysis,
} from "./formatter";
import type { IStorage } from "../storage";

interface AnalysisExecutorOptions {
  parsed: ParsedQuestion;
  rawContent: string;
  storage: IStorage;
}

export async function executeAnalysis({ parsed, rawContent, storage }: AnalysisExecutorOptions): Promise<AgentResponse> {
  let responseContent: string;
  let screenshot: string | undefined;
  let devScreenshot: string | undefined;
  let prodScreenshot: string | undefined;

  // Determine cache key and check cache
  let cacheKey: string;
  let cacheType: string;

  if (parsed.analysisType === "compare" && parsed.urls.length >= 2) {
    const comparisonSubtype = parsed.comparisonSubtype || "navigation";
    cacheKey = `${parsed.urls[0]}_${parsed.urls[1]}_${comparisonSubtype}`;
    cacheType = "compare";
  } else {
    cacheKey = parsed.urls[0];
    cacheType = parsed.analysisType;
  }

  // Check cache first
  const cachedResult = await storage.getCachedAnalysis(cacheKey, cacheType);
  if (cachedResult) {
    console.log(`Cache hit for ${parsed.analysisType} - ${cacheKey}`);
    const result = cachedResult.result as any;
    responseContent = result.content || result;
    screenshot = result.screenshot;
    devScreenshot = result.devScreenshot;
    prodScreenshot = result.prodScreenshot;

    return { content: responseContent, screenshot, devScreenshot, prodScreenshot };
  }

  // Cache miss - perform analysis
  try {
    if (parsed.analysisType === "compare" && parsed.urls.length >= 2) {
      const url1 = parsed.urls[0];
      const url2 = parsed.urls[1];
      const comparisonSubtype = parsed.comparisonSubtype || "navigation";

      const comparison = await compareEnvironments(url1, url2, comparisonSubtype);
      responseContent = formatComparison(url1, url2, comparisonSubtype, comparison);

      // Capture both screenshots for comparison
      devScreenshot = comparison.devScreenshot;
      prodScreenshot = comparison.prodScreenshot;
      screenshot = devScreenshot; // Primary screenshot is dev

      // Cache the complete comparison result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: cacheKey,
        analysisType: "compare",
        result: { content: responseContent, screenshot, devScreenshot, prodScreenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "buttons") {
      const analysis = await countButtons(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatButtonAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "buttons",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "logos") {
      const analysis = await findLogos(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatLogoAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "logos",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "favicon") {
      const analysis = await findFavicon(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatFaviconAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "favicon",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "navigation") {
      const analysis = await analyzeNavigation(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatNavigationAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "navigation",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "accessibility") {
      const analysis = await analyzeAccessibility(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatAccessibilityAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "accessibility",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "forms") {
      const analysis = await analyzeForms(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatFormsAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "forms",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "images") {
      const analysis = await analyzeImages(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatImagesAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "images",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "headings") {
      const analysis = await analyzeHeadings(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatHeadingsAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "headings",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else if (parsed.analysisType === "comprehensive") {
      const analysis = await performComprehensiveAnalysis(parsed.urls[0]);
      screenshot = analysis.screenshot;
      responseContent = formatComprehensiveAnalysis(parsed.urls[0], analysis);

      // Cache result
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setCachedAnalysis({
        url: parsed.urls[0],
        analysisType: "comprehensive",
        result: { content: responseContent, screenshot } as any,
        expiresAt,
      }).catch(err => console.error("Cache storage error:", err));

    } else {
      responseContent = "I couldn't determine what type of analysis you're looking for. Please ask about buttons, logos, favicon, navigation, accessibility, forms, images, headings, comprehensive analysis, or comparing two URLs.";
    }

    return { content: responseContent, screenshot, devScreenshot, prodScreenshot };

  } catch (error: any) {
    throw error;
  }
}
