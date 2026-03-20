import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Check, AlertTriangle, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import quickAnalysisIcon from "@assets/quick_analysis_icon_1768197865904.png";

interface QuickScanResult {
  url: string;
  pagesScanned: number;
  categories: {
    buttons: { count: number; status: 'ok' | 'warning' | 'error'; message: string };
    logos: { count: number; status: 'ok' | 'warning' | 'error'; message: string };
    favicon: { found: boolean; status: 'ok' | 'warning' | 'error'; message: string };
    navigation: { items: number; status: 'ok' | 'warning' | 'error'; message: string };
    accessibility: { issues: number; status: 'ok' | 'warning' | 'error'; message: string };
    forms: { count: number; status: 'ok' | 'warning' | 'error'; message: string };
    images: { count: number; missingAlt: number; status: 'ok' | 'warning' | 'error'; message: string };
    headings: { h1Count: number; issues: number; status: 'ok' | 'warning' | 'error'; message: string };
  };
  summary: string;
}

const categoryConfig = [
  { key: 'buttons', label: 'Buttons', desc: 'Interactive elements count' },
  { key: 'logos', label: 'Logos', desc: 'Logo detection' },
  { key: 'favicon', label: 'Favicon', desc: 'Browser icon check' },
  { key: 'navigation', label: 'Navigation', desc: 'Menu structure' },
  { key: 'accessibility', label: 'Accessibility', desc: 'A11y issues' },
  { key: 'forms', label: 'Forms', desc: 'Form elements' },
  { key: 'images', label: 'Images', desc: 'Image analysis' },
  { key: 'headings', label: 'Headings', desc: 'Heading structure' },
] as const;

export default function Home() {
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState<QuickScanResult | null>(null);
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: async (targetUrl: string) => {
      const response = await apiRequest("POST", "/api/agent/quick-site-scan", { url: targetUrl });
      return await response.json() as QuickScanResult;
    },
    onSuccess: (data) => {
      setScanResult(data);
      toast({
        title: "Scan Complete",
        description: `Analyzed ${data.pagesScanned} pages successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan website.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }
    scanMutation.mutate(url);
  };

  const handleClear = () => {
    setUrl("");
    setScanResult(null);
    scanMutation.reset();
  };

  const isLoading = scanMutation.isPending;

  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getResultDisplay = (key: string, result: QuickScanResult) => {
    const cat = result.categories[key as keyof typeof result.categories];
    if (!cat) return null;
    
    if (key === 'favicon') {
      const faviconCat = cat as typeof result.categories.favicon;
      return faviconCat.found ? 'Found' : 'Missing';
    }
    if (key === 'accessibility') {
      const a11yCat = cat as typeof result.categories.accessibility;
      return a11yCat.issues === 0 ? 'Approved' : `${a11yCat.issues} issues`;
    }
    if (key === 'images') {
      const imgCat = cat as typeof result.categories.images;
      return imgCat.missingAlt > 0 ? `${imgCat.count} (${imgCat.missingAlt} missing alt)` : `Found ${imgCat.count}`;
    }
    if (key === 'headings') {
      const headCat = cat as typeof result.categories.headings;
      return headCat.issues > 0 ? `${headCat.issues} issues` : `${headCat.h1Count} H1`;
    }
    if ('count' in cat) {
      return `Found ${cat.count}`;
    }
    if ('items' in cat) {
      return `${(cat as typeof result.categories.navigation).items} items`;
    }
    return cat.message;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
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
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
            <img src={quickAnalysisIcon} alt="" className="w-6 h-6" />
            Quick Analysis
            {scanResult && (
              <Badge variant="secondary" className="ml-2">
                {scanResult.pagesScanned} pages scanned
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            {scanResult ? 'Results from site-wide scan' : 'Enter a URL and click "Analyze Site" to scan all categories'}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Website URL
            </CardTitle>
            <CardDescription>
              Enter the website you want to analyze - we'll crawl and scan the entire site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-6 w-full">
              <Input
                data-testid="input-url"
                type="text"
                placeholder="e.g., example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-12"
              />
              <button
                data-testid="button-submit"
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-24 h-12 border-2 flex items-center justify-center rounded-md flex-shrink-0"
                data-transparent="true"
                data-color="blue"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
              </button>
              <button
                data-testid="button-clear"
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="w-12 h-12 border-2 flex items-center justify-center rounded-md flex-shrink-0"
                data-transparent="true"
                data-color="red"
              >
                <X className="w-6 h-6" />
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categoryConfig.map((cat) => {
                const result = scanResult?.categories[cat.key as keyof QuickScanResult['categories']];
                const status = result?.status;
                
                return (
                  <div 
                    key={cat.key}
                    data-testid={`category-${cat.key}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : status ? (
                        getStatusIcon(status)
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.desc}</p>
                      </div>
                    </div>
                    {scanResult && (
                      <Badge 
                        variant={status === 'ok' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                        className="text-xs whitespace-nowrap"
                        data-testid={`result-${cat.key}`}
                      >
                        {getResultDisplay(cat.key, scanResult)}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {scanResult && (
          <Card data-testid="card-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap font-result" data-testid="text-summary">
                {scanResult.summary}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
