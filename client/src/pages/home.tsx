import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Sparkles, Globe, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AgentResponse } from "@shared/schema";

export default function Home() {
  const [question, setQuestion] = useState("");
  const { toast } = useToast();

  const analyzeWebsite = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest<AgentResponse>("POST", "/api/agent", { content });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Your website has been analyzed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze website. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question about a website.",
        variant: "destructive",
      });
      return;
    }
    analyzeWebsite.mutate(question);
  };

  const exampleQuestions = [
    "How many buttons are on google.com?",
    "Find logos on github.com",
    "Check favicon on replit.com",
    "Analyze navigation on stripe.com",
  ];

  const handleExampleClick = (example: string) => {
    setQuestion(example);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Site Inspector Agent
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask natural language questions about any website. Powered by AI and browser automation.
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Ask a Question
            </CardTitle>
            <CardDescription>
              Enter any question about a website's structure, elements, or configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  data-testid="input-question"
                  placeholder="e.g., How many buttons are on example.com?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-24 resize-none"
                  disabled={analyzeWebsite.isPending}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  data-testid="button-analyze"
                  type="submit"
                  disabled={analyzeWebsite.isPending || !question.trim()}
                  className="sm:flex-1"
                >
                  {analyzeWebsite.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Website
                    </>
                  )}
                </Button>
                <Button
                  data-testid="button-clear"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setQuestion("");
                    analyzeWebsite.reset();
                  }}
                  disabled={analyzeWebsite.isPending}
                >
                  Clear
                </Button>
              </div>
            </form>

            {/* Example Questions */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Try these examples:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((example, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover-elevate"
                    onClick={() => handleExampleClick(example)}
                    data-testid={`badge-example-${idx}`}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {analyzeWebsite.data && (
          <Card data-testid="card-result">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div
                  data-testid="text-result"
                  className="whitespace-pre-wrap text-foreground leading-relaxed"
                >
                  {analyzeWebsite.data.content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="w-4 h-4" />
                Element Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Count buttons, links, forms, and other interactive elements on any page
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4" />
                Logo Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Find and measure logos with detailed size and location information
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Favicon Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verify favicon setup and check if it loads successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Environment Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compare dev vs production environments side-by-side
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Info */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">API Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block bg-background px-4 py-3 rounded-md text-sm font-mono">
              POST /api/agent
            </code>
            <p className="text-sm text-muted-foreground mt-3">
              Send JSON with <code className="bg-background px-1.5 py-0.5 rounded text-xs">{"{ \"content\": \"your question\" }"}</code> to get conversational analysis results.
            </p>
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
              <strong>Note:</strong> Browser automation requires Chromium system dependencies. In development environments without these dependencies, 
              you may see errors. This service is designed for production deployment where browser dependencies can be properly installed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
