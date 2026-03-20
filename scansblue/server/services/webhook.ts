import pRetry from "p-retry";

export interface WebhookPayload {
  event: "analysis_complete" | "batch_complete" | "website_analysis_complete";
  timestamp: string;
  result: any;
  originalRequest?: string;
  originalRequests?: any[];
  fromCache?: boolean;
}

export async function sendWebhook(url: string, payload: WebhookPayload): Promise<void> {
  try {
    await pRetry(
      async () => {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "ScansBlue/1.0",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status ${response.status}`);
        }
      },
      {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 5000,
        factor: 2,
      }
    );
  } catch (error: any) {
    console.error(`Failed to send webhook to ${url}:`, error.message);
    // Don't throw - webhook failures shouldn't block the response
  }
}
