import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "server", "prompts");

const ALLOWED_PROMPTS = ["code-auditor", "comprehensive-analysis", "quick-analysis"] as const;
type AllowedPrompt = typeof ALLOWED_PROMPTS[number];

const promptCache: Record<string, string> = {};
const loadErrors: Record<string, string> = {};

function isAllowedPrompt(name: string): name is AllowedPrompt {
  return ALLOWED_PROMPTS.includes(name as AllowedPrompt);
}

export function loadPrompt(promptName: string): string {
  if (!isAllowedPrompt(promptName)) {
    console.error(`[PromptLoader] SECURITY: Rejected unknown prompt name: ${promptName}`);
    return "";
  }

  if (promptCache[promptName]) {
    return promptCache[promptName];
  }

  const filename = `${promptName}-system-prompt.md`;
  const filepath = path.join(PROMPTS_DIR, filename);

  try {
    const content = fs.readFileSync(filepath, "utf8");
    
    if (!content || content.trim().length === 0) {
      const errorMsg = `Prompt file is empty: ${filename}`;
      console.error(`[PromptLoader] ERROR: ${errorMsg}`);
      loadErrors[promptName] = errorMsg;
      return "";
    }

    promptCache[promptName] = content;
    console.log(`[PromptLoader] Loaded prompt: ${promptName} (${content.length} chars)`);
    return content;
  } catch (error: any) {
    const errorMsg = `Failed to load ${filename}: ${error.message}`;
    console.error(`[PromptLoader] ERROR: ${errorMsg}`);
    loadErrors[promptName] = errorMsg;
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

export function getPromptLoadErrors(): Record<string, string> {
  return { ...loadErrors };
}

export function isPromptLoaded(promptName: string): boolean {
  return promptName in promptCache && promptCache[promptName].length > 0;
}

export function preloadAllPrompts(): void {
  console.log("[PromptLoader] Preloading all system prompts...");
  
  for (const promptName of ALLOWED_PROMPTS) {
    loadPrompt(promptName);
  }
  
  const loadedCount = Object.keys(promptCache).filter(k => promptCache[k].length > 0).length;
  const errorCount = Object.keys(loadErrors).length;
  
  if (errorCount > 0) {
    console.warn(`[PromptLoader] WARNING: ${errorCount} prompts failed to load:`, loadErrors);
  }
  
  console.log(`[PromptLoader] Loaded ${loadedCount}/${ALLOWED_PROMPTS.length} prompts`);
}
