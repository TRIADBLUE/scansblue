import pRetry from "p-retry";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
  console.warn("DEEPSEEK_API_KEY not set. Code auditing will be unavailable.");
}

export interface CodeAuditRequest {
  code: string;
  language?: string;
  question?: string;
}

export interface CodeAuditResponse {
  analysis: string;
  issues: string[];
  suggestions: string[];
}

export async function auditCode(request: CodeAuditRequest): Promise<CodeAuditResponse> {
  if (!API_KEY) {
    throw new Error("DeepSeek API key not configured");
  }

  const { code, language = "javascript", question } = request;

  const prompt = question
    ? `You are a code auditor. Analyze the following ${language} code and answer this question: ${question}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a detailed analysis with specific issues and actionable suggestions.`
    : `You are a code auditor. Perform a comprehensive review of the following ${language} code. Identify any issues, problems, missing functionality, or areas for improvement.\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:\n1. Summary of what the code does\n2. Identified issues or problems\n3. Missing functionality or incomplete parts\n4. Suggestions for improvement\n5. Security considerations if applicable`;

  return pRetry(
    async () => {
      const response = await fetch(DEEPSEEK_API_URL, {
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
              content:
                "You are an expert code auditor and software architect. You provide thorough, independent code reviews and evaluations. You are critical and honest about what code does and does not do. You verify claims independently and identify gaps between what someone claims was built vs what actually exists in the code.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from DeepSeek API");
      }

      const content = data.choices[0].message.content;

      // Parse the response to extract issues and suggestions
      const issues: string[] = [];
      const suggestions: string[] = [];

      const lines = content.split("\n");
      let currentSection = "";

      for (const line of lines) {
        if (line.toLowerCase().includes("issue") || line.toLowerCase().includes("problem")) {
          currentSection = "issues";
        } else if (
          line.toLowerCase().includes("suggestion") ||
          line.toLowerCase().includes("improvement")
        ) {
          currentSection = "suggestions";
        } else if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
          const item = line.trim().substring(1).trim();
          if (item) {
            if (currentSection === "issues") {
              issues.push(item);
            } else if (currentSection === "suggestions") {
              suggestions.push(item);
            }
          }
        }
      }

      return {
        analysis: content,
        issues: issues.length > 0 ? issues : extractSentences(content, 3),
        suggestions: suggestions.length > 0 ? suggestions : extractSentences(content, 2),
      };
    },
    {
      retries: 2,
      onFailedAttempt: (error: any) => {
        console.error(
          `DeepSeek API attempt ${error.attemptNumber} failed:`,
          error.message || error.toString()
        );
      },
    }
  );
}

function extractSentences(text: string, count: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, count).map((s) => s.trim());
}
