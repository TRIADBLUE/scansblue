import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Lightbulb, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditResponse {
  analysis: string;
  issues: string[];
  suggestions: string[];
}

export default function CodeAuditor() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AuditResponse | null>(null);

  const auditMutation = useMutation({
    mutationFn: async () => {
      if (!code.trim()) {
        throw new Error("Please enter code to audit");
      }

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          question: question || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Audit failed");
      }

      return response.json() as Promise<AuditResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Code audit complete",
        description: "Analysis ready below",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Audit failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Auditor</h1>
        <p className="text-muted-foreground">
          Get independent code review and evaluation using DeepSeek AI. Verify what code actually does vs. what you were told.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                data-testid="select-language"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="jsx">JSX/TSX</option>
                <option value="sql">SQL</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Code to Audit</label>
              <Textarea
                placeholder="Paste the code you want audited here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm min-h-[300px]"
                data-testid="input-code"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {code.length} characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Specific Question (Optional)
              </label>
              <Input
                placeholder="e.g., 'Does this code handle errors?' or 'Is this implementation complete?'"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                data-testid="input-question"
              />
            </div>

            <Button
              onClick={() => auditMutation.mutate()}
              disabled={auditMutation.isPending || !code.trim()}
              className="w-full"
              size="lg"
              data-testid="button-audit"
            >
              {auditMutation.isPending ? "Analyzing..." : "Run Audit"}
            </Button>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {auditMutation.isPending && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="inline-block">
                  <Zap className="w-12 h-12 text-yellow-500 animate-pulse" />
                </div>
                <p className="text-muted-foreground">
                  DeepSeek is analyzing your code...
                </p>
              </div>
            </Card>
          )}

          {result && (
            <>
              {/* Full Analysis */}
              <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Full Analysis</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {result.analysis}
                  </p>
                </div>
              </Card>

              {/* Issues */}
              {result.issues.length > 0 && (
                <Card className="p-6 space-y-3 border-red-200 dark:border-red-900">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold">Issues Found</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.issues.map((issue, idx) => (
                      <li
                        key={idx}
                        className="text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded text-foreground"
                        data-testid={`issue-${idx}`}
                      >
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <Card className="p-6 space-y-3 border-blue-200 dark:border-blue-900">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Suggestions</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="text-sm p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-foreground"
                        data-testid={`suggestion-${idx}`}
                      >
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {result.issues.length === 0 && result.suggestions.length === 0 && (
                <Card className="p-6 space-y-3 border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Analysis Complete</h3>
                  </div>
                  <p className="text-sm text-foreground">
                    See the full analysis above for detailed findings.
                  </p>
                </Card>
              )}
            </>
          )}

          {!result && !auditMutation.isPending && (
            <Card className="p-6 text-center text-muted-foreground">
              <p>Audit results will appear here</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
