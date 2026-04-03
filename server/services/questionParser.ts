import pRetry from "p-retry";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

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
  analysisType: "buttons" | "logos" | "favicon" | "navigation" | "accessibility" | "forms" | "images" | "headings" | "compare" | "comprehensive" | "unknown";
  urls: string[];
  rawQuestion: string;
  comparisonSubtype?: "buttons" | "logos" | "favicon" | "navigation";
}

export async function parseUserQuestion(question: string): Promise<ParsedQuestion> {
  if (!API_KEY) {
    console.warn("DEEPSEEK_API_KEY not set. Question parsing will use fallback.");
    return {
      analysisType: "unknown",
      urls: [],
      rawQuestion: question
    };
  }

  try {
    const response = await pRetry(
      async () => {
        const result = await fetch(DEEPSEEK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: `You are a website analysis assistant. Parse user questions about websites and determine:
1. What type of analysis they want (buttons, logos, favicon, navigation, accessibility, forms, images, headings, compare, or comprehensive)
2. Which URL(s) they're asking about

Return JSON with this exact structure:
{
  "analysisType": "buttons" | "logos" | "favicon" | "navigation" | "accessibility" | "forms" | "images" | "headings" | "compare" | "comprehensive" | "unknown",
  "urls": ["url1", "url2"],
  "rawQuestion": "the original question",
  "comparisonSubtype": "buttons" | "logos" | "favicon" | "navigation" (only if analysisType is "compare")
}

Analysis type detection rules:
- analysisType "buttons" if they ask about buttons, clickable elements, or interactive controls
- analysisType "logos" if they ask about logos, branding, or logo instances
- analysisType "favicon" if they ask about favicon, site icon, or page icon
- analysisType "navigation" if they ask about navigation, menu, or menu structure
- analysisType "accessibility" if they mention ARIA, alt text, screen readers, wcag, a11y, or accessibility
- analysisType "forms" if they ask about forms, form fields, input fields, or form controls
- analysisType "images" if they ask about images, pictures, or image analysis
- analysisType "headings" if they ask about headings, heading structure, or H1-H6 tags
- analysisType "compare" if they mention dev/prod, development/production, or comparing two URLs
- analysisType "comprehensive" if they ask for complete analysis, full audit, overall assessment, quality review, business analysis, or mentions structure quality, SEO priorities, execution concerns, button/link trends, inconsistencies
- analysisType "unknown" if you cannot determine the type

For "compare" analysis, also determine comparisonSubtype:
  * "buttons" if they mention buttons, clickable elements, or interactive elements
  * "logos" if they mention logos, images, or branding
  * "favicon" if they mention favicon or site icon
  * "navigation" (default) if they mention navigation, menu, or no specific element type

Rules:
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
            max_tokens: 1024,
          }),
        });

        if (!result.ok) {
          const error = await result.json();
          throw new Error(`DeepSeek API error: ${error.error?.message || result.statusText}`);
        }

        const data = await result.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("No response from DeepSeek");
        }

        return JSON.parse(content) as ParsedQuestion;
      },
      {
        retries: 7,
        minTimeout: 2000,
        maxTimeout: 128000,
        factor: 2,
        shouldRetry: (error: any) => isRateLimitError(error),
      }
    );

    return response;
  } catch (error) {
    console.error("Error parsing question:", error);
    return {
      analysisType: "unknown",
      urls: [],
      rawQuestion: question
    };
  }
}
