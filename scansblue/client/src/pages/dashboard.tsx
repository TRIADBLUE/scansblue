import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react";
import hostsblueLogo from "@assets/hostsblue lockup_1763939344391.png";
import swipesbleLogo from "@assets/SwipesBlue Lockup_1763939375052.png";
import consoleblueLogo from "@assets/ConsoleBlue-logo_1763939414623.png";
import blueprintLogo from "@assets/BBlueprint Main Header Logo_1763939585137.png";
import type { WebsiteAnalysisResponse } from "@shared/schema";

interface SiteStatus {
  name: string;
  url: string;
  logo: string;
  description: string;
  result?: WebsiteAnalysisResponse;
  loading?: boolean;
  error?: string;
}

const TRIAD_BLUE_SITES: SiteStatus[] = [
  {
    name: "HostsBlue",
    url: "hostsblue.io",
    logo: hostsblueLogo,
    description: "Web Hosting Infrastructure",
  },
  {
    name: "SwipesBlue",
    url: "swipesblue.io",
    logo: swipesbleLogo,
    description: "Payment Gateway",
  },
  {
    name: "ConsoleBlue",
    url: "consoleblue.io",
    logo: consoleblueLogo,
    description: "Agent Chat System",
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
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            ScanBlue
          </h1>
          <p className="text-slate-600">
            Monitor and analyze all your connected services
          </p>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sites.map(site => (
            <Card
              key={site.url}
              className="p-6 hover:shadow-lg transition-shadow"
              data-testid={`card-site-${site.url}`}
            >
              {/* Logo */}
              <div className="mb-4 h-16 flex items-center">
                <img 
                  src={site.logo} 
                  alt={site.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {site.description}
              </p>

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

          {/* Business Blueprint Card */}
          <Card
            className="p-6 hover:shadow-lg transition-shadow flex flex-col"
            data-testid="card-site-businessblueprint"
          >
            {/* Logo */}
            <div className="mb-4 h-16 flex items-center">
              <img 
                src={blueprintLogo} 
                alt="Business Blueprint"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-auto">
              Manage subscriptions and customer data
            </p>

            {/* Action Button */}
            <Button
              onClick={() => window.open("https://businessblueprint.io", "_blank")}
              className="w-full mt-4"
              data-testid="button-open-businessblueprint"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Subscriptions
            </Button>
          </Card>
        </div>

        {/* Summary */}
        {sites.some(s => s.result) && (
          <Card className="p-6">
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
