import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "server", "prompts");

const promptCache: Record<string, string> = {};

export function loadPrompt(promptName: string): string {
  if (promptCache[promptName]) {
    return promptCache[promptName];
  }

  const filename = `${promptName}-system-prompt.md`;
  const filepath = path.join(PROMPTS_DIR, filename);

  try {
    const content = fs.readFileSync(filepath, "utf8");
    promptCache[promptName] = content;
    console.log(`[PromptLoader] Loaded prompt: ${promptName}`);
    return content;
  } catch (error) {
    console.warn(`[PromptLoader] Failed to load prompt ${promptName}:`, error);
    return "";
  }
}

export function getCodeAuditorPrompt(): string {
  return loadPrompt("code-auditor");
}

export function getComprehensiveAnalysisPrompt(): string {
  return loadPrompt("comprehensive-analysis");
}

export function getQuickAnalysisPrompt(): string {
  return loadPrompt("quick-analysis");
}

export function preloadAllPrompts(): void {
  console.log("[PromptLoader] Preloading all system prompts...");
  getCodeAuditorPrompt();
  getComprehensiveAnalysisPrompt();
  getQuickAnalysisPrompt();
  console.log("[PromptLoader] All prompts loaded successfully");
}
