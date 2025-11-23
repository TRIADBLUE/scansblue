import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { WebsiteAnalysisResponse } from "@shared/schema";

interface SiteStatus {
  name: string;
  url: string;
  icon: string;
  description: string;
  result?: WebsiteAnalysisResponse;
  loading?: boolean;
  error?: string;
}

const TRIAD_BLUE_SITES: SiteStatus[] = [
  {
    name: "HostsBlue",
    url: "hostsblue.io",
    icon: "🖥️",
    description: "Web Hosting Infrastructure",
  },
  {
    name: "SwipesBlue",
    url: "swipesblue.io",
    icon: "💳",
    description: "Payment Gateway",
  },
  {
    name: "TriadBlue",
    url: "triadblue.io",
    icon: "🔗",
    description: "Main Hub & Management",
  },
];

export default function Dashboard() {
  const [sites, setSites] = useState<SiteStatus[]>(TRIAD_BLUE_SITES);

  const analyzeSite = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/agent/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<WebsiteAnalysisResponse>;
    },
    onSuccess: (data, url) => {
      setSites(prev =>
        prev.map(site =>
          site.url === url
            ? { ...site, result: data, loading: false, error: undefined }
            : site
        )
      );
    },
    onError: (error, url) => {
      setSites(prev =>
        prev.map(site =>
          site.url === url
            ? {
                ...site,
                loading: false,
                error: error instanceof Error ? error.message : "Analysis failed",
              }
            : site
        )
      );
    },
  });

  const handleAnalyze = (url: string) => {
    setSites(prev =>
      prev.map(site =>
        site.url === url ? { ...site, loading: true } : site
      )
    );
    analyzeSite.mutate(url);
  };

  const getStatusColor = (totalIssues: number): string => {
    if (totalIssues === 0) return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (totalIssues < 10) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  };

  const getPriorityCount = (tasks: any[], priority: string) => {
    return tasks.filter(t => t.priority === priority).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Triad Blue Health Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor and analyze all your connected services
          </p>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <Card
              key={site.url}
              className="p-6 hover:shadow-lg transition-shadow"
              data-testid={`card-site-${site.url}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{site.icon}</span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {site.name}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {site.description}
                  </p>
                </div>
              </div>

              {/* Status */}
              {site.result && !site.loading && !site.error && (
                <div className="mb-4 space-y-3">
                  <div className={`p-3 rounded-lg ${getStatusColor(site.result.totalIssues)}`}>
                    <div className="flex items-center gap-2">
                      {site.result.totalIssues === 0 ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-semibold">All Clear</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">{site.result.totalIssues} Issues Found</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Priority Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {["critical", "high"].map(priority => {
                      const count = getPriorityCount(site.result.tasks, priority);
                      if (count === 0) return null;
                      return (
                        <div key={priority} className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                          <div className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                            {priority}
                          </div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pages Analyzed */}
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {site.result.pagesAnalyzed.length} page{site.result.pagesAnalyzed.length !== 1 ? "s" : ""} analyzed
                  </div>
                </div>
              )}

              {/* Error State */}
              {site.error && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {site.error}
                </div>
              )}

              {/* Loading State */}
              {site.loading && (
                <div className="mb-4 p-3 bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={() => handleAnalyze(site.url)}
                disabled={site.loading || analyzeSite.isPending}
                className="w-full"
                data-testid={`button-analyze-${site.url}`}
              >
                {site.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing
                  </>
                ) : site.result ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Re-analyze
                  </>
                ) : (
                  "Analyze Now"
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Summary */}
        {sites.some(s => s.result) && (
          <Card className="mt-8 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Overall Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {sites.filter(s => s.result).length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Sites Analyzed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {sites.reduce((sum, s) => sum + (s.result?.tasks.filter(t => t.priority === "critical").length || 0), 0)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Critical Issues
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {sites.reduce((sum, s) => sum + (s.result?.tasks.filter(t => t.priority === "high").length || 0), 0)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  High Priority
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {sites.reduce((sum, s) => sum + (s.result?.totalIssues || 0), 0)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Total Issues
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
