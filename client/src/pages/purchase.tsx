import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Shield, FileText, CheckCircle2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Purchase() {
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [canceled, setCanceled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("canceled") === "true") {
      setCanceled(true);
    }
    const urlParam = params.get("url");
    if (urlParam) {
      setWebsiteUrl(urlParam);
    }
  }, []);

  const checkoutMutation = useMutation({
    mutationFn: async (data: { email: string; websiteUrl: string }) => {
      const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const response = await apiRequest("POST", "/api/checkout", {
        assessmentId,
        email: data.email,
        websiteUrl: data.websiteUrl,
      });
      return await response.json() as { checkoutUrl: string; sessionId: string; purchaseId: string };
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "Could not start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !websiteUrl.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter your email and the website URL to analyze.",
        variant: "destructive",
      });
      return;
    }
    checkoutMutation.mutate({ email, websiteUrl });
  };

  const isLoading = checkoutMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-primary">
            Full Website Report
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-foreground">
            Get a complete analysis of your website — every page crawled, every issue identified, with clear next steps to improve your online presence.
          </p>
        </div>

        {canceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800">
              Your checkout was canceled. No charge was made. You can try again whenever you're ready.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* What You Get */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E00420]" />
                What Your Report Includes
              </CardTitle>
              <CardDescription>
                A thorough scan of your entire website, not just the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Up to 50 pages crawled</p>
                  <p className="text-sm text-muted-foreground">Every page on your site gets analyzed, not just the homepage</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Accessibility audit</p>
                  <p className="text-sm text-muted-foreground">Missing alt text, broken heading structure, missing ARIA labels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">SEO issues identified</p>
                  <p className="text-sm text-muted-foreground">Missing meta descriptions, duplicate headings, broken links</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Performance check</p>
                  <p className="text-sm text-muted-foreground">Unoptimized images, slow-loading assets, rendering issues</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Prioritized task list</p>
                  <p className="text-sm text-muted-foreground">Every issue ranked by priority with clear steps to fix it</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#E00420]/5 border border-[#E00420]/20 rounded-lg">
                <p className="text-sm font-semibold text-[#E00420] mb-1">WHAT THIS MEANS FOR YOUR BUSINESS</p>
                <p className="text-sm text-foreground">
                  Instead of guessing what's wrong with your website, you get a clear checklist of exactly what to fix — in order of what matters most. No technical knowledge needed to understand the results.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Order Your Report
                  </CardTitle>
                  <Badge className="bg-[#E00420] text-white text-lg px-3 py-1">$10</Badge>
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
                    <p className="text-xs text-muted-foreground">We'll send your completed report here</p>
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
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !websiteUrl.trim()}
                    className="w-full h-12 rounded-md font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: "#FF6B00" }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting to checkout...
                      </>
                    ) : (
                      "Get Your Full Report — $10"
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure payment processed by swipesblue.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
