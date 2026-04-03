import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, FileText, Mail, Globe } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { SITE_CONFIG } from "@/config/site-config";

interface VerifyResult {
  paid: boolean;
  assessmentId?: string;
  customerEmail?: string;
  purchaseId?: string;
}

export default function Success() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id"));
  }, []);

  const { data, isLoading, isError } = useQuery<VerifyResult>({
    queryKey: ["/api/verify-session", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      const res = await apiRequest("GET", `/api/verify-session?session_id=${sessionId}`);
      return await res.json();
    },
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 2000,
  });

  const paid = data?.paid;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8 sm:py-16">
        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: SITE_CONFIG.colors.accent }} />
              <p className="text-lg font-medium">Verifying your payment...</p>
              <p className="text-sm text-muted-foreground mt-2">This will only take a moment.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && paid && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Payment Confirmed</CardTitle>
                <CardDescription className="text-base">
                  Your full website report is being generated now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  {data.customerEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Report will be sent to</p>
                        <p className="font-medium">{data.customerEmail}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Report status</p>
                      <Badge style={{ backgroundColor: SITE_CONFIG.colors.accent, color: "#FFFFFF" }}>Processing</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">What happens next</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: SITE_CONFIG.colors.primary }}>1</div>
                      <p className="text-sm">Our scanner is crawling your website right now — up to 50 pages analyzed.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: SITE_CONFIG.colors.primary }}>2</div>
                      <p className="text-sm">Every page gets checked for accessibility, SEO, performance, and content issues.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: SITE_CONFIG.colors.primary }}>3</div>
                      <p className="text-sm">Your report with a prioritized task list will be delivered to your email.</p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: `${SITE_CONFIG.colors.accent}0D`,
                    border: `1px solid ${SITE_CONFIG.colors.accent}33`,
                  }}
                >
                  <p className="text-sm">
                    Reports typically complete within a few minutes. If your site has many pages, it may take a bit longer. You'll receive an email as soon as it's ready.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Link href="/">
                <button className="text-sm text-muted-foreground hover:text-foreground underline">
                  Run a free quick scan while you wait
                </button>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !paid && !isError && sessionId && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Globe className="w-12 h-12 text-yellow-500 mb-4" />
              <p className="text-lg font-medium">Payment not yet confirmed</p>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Your payment is still being processed. This page will update automatically, or you can refresh in a moment.
              </p>
            </CardContent>
          </Card>
        )}

        {(isError || (!isLoading && !sessionId)) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Globe className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Could not verify payment</p>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                If you completed a purchase, your report will still be generated and sent to your email. If you need help, contact support.
              </p>
              <Link href="/purchase">
                <button className="mt-4 px-4 py-2 rounded-md text-white font-medium" style={{ backgroundColor: SITE_CONFIG.colors.primary }}>
                  Back to Purchase
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
