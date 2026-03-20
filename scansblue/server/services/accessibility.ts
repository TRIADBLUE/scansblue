import type { AccessibilityAnalysis } from "@shared/schema";
import { analyzeAccessibility as browserlessAnalyzeAccessibility } from "./browserless";

export async function analyzeAccessibility(url: string): Promise<AccessibilityAnalysis> {
  return browserlessAnalyzeAccessibility(url);
}
