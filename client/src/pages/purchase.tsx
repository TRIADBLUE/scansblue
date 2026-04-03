import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Shield, FileText, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SITE_CONFIG } from "@/config/site-config";

type PlanType = "comprehensive" | "bundle";

const planDetails: Record<PlanType, { label: string; price: number; priceLabel: string; description: string }> = {
  comprehensive: {
    label: SITE_CONFIG.pricing.comprehensive.label,
    price: SITE_CONFIG.pricing.comprehensive.price,
    priceLabel: SITE_CONFIG.pricing.comprehensive.priceLabel,
    description: "Full site crawl and prioritized report delivered to your email.",
  },
  bundle: {
    label: SITE_CONFIG.pricing.bundle.label,
    price: SITE_CONFIG.pricing.bundle.price,
    priceLabel: SITE_CONFIG.pricing.bundle.priceLabel,
    description: "Full site report plus 5 auditor questions about your site for 24 hours.",
  },
};

export default function Purchase() {
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [plan, setPlan] = useState<PlanType>("comprehensive");
  const [canceled, setCanceled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("canceled") === "true") setCanceled(true);
    const urlParam = params.get("url");
    if (urlParam) setWebsiteUrl(urlParam);
    const planParam = params.get("plan");
    if (planParam === "bundle" || planParam === "comprehensive") setPlan(planParam);
  }, []);

  const currentPlan = planDetails[plan];

  const checkoutMutation = useMutation({
    mutationFn: async (data: { email: string; websiteUrl: string; plan: PlanType }) => {
      const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const response = await apiRequest("POST", "/api/checkout", {
        assessmentId,
        email: data.email,
        websiteUrl: data.websiteUrl,
        plan: data.plan,
        amount: planDetails[data.plan].price,
      });
      return (await response.json()) as { checkoutUrl: string; sessionId: string; purchaseId: string };
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
    onError: (error: Error) => {
      toast({ title: "Checkout Failed", description: error.message || "Could not start checkout. Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !websiteUrl.trim()) {
      toast({ title: "Required Fields", description: "Please enter your email and the website URL to analyze.", variant: "destructive" });
      return;
    }
    checkoutMutation.mutate({ email, websiteUrl, plan });
  };

  const isLoading = checkoutMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: SITE_CONFIG.colors.foreground }}>
            {currentPlan.label}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: SITE_CONFIG.colors.foreground }}>
            {currentPlan.description}
          </p>
        </div>

        {canceled && (
          <div
            className="mb-6 p-4 text-center"
            style={{
              backgroundColor: `${SITE_CONFIG.colors.warning}0D`,
              border: `1px solid ${SITE_CONFIG.colors.warning}33`,
              borderRadius: "1rem",
            }}
          >
            <p style={{ color: SITE_CONFIG.colors.foreground }}>
              Your checkout was canceled. No charge was made. You can try again whenever you're ready.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* What You Get */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: SITE_CONFIG.colors.accent }} />
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                <div>
                  <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>Up to 50 pages crawled</p>
                  <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Every page on your site gets analyzed, not just the homepage</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                <div>
                  <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>Accessibility audit</p>
                  <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Missing alt text, broken heading structure, missing ARIA labels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                <div>
                  <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>SEO issues identified</p>
                  <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Missing meta descriptions, duplicate headings, broken links</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                <div>
                  <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>Performance check</p>
                  <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Unoptimized images, slow-loading assets, rendering issues</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                <div>
                  <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>Prioritized task list</p>
                  <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Every issue ranked by priority with clear steps to fix it</p>
                </div>
              </div>

              {plan === "bundle" && (
                <>
                  <div className="border-t pt-4 mt-4" style={{ borderColor: "hsl(214 18% 85%)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5" style={{ color: SITE_CONFIG.colors.accent }} />
                      <p className="font-semibold" style={{ color: SITE_CONFIG.colors.foreground }}>Auditor Access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                    <div>
                      <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>5 questions about your site</p>
                      <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Ask anything — code, SEO, security, content, architecture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                    <div>
                      <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>24-hour access</p>
                      <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Use your questions anytime within 24 hours of purchase</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                    <div>
                      <p className="font-medium" style={{ color: SITE_CONFIG.colors.foreground }}>
                        {SITE_CONFIG.pricing.additionalQuestions.priceLabel} for {SITE_CONFIG.pricing.additionalQuestions.questionsIncluded} more anytime
                      </p>
                      <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Need more answers? Add questions at any time after purchase</p>
                    </div>
                  </div>
                </>
              )}

              <div
                className="mt-6 p-4"
                style={{
                  backgroundColor: `${SITE_CONFIG.colors.accent}0D`,
                  border: `1px solid ${SITE_CONFIG.colors.accent}33`,
                  borderRadius: "0.875rem",
                }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: SITE_CONFIG.colors.accent }}>WHAT THIS MEANS FOR YOUR BUSINESS</p>
                <p className="text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>
                  Instead of guessing what's wrong with your website, you get a clear checklist of exactly what to fix — in order of what matters most. No technical knowledge needed to understand the results.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlan("comprehensive")}
                className="p-4 text-left transition-colors"
                style={{
                  borderRadius: "1rem",
                  border: plan === "comprehensive" ? `2px solid ${SITE_CONFIG.colors.primary}` : "2px solid hsl(214 18% 85%)",
                  backgroundColor: plan === "comprehensive" ? `${SITE_CONFIG.colors.primary}08` : "white",
                }}
                data-transparent="true"
              >
                <p className="font-semibold text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>Report Only</p>
                <p className="text-xl font-bold mt-1" style={{ color: SITE_CONFIG.colors.foreground }}>{SITE_CONFIG.pricing.comprehensive.priceLabel}</p>
                <p className="text-xs mt-1" style={{ color: SITE_CONFIG.colors.muted }}>{SITE_CONFIG.pricing.comprehensive.priceNote}</p>
              </button>
              <button
                type="button"
                onClick={() => setPlan("bundle")}
                className="p-4 text-left transition-colors relative"
                style={{
                  borderRadius: "1rem",
                  border: plan === "bundle" ? `2px solid ${SITE_CONFIG.colors.primary}` : "2px solid hsl(214 18% 85%)",
                  backgroundColor: plan === "bundle" ? `${SITE_CONFIG.colors.primary}08` : "white",
                }}
                data-transparent="true"
              >
                <Badge
                  className="absolute -top-2.5 right-3 text-xs px-2"
                  style={{ backgroundColor: SITE_CONFIG.colors.brandRed, color: "#FFFFFF" }}
                >
                  Best Value
                </Badge>
                <p className="font-semibold text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>Report + Auditor</p>
                <p className="text-xl font-bold mt-1" style={{ color: SITE_CONFIG.colors.foreground }}>{SITE_CONFIG.pricing.bundle.priceLabel}</p>
                <p className="text-xs mt-1" style={{ color: SITE_CONFIG.colors.muted }}>{SITE_CONFIG.pricing.bundle.priceNote}</p>
              </button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {currentPlan.label}
                  </CardTitle>
                  <Badge
                    className="text-lg px-3 py-1"
                    style={{ backgroundColor: SITE_CONFIG.colors.primary, color: "#FFFFFF" }}
                  >
                    {currentPlan.priceLabel}
                  </Badge>
                </div>
                <CardDescription>
                  One-time purchase. No subscription. No hidden fees.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Your Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@yourbusiness.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>We'll send your completed report here</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website to Analyze
                    </Label>
                    <Input
                      id="websiteUrl"
                      type="text"
                      placeholder="yourbusiness.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>Subdomains are analyzed separately</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !websiteUrl.trim()}
                    className="w-full h-12 font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: SITE_CONFIG.colors.primary, borderRadius: "0.75rem" }}
                    data-transparent="true"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting to checkout...
                      </>
                    ) : (
                      `${currentPlan.label} — ${currentPlan.priceLabel}`
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: SITE_CONFIG.colors.muted }}>
              <Shield className="w-4 h-4" />
              <span>Secure payment processed by swipesblue.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
