import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { WebsiteAnalysisResponse } from "@shared/schema";

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
    const icons: Record<string, string> = {
      accessibility: "♿",
      performance: "⚡",
      seo: "🔍",
      ux: "👥",
      security: "🔒",
      content: "📝",
    };
    return icons[category] || "📌";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Website Analysis</h1>
          <p className="text-slate-300">
            Crawl your entire website and generate a prioritized task list to improve it
          </p>
        </div>

        <Card className="p-6 mb-8 bg-slate-800 border-slate-700">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., example.com or https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={analysisMutation.isPending}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              data-testid="input-website-url"
            />
            <Button
              onClick={handleAnalyze}
              disabled={analysisMutation.isPending || !url.trim()}
              data-testid="button-analyze"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analysisMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </Card>

        {analysisMutation.isError && (
          <Card className="p-6 mb-8 bg-red-900/20 border-red-700">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-300">Analysis Error</h3>
                <p className="text-red-200 text-sm">
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
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Analysis Summary</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-700 p-4 rounded">
                  <p className="text-slate-400 text-sm">Pages Analyzed</p>
                  <p className="text-2xl font-bold text-white">
                    {analysisMutation.data.pagesAnalyzed.length}
                  </p>
                </div>
                <div className="bg-slate-700 p-4 rounded">
                  <p className="text-slate-400 text-sm">Total Issues</p>
                  <p className="text-2xl font-bold text-white">
                    {analysisMutation.data.totalIssues}
                  </p>
                </div>
                <div className="bg-slate-700 p-4 rounded">
                  <p className="text-slate-400 text-sm">Tasks Generated</p>
                  <p className="text-2xl font-bold text-white">
                    {analysisMutation.data.tasks.length}
                  </p>
                </div>
              </div>
              <p className="text-slate-300 text-lg">{analysisMutation.data.summary}</p>
            </Card>

            {/* Tasks List */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Action Items</h2>
              <div className="space-y-3">
                {analysisMutation.data.tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 transition"
                    data-testid={`card-task-${task.id}`}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white text-lg">{task.title}</h3>
                          <div className="flex gap-2 ml-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="text-slate-300 border-slate-600">
                              {task.estimatedEffort}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-slate-300 mb-3">{task.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {task.affectedPages.slice(0, 3).map((page, idx) => (
                            <code
                              key={idx}
                              className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded"
                            >
                              {new URL(page).pathname || page}
                            </code>
                          ))}
                          {task.affectedPages.length > 3 && (
                            <span className="text-xs text-slate-400">
                              +{task.affectedPages.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-slate-600 hover:text-slate-400 cursor-pointer transition" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pages Analyzed */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="font-semibold text-white mb-3">Pages Crawled</h3>
              <div className="space-y-1">
                {analysisMutation.data.pagesAnalyzed.map((page) => (
                  <p key={page} className="text-slate-300 text-sm font-mono">
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
