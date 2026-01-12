import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2, Accessibility, Zap, Search, Users, Shield, FileText, Pin } from "lucide-react";
import type { WebsiteAnalysisResponse } from "@shared/schema";
import comprehensiveIcon from "@assets/comprehensive_icon_1768197865904.png";

export default function WebsiteAnalysis() {
  const [url, setUrl] = useState("");

  const analysisMutation = useMutation({
    mutationFn: async (siteUrl: string) => {
      const res = await fetch("/api/agent/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<WebsiteAnalysisResponse>;
    },
  });

  const handleAnalyze = () => {
    if (url.trim()) {
      analysisMutation.mutate(url);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, typeof Accessibility> = {
      accessibility: Accessibility,
      performance: Zap,
      seo: Search,
      ux: Users,
      security: Shield,
      content: FileText,
    };
    const IconComponent = iconMap[category] || Pin;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-primary">
            Your Site Inspector Agent
          </h1>
          <p className="text-xl sm:text-2xl mb-3">
            <span className="text-secondary font-bold">Website Analysis,</span>{' '}
            <span className="text-primary font-bold">Clarified</span>
          </p>
          <p className="text-lg max-w-2xl mx-auto text-foreground">
            Understand structure, performance, and hidden issues instantly
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
            <img src={comprehensiveIcon} alt="" className="w-6 h-6" />
            Comprehensive Analysis
          </h2>
          <p className="text-muted-foreground">
            Crawl your entire website and generate a prioritized task list to improve it
          </p>
        </div>

        <Card className="p-6 mb-8 border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., example.com or https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={analysisMutation.isPending}
              className="flex-1"
              data-testid="input-website-url"
            />
            <Button
              onClick={handleAnalyze}
              disabled={analysisMutation.isPending || !url.trim()}
              data-testid="button-analyze"
            >
              {analysisMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </Card>

        {analysisMutation.isError && (
          <Card className="p-6 mb-8 border-destructive/20 bg-destructive/5">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">Analysis Error</h3>
                <p className="text-sm text-destructive/80">
                  {analysisMutation.error instanceof Error
                    ? analysisMutation.error.message
                    : "Failed to analyze website"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {analysisMutation.data && (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Analysis Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Pages Analyzed</p>
                  <p className="text-2xl font-bold">
                    {analysisMutation.data.pagesAnalyzed.length}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Total Issues</p>
                  <p className="text-2xl font-bold">
                    {analysisMutation.data.totalIssues}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Tasks Generated</p>
                  <p className="text-2xl font-bold">
                    {analysisMutation.data.tasks.length}
                  </p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed font-result">
                {analysisMutation.data.summary}
              </p>
            </Card>

            {/* Tasks List */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">Action Items</h2>
              <div className="grid gap-4">
                {analysisMutation.data.tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 hover:shadow-md transition-shadow"
                    data-testid={`card-task-${task.id}`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0 flex items-start">
                        <span className="text-2xl" role="img" aria-label={task.category}>
                          {getCategoryIcon(task.category)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h3 className="font-bold text-lg">{task.title}</h3>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {task.estimatedEffort}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-slate-600 mb-4 text-sm leading-relaxed font-result">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {task.affectedPages.slice(0, 3).map((page, idx) => (
                            <code
                              key={idx}
                              className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono"
                            >
                              {new URL(page).pathname || page}
                            </code>
                          ))}
                          {task.affectedPages.length > 3 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{task.affectedPages.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pages Analyzed */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Pages Crawled</h3>
              <div className="grid gap-1">
                {analysisMutation.data.pagesAnalyzed.map((page) => (
                  <p key={page} className="text-xs text-muted-foreground font-mono truncate">
                    {page}
                  </p>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
