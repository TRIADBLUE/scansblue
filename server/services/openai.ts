import OpenAI from "openai";
import pRetry from "p-retry";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// Referenced from blueprint:javascript_openai_ai_integrations
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

export interface ParsedQuestion {
  analysisType: "buttons" | "logos" | "favicon" | "navigation" | "compare" | "unknown";
  urls: string[];
  rawQuestion: string;
}

export async function parseUserQuestion(question: string): Promise<ParsedQuestion> {
  try {
    const response = await pRetry(
      async () => {
        try {
          const result = await openai.chat.completions.create({
            model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
            messages: [
              {
                role: "system",
                content: `You are a website analysis assistant. Parse user questions about websites and determine:
1. What type of analysis they want (buttons, logos, favicon, navigation, or compare)
2. Which URL(s) they're asking about

Return JSON with this exact structure:
{
  "analysisType": "buttons" | "logos" | "favicon" | "navigation" | "compare" | "unknown",
  "urls": ["url1", "url2"],
  "rawQuestion": "the original question"
}

Rules:
- analysisType "compare" if they mention dev/prod, development/production, or comparing two URLs
- Extract all URLs mentioned (add https:// if missing)
- If no URL found, use empty array for urls
- Always include the rawQuestion field`
              },
              {
                role: "user",
                content: question
              }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 8192,
          });

          const content = result.choices[0]?.message?.content;
          if (!content) {
            throw new Error("No response from OpenAI");
          }

          const parsed = JSON.parse(content) as ParsedQuestion;
          return parsed;
        } catch (error: any) {
          if (isRateLimitError(error)) {
            throw error; // Rethrow to trigger p-retry
          }
          // For non-rate-limit errors, don't retry
          throw error;
        }
      },
      {
        retries: 7,
        minTimeout: 2000,
        maxTimeout: 128000,
        factor: 2,
      }
    );

    return response;
  } catch (error) {
    console.error("Error parsing question:", error);
    // Return a default structure if parsing fails
    return {
      analysisType: "unknown",
      urls: [],
      rawQuestion: question
    };
  }
}
