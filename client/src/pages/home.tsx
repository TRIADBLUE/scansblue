import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Zap, Eye, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AgentResponse } from "@shared/schema";
import agentLogo from "@assets/siteinspetor-logo_1764201469395.png";

export default function Home() {
  const [url, setUrl] = useState("");
  const [analysisType, setAnalysisType] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/agent", { content: question });
      return await response.json() as AgentResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Website analysis successful.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze website.",
        variant: "destructive",
      });
    },
  });

  const analysisButtons = [
    { label: "Buttons", desc: "List all buttons with text, links, location, state", question: `List all buttons on ${url} with their text, links, location on page, and styling state` },
    { label: "Logos", desc: "Find and screenshot all logo instances", question: `Find all logo instances on ${url}, show where they appear and their attributes` },
    { label: "Favicon", desc: "Check favicon presence", question: `What is the favicon on ${url}?` },
    { label: "Navigation", desc: "Visual tree of menu structure", question: `Analyze the navigation structure on ${url} as a visual tree with menu hierarchy, links, and button names` },
    { label: "Accessibility", desc: "Check accessibility issues", question: `Check accessibility issues on ${url}` },
    { label: "Forms", desc: "Extract form fields and types", question: `Find all forms on ${url} and list their fields, types, and required status` },
    { label: "Images", desc: "Analyze all images on page", question: `Analyze all images on ${url} including alt text coverage` },
    { label: "Headings", desc: "Check heading structure", question: `Analyze the heading structure on ${url} for H1-H6 hierarchy and issues` },
    { label: "Comprehensive", desc: "Full multi-section website audit", question: `Perform a comprehensive analysis of ${url} including all elements: buttons, logos, navigation, forms, images, headings, and accessibility issues` },
  ];

  const handleAnalysis = (question: string, type: string) => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }
    setAnalysisType(type);
    analysisMutation.mutate(question);
  };

  const isLoading = analysisMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={agentLogo}
              alt="Inspector Agent"
              className="h-16 sm:h-20 object-contain"
            />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze any website with powerful AI-driven inspections. Enter a URL and choose your analysis.
          </p>
        </div>

        {/* URL Input Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Website URL
            </CardTitle>
            <CardDescription>
              Enter the website you want to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                data-testid="input-url"
                type="url"
                placeholder="e.g., example.com or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                data-testid="button-clear-url"
                type="button"
                variant="outline"
                onClick={() => {
                  setUrl("");
                  setResult(null);
                  analysisMutation.reset();
                }}
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Analysis
            </CardTitle>
            <CardDescription>
              Choose what to analyze on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysisButtons.map((btn) => (
                <div key={btn.label} className="space-y-1">
                  <Button
                    data-testid={`button-analysis-${btn.label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => handleAnalysis(btn.question, btn.label)}
                    disabled={isLoading || !url.trim()}
                    variant={analysisType === btn.label && isLoading ? "default" : "outline"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    {analysisType === btn.label && isLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Eye className="w-3 h-3 mr-1" />
                    )}
                    {btn.label}
                  </Button>
                  <p className="text-xs text-muted-foreground px-1">{btn.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card data-testid="card-result">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Analysis Result - {analysisType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div
                  data-testid="text-result"
                  className="whitespace-pre-wrap text-foreground leading-relaxed text-sm font-result"
                >
                  {result.content}
                </div>
              </div>
              {result.screenshot && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Screenshot:</p>
                  <img
                    src={`data:image/png;base64,${result.screenshot}`}
                    alt="Website screenshot"
                    className="max-w-full border rounded"
                    data-testid="img-screenshot"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
