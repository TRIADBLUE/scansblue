import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2, Globe, Check, AlertTriangle, X, Search, ArrowRight,
  FileText, MessageSquare, CheckCircle2, Shield, Tag, Send, Upload,
  Download, Plus, Trash2, Mic, Square, Zap, Mail, ShoppingCart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { SITE_CONFIG, type TabId } from "@/config/site-config";

// ─── Quick Analysis Types ───
interface QuickScanResult {
  url: string;
  pagesScanned: number;
  categories: {
    buttons: { count: number; status: "ok" | "warning" | "error"; message: string };
    logos: { count: number; status: "ok" | "warning" | "error"; message: string };
    favicon: { found: boolean; status: "ok" | "warning" | "error"; message: string };
    navigation: { items: number; status: "ok" | "warning" | "error"; message: string };
    accessibility: { issues: number; status: "ok" | "warning" | "error"; message: string };
    forms: { count: number; status: "ok" | "warning" | "error"; message: string };
    images: { count: number; missingAlt: number; status: "ok" | "warning" | "error"; message: string };
    headings: { h1Count: number; issues: number; status: "ok" | "warning" | "error"; message: string };
  };
  summary: string;
}

// ─── Auditor Types ───
interface FileAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

interface AuditResponse {
  analysis: string;
  issues: string[];
  suggestions: string[];
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

// ─── Category Config ───
const categoryConfig = [
  { key: "buttons", label: "Buttons", desc: "Interactive elements count" },
  { key: "logos", label: "Logos", desc: "Logo detection" },
  { key: "favicon", label: "Favicon", desc: "Browser icon check" },
  { key: "navigation", label: "Navigation", desc: "Menu structure" },
  { key: "accessibility", label: "Accessibility", desc: "Accessibility issues" },
  { key: "forms", label: "Forms", desc: "Form elements" },
  { key: "images", label: "Images", desc: "Image analysis" },
  { key: "headings", label: "Headings", desc: "Heading structure" },
] as const;

// ─── Tab → path mapping ───
const pathToTab: Record<string, TabId> = {};
SITE_CONFIG.tabs.forEach(t => { pathToTab[t.path] = t.id as TabId; });

export default function Home() {
  const [location] = useLocation();
  const { toast } = useToast();

  // Determine initial tab from URL path or query param
  const getInitialTab = (): TabId => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      const found = SITE_CONFIG.tabs.find(t => t.queryParam === tabParam);
      if (found) return found.id as TabId;
    }
    const pathTab = pathToTab[location];
    if (pathTab) return pathTab;
    return "quick";
  };

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  // Sync tab from URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      const found = SITE_CONFIG.tabs.find(t => t.queryParam === tabParam);
      if (found) setActiveTab(found.id as TabId);
    } else {
      const pathTab = pathToTab[location];
      if (pathTab) setActiveTab(pathTab);
    }
  }, [location]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const tab = SITE_CONFIG.tabs.find(t => t.id === tabId)!;
    window.history.replaceState(null, "", `/?tab=${tab.queryParam}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Tab Bar — curved file folder tabs */}
        <div className="flex items-end gap-1 overflow-x-auto">
          {SITE_CONFIG.tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabId)}
              style={{
                padding: "12px 24px",
                borderRadius: "12px 12px 0 0",
                border: `1px solid ${SITE_CONFIG.colors.primary}`,
                borderBottom: activeTab === tab.id
                  ? `1px solid ${SITE_CONFIG.colors.card}`
                  : `1px solid ${SITE_CONFIG.colors.primary}`,
                background: activeTab === tab.id
                  ? SITE_CONFIG.colors.card
                  : SITE_CONFIG.colors.background,
                color: activeTab === tab.id
                  ? SITE_CONFIG.colors.foreground
                  : SITE_CONFIG.colors.muted,
                fontFamily: '"Archivo", sans-serif',
                fontVariationSettings: '"wdth" 112.5',
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                position: "relative",
                zIndex: activeTab === tab.id ? 1 : 0,
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area — white card connected to active tab */}
        <div
          style={{
            background: SITE_CONFIG.colors.card,
            border: `1px solid ${SITE_CONFIG.colors.primary}`,
            borderRadius: "0 12px 12px 12px",
            padding: "32px",
            marginTop: "-1px",
          }}
        >
          {activeTab === "quick" && <QuickAnalysisContent />}
          {activeTab === "comprehensive" && <ComprehensiveContent />}
          {activeTab === "auditor" && <AuditorContent />}
          {activeTab === "pricing" && <PricingContent />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 1: QUICK ANALYSIS
// ═══════════════════════════════════════════════
function QuickAnalysisContent() {
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState<QuickScanResult | null>(null);
  const { toast } = useToast();
  const config = SITE_CONFIG.pricing.quickAnalysis;

  const scanMutation = useMutation({
    mutationFn: async (targetUrl: string) => {
      const response = await apiRequest("POST", "/api/agent/quick-site-scan", { url: targetUrl });
      return (await response.json()) as QuickScanResult;
    },
    onSuccess: (data) => {
      setScanResult(data);
      toast({ title: "Scan Complete", description: `Analyzed ${data.pagesScanned} pages successfully.` });
    },
    onError: (error: Error) => {
      toast({ title: "Scan Failed", description: error.message || "Failed to scan website.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({ title: "URL Required", description: "Please enter a website URL", variant: "destructive" });
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

  const getStatusIcon = (status: "ok" | "warning" | "error") => {
    switch (status) {
      case "ok": return <Check className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error": return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getResultDisplay = (key: string, result: QuickScanResult) => {
    const cat = result.categories[key as keyof typeof result.categories];
    if (!cat) return null;
    if (key === "favicon") return (cat as typeof result.categories.favicon).found ? "Found" : "Missing";
    if (key === "accessibility") {
      const a = cat as typeof result.categories.accessibility;
      return a.issues === 0 ? "Approved" : `${a.issues} issues`;
    }
    if (key === "images") {
      const i = cat as typeof result.categories.images;
      return i.missingAlt > 0 ? `${i.count} (${i.missingAlt} missing alt)` : `Found ${i.count}`;
    }
    if (key === "headings") {
      const h = cat as typeof result.categories.headings;
      return h.issues > 0 ? `${h.issues} issues` : `${h.h1Count} H1`;
    }
    if ("count" in cat) return `Found ${cat.count}`;
    if ("items" in cat) return `${(cat as typeof result.categories.navigation).items} items`;
    return cat.message;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: SITE_CONFIG.colors.foreground }}>
          <Search className="w-6 h-6" style={{ color: SITE_CONFIG.colors.accent }} />
          {config.label}
          {scanResult && (
            <Badge className="ml-2 text-white" style={{ backgroundColor: SITE_CONFIG.colors.accent }}>
              {scanResult.pagesScanned} pages scanned
            </Badge>
          )}
        </h2>
        <p style={{ color: SITE_CONFIG.colors.muted }}>
          {scanResult ? "Results from site-wide scan" : `Enter a URL to scan up to ${config.pagesIncluded} pages free`}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Website URL
          </CardTitle>
          <CardDescription>
            Enter the website you want to analyze — we'll crawl and scan up to {config.pagesIncluded} pages
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
              const result = scanResult?.categories[cat.key as keyof QuickScanResult["categories"]];
              const status = result?.status;
              return (
                <div key={cat.key} data-testid={`category-${cat.key}`} className="flex items-center justify-between p-3 rounded-lg border bg-card">
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
                      variant={status === "ok" ? "default" : status === "warning" ? "secondary" : "destructive"}
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
        <Card data-testid="card-summary" className="mb-8">
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

      {/* Upsell — after scan results */}
      {scanResult && (
        <div
          className="p-6 sm:p-8"
          style={{
            backgroundColor: `${SITE_CONFIG.colors.accent}08`,
            border: `1px solid ${SITE_CONFIG.colors.accent}30`,
            borderRadius: "1rem",
          }}
        >
          <h3 className="text-xl font-bold mb-2" style={{ color: SITE_CONFIG.colors.foreground }}>
            This scan checked {scanResult.pagesScanned} pages. Your site has more.
          </h3>
          <p className="text-sm mb-4" style={{ color: SITE_CONFIG.colors.muted }}>
            The free scan gives you a snapshot. A full report crawls up to {SITE_CONFIG.pricing.comprehensive.pagesIncluded} pages and delivers a prioritized task list — every accessibility, SEO, performance, and content issue ranked by what matters most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link href={`/purchase?plan=comprehensive&url=${encodeURIComponent(scanResult.url)}`}>
              <button
                className="h-12 px-6 font-semibold flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: SITE_CONFIG.colors.primary, borderRadius: "0.75rem" }}
              >
                <FileText className="w-5 h-5" />
                Get Full Report — {SITE_CONFIG.pricing.comprehensive.priceLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href={`/purchase?plan=bundle&url=${encodeURIComponent(scanResult.url)}`}>
              <button
                className="h-12 px-6 font-semibold flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: SITE_CONFIG.colors.brandRed, borderRadius: "0.75rem" }}
              >
                <MessageSquare className="w-5 h-5" />
                Report + 5 Auditor Questions — {SITE_CONFIG.pricing.bundle.priceLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* $5 additional pages add-on */}
          <div
            className="p-4 flex items-center gap-4"
            style={{
              backgroundColor: SITE_CONFIG.colors.card,
              border: `1px solid ${SITE_CONFIG.colors.accent}30`,
              borderRadius: "0.75rem",
            }}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>
                {SITE_CONFIG.pricing.additionalPages.label}
              </p>
              <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>
                {SITE_CONFIG.pricing.additionalPages.description}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <span className="text-lg font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>
                {SITE_CONFIG.pricing.additionalPages.priceLabel}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 2: COMPREHENSIVE ANALYSIS
// ═══════════════════════════════════════════════
function ComprehensiveContent() {
  const config = SITE_CONFIG.pricing.comprehensive;
  const bundleConfig = SITE_CONFIG.pricing.bundle;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: SITE_CONFIG.colors.foreground }}>
          <FileText className="w-6 h-6" style={{ color: SITE_CONFIG.colors.accent }} />
          {config.label}
        </h2>
        <p style={{ color: SITE_CONFIG.colors.muted }}>
          {SITE_CONFIG.tabs.find(t => t.id === "comprehensive")?.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* What's included */}
        <div>
          <h3 className="text-lg font-bold mb-4" style={{ color: SITE_CONFIG.colors.foreground }}>
            What's Included
          </h3>
          <ul className="space-y-3">
            {config.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: SITE_CONFIG.colors.accent }} />
                <span className="text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>{feature}</span>
              </li>
            ))}
          </ul>

          <div
            className="mt-6 p-4"
            style={{
              backgroundColor: `${SITE_CONFIG.colors.accent}0D`,
              border: `1px solid ${SITE_CONFIG.colors.accent}33`,
              borderRadius: "0.875rem",
            }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: SITE_CONFIG.colors.accent }}>
              WHAT THIS MEANS FOR YOUR BUSINESS
            </p>
            <p className="text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>
              Instead of guessing what's wrong with your website, you get a clear checklist of exactly what to fix — in order of what matters most. No technical knowledge needed.
            </p>
          </div>
        </div>

        {/* Purchase CTAs */}
        <div className="space-y-4">
          <Link href="/purchase?plan=comprehensive">
            <button
              className="w-full h-14 font-semibold flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: SITE_CONFIG.colors.primary, borderRadius: "0.75rem" }}
            >
              <FileText className="w-5 h-5" />
              {config.label} — {config.priceLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/purchase?plan=bundle">
            <button
              className="w-full h-14 font-semibold flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: SITE_CONFIG.colors.brandRed, borderRadius: "0.75rem" }}
            >
              <MessageSquare className="w-5 h-5" />
              {bundleConfig.label} — {bundleConfig.priceLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <p className="text-xs text-center" style={{ color: SITE_CONFIG.colors.muted }}>
            One-time purchase. No subscription. No hidden fees.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: SITE_CONFIG.colors.muted }}>
            <Shield className="w-4 h-4" />
            <span>Secure payment processed by swipesblue.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 3: CODE AND SITE AUDITOR
// ═══════════════════════════════════════════════
function AuditorContent() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your scansblue.com analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything — I'll give you thorough, honest feedback. What would you like me to look at?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInput(prev => prev + (prev ? " " : "") + transcript);
            }
          }
        };
        recognitionRef.current.onerror = (event: any) => {
          toast({ title: "Microphone error", description: event.error, variant: "destructive" });
          setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ title: "Voice input not supported", description: "Your browser doesn't support speech recognition", variant: "destructive" });
      return;
    }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { setInput(""); recognitionRef.current.start(); }
  };

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json() as Promise<Conversation[]>;
    },
  });

  useQuery({
    queryKey: ["/api/conversations", currentConversationId],
    enabled: !!currentConversationId,
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${currentConversationId}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      const data = (await res.json()) as ConversationMessage[];
      const newMessages = data.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      if (newMessages.length === 0) {
        setMessages([{
          id: "1", role: "assistant",
          content: "Hi! I'm your scansblue.com analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything — I'll give you thorough, honest feedback. What would you like me to look at?",
          timestamp: new Date(),
        }]);
      } else {
        setMessages(newMessages);
      }
      return data;
    },
  });

  const auditMutation = useMutation({
    mutationFn: async (codeInput: string) => {
      if (!codeInput.trim()) throw new Error("Please enter something");
      const isLikelyCode = codeInput.includes("{") || codeInput.includes("}") || codeInput.includes("function") || codeInput.includes("const ") || codeInput.includes("=>") || codeInput.includes("class ");
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput, language: isLikelyCode ? "javascript" : "text", question: undefined }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      }
      return response.json() as Promise<AuditResponse>;
    },
    onSuccess: async (data) => {
      const newMessage: ChatMessage = { id: String(messages.length + 1), role: "assistant", content: data.analysis, timestamp: new Date() };
      setMessages(prev => [...prev, newMessage]);
      if (currentConversationId) {
        await fetch(`/api/conversations/${currentConversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "assistant", content: data.analysis }),
        });
      }
      setInput("");
    },
    onError: (error: Error) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });

  const createConversation = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Chat ${new Date().toLocaleDateString()}` }),
      });
      const data = (await res.json()) as Conversation;
      setCurrentConversationId(data.id);
      setMessages([{
        id: "1", role: "assistant",
        content: "Hi! I'm your scansblue.com analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything — I'll give you thorough, honest feedback. What would you like me to look at?",
        timestamp: new Date(),
      }]);
      toast({ title: "New conversation created" });
    } catch {
      toast({ title: "Failed to create conversation", variant: "destructive" });
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([{
          id: "1", role: "assistant",
          content: "Hi! I'm your scansblue.com analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything — I'll give you thorough, honest feedback. What would you like me to look at?",
          timestamp: new Date(),
        }]);
      }
      toast({ title: "Conversation deleted" });
    } catch {
      toast({ title: "Failed to delete conversation", variant: "destructive" });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = (event.target?.result as string).split(",")[1];
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64, name: file.name, type: file.type }),
          });
          if (!response.ok) throw new Error("Upload failed");
          const metadata = await response.json();
          setAttachments(prev => [...prev, metadata]);
          toast({ title: "File uploaded", description: file.name });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    try {
      await fetch(`/api/upload/${id}`, { method: "DELETE" });
      setAttachments(prev => prev.filter(a => a.id !== id));
    } catch {
      toast({ title: "Failed to remove attachment", variant: "destructive" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    const userMessage: ChatMessage = {
      id: String(messages.length + 1),
      role: "user",
      content: input || "(Files attached)",
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    if (currentConversationId) {
      fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: input }),
      }).catch(err => console.error("Failed to save message:", err));
    }
    const messageInput = input;
    setInput("");
    setAttachments([]);
    auditMutation.mutate(messageInput);
  };

  const tabLabel = SITE_CONFIG.tabs.find(t => t.id === "auditor")!.label;

  return (
    <div className="flex" style={{ minHeight: "600px" }}>
      {/* Sidebar */}
      <div className="w-60 border-r p-4 flex flex-col overflow-y-auto" style={{ borderColor: `${SITE_CONFIG.colors.foreground}20` }}>
        <button
          onClick={createConversation}
          className="w-12 h-12 mb-4 border-2 flex items-center justify-center rounded-md"
          data-testid="button-new-chat"
          data-transparent="true"
          data-color="red"
        >
          <Plus className="w-6 h-6" />
        </button>

        <div className="space-y-2 flex-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`p-3 rounded-lg cursor-pointer text-sm transition-colors border ${
                currentConversationId === conv.id
                  ? "text-white"
                  : "bg-transparent"
              }`}
              style={{
                backgroundColor: currentConversationId === conv.id ? SITE_CONFIG.colors.primary : "transparent",
                borderColor: currentConversationId === conv.id ? SITE_CONFIG.colors.primary : SITE_CONFIG.colors.brandRed,
                color: currentConversationId === conv.id ? "#FFFFFF" : SITE_CONFIG.colors.brandRed,
              }}
              data-testid={`button-conversation-${conv.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 hover:opacity-100 transition-opacity"
                  data-testid={`button-delete-conversation-${conv.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="py-4 px-6 border-b" style={{ borderColor: `${SITE_CONFIG.colors.foreground}20` }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: SITE_CONFIG.colors.foreground }}>
            <MessageSquare className="w-6 h-6" style={{ color: SITE_CONFIG.colors.accent }} />
            {tabLabel}
          </h2>
          <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>
            Paste text, questions, or details. Ask anything. Get real feedback.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href="/purchase?plan=bundle"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: SITE_CONFIG.colors.primary }}
            >
              <ShoppingCart className="w-4 h-4" />
              Get 5 Questions — $15 (includes full report)
            </a>
            <a
              href="/purchase?plan=questions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-90"
              style={{ borderColor: SITE_CONFIG.colors.primary, color: SITE_CONFIG.colors.primary }}
            >
              Add 5 More Questions — $5
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4" style={{ maxHeight: "400px" }}>
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} data-testid={`message-${message.role}`}>
              <div
                className="max-w-2xl rounded-lg p-4"
                style={{
                  backgroundColor: message.role === "user" ? SITE_CONFIG.colors.primary : "#F3F4F6",
                  color: message.role === "user" ? "#FFFFFF" : SITE_CONFIG.colors.foreground,
                }}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2 rounded text-xs" style={{ backgroundColor: message.role === "user" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)" }} data-testid={`attachment-${file.id}`}>
                        <span className="truncate">{file.originalName}</span>
                        <a href={`/api/download/${file.id}`} download={file.originalName} className="ml-2 flex-shrink-0" data-testid={`button-download-${file.id}`}>
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {auditMutation.isPending && (
            <div className="flex justify-start">
              <div className="rounded-lg p-4 flex items-center gap-2" style={{ backgroundColor: "#F3F4F6" }}>
                <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>Analyzing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t px-6 py-4 space-y-3" style={{ borderColor: `${SITE_CONFIG.colors.foreground}20` }}>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map(file => (
                <div key={file.id} className="flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: "#F3F4F6" }} data-testid={`attachment-chip-${file.id}`}>
                  <Upload className="w-3 h-3" />
                  <span className="truncate max-w-[200px]">{file.originalName}</span>
                  <button onClick={() => handleRemoveAttachment(file.id)} className="ml-1 flex-shrink-0" data-testid={`button-remove-attachment-${file.id}`}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 items-end w-full">
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} disabled={uploading || auditMutation.isPending} className="hidden" data-testid="input-file" />
            <button type="button" className="w-12 h-12 border-2 flex items-center justify-center rounded-md flex-shrink-0" onClick={() => fileInputRef.current?.click()} disabled={uploading || auditMutation.isPending || isListening} data-testid="button-attach" data-transparent="true" data-color="red">
              <Upload className="w-6 h-6" />
            </button>
            <button type="button" className="w-12 h-12 border-2 flex items-center justify-center rounded-md flex-shrink-0" onClick={toggleListening} disabled={uploading || auditMutation.isPending} data-testid="button-voice" data-transparent="true" data-color="red">
              {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <Textarea placeholder="Paste text, questions, or anything you want analyzed..." value={input} onChange={(e) => setInput(e.target.value)} className="resize-none min-h-[60px] flex-1" data-testid="input-message" disabled={auditMutation.isPending || uploading} />
            <button
              type="button"
              className="w-24 h-12 border-2 flex items-center justify-center rounded-md flex-shrink-0"
              disabled={auditMutation.isPending || uploading || (!input.trim() && attachments.length === 0)}
              onClick={(e) => { e.preventDefault(); const form = e.currentTarget.closest("form"); if (form) form.requestSubmit(); }}
              data-testid="button-send"
              data-transparent="true"
              data-color="blue"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 4: PRICING
// ═══════════════════════════════════════════════
function PricingContent() {
  const { quickAnalysis, comprehensive, bundle, additionalPages, additionalQuestions } = SITE_CONFIG.pricing;

  const plans = [
    {
      config: quickAnalysis,
      accent: SITE_CONFIG.colors.accent,
      featured: false,
      cta: `Run a Free Scan`,
      ctaLink: "/?tab=quick",
      ctaStyle: { backgroundColor: "transparent", color: SITE_CONFIG.colors.accent, border: `2px solid ${SITE_CONFIG.colors.accent}` },
    },
    {
      config: comprehensive,
      accent: SITE_CONFIG.colors.brandRed,
      featured: true,
      cta: `Get Your Full Report — ${comprehensive.priceLabel}`,
      ctaLink: "/purchase?plan=comprehensive",
      ctaStyle: { backgroundColor: SITE_CONFIG.colors.primary, color: "#FFFFFF" },
    },
    {
      config: bundle,
      accent: SITE_CONFIG.colors.brandRed,
      featured: false,
      cta: `Get Report + Auditor — ${bundle.priceLabel}`,
      ctaLink: "/purchase?plan=bundle",
      ctaStyle: { backgroundColor: SITE_CONFIG.colors.brandRed, color: "#FFFFFF" },
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: SITE_CONFIG.colors.foreground }}>
          Simple, Per-Site Pricing
        </h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: SITE_CONFIG.colors.foreground }}>
          Every website is different. Pay for the site you need analyzed — no subscriptions, no hidden fees. Subdomains count as separate sites.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map(plan => (
          <Card
            key={plan.config.label}
            className="relative flex flex-col"
            style={{
              borderColor: plan.featured ? plan.accent : undefined,
              borderWidth: plan.featured ? "2px" : undefined,
            }}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="text-xs font-semibold px-3 py-1" style={{ backgroundColor: plan.accent, color: "#FFFFFF" }}>
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl" style={{ color: SITE_CONFIG.colors.foreground }}>
                {plan.config.label}
              </CardTitle>
              <div className="mt-3">
                <span className="text-4xl font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>
                  {plan.config.priceLabel}
                </span>
                {"priceNote" in plan.config && plan.config.priceNote && (
                  <span className="text-sm ml-2" style={{ color: SITE_CONFIG.colors.muted }}>
                    {plan.config.priceNote}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1">
                {plan.config.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: plan.accent }} />
                    <span className="text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaLink}>
                <button className="w-full h-12 mt-8 font-semibold flex items-center justify-center gap-2" style={plan.ctaStyle}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add-on cards */}
      <div className="max-w-2xl mx-auto mb-16 space-y-4">
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-8 px-6">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SITE_CONFIG.colors.accent, borderRadius: "0.875rem" }}>
              <Search className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalPages.label}</h3>
              <p className="text-sm mt-1" style={{ color: SITE_CONFIG.colors.muted }}>{additionalPages.description}</p>
            </div>
            <div className="text-center flex-shrink-0">
              <span className="text-2xl font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalPages.priceLabel}</span>
              <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>per {additionalPages.pagesIncluded} pages</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-8 px-6">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SITE_CONFIG.colors.brandRed, borderRadius: "0.875rem" }}>
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalQuestions.label}</h3>
              <p className="text-sm mt-1" style={{ color: SITE_CONFIG.colors.muted }}>{additionalQuestions.description}</p>
            </div>
            <div className="text-center flex-shrink-0">
              <span className="text-2xl font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalQuestions.priceLabel}</span>
              <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>per {additionalQuestions.questionsIncluded} questions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: SITE_CONFIG.colors.foreground }}>
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "1", icon: Globe, title: "Enter Your Website", desc: "Tell us which site to analyze. One URL per purchase — subdomains are separate." },
            { step: "2", icon: FileText, title: "We Scan Every Page", desc: `Our scanner crawls up to ${comprehensive.pagesIncluded} pages, checking accessibility, SEO, performance, and content.` },
            { step: "3", icon: CheckCircle2, title: "Get Your Report", desc: "A prioritized task list delivered to your email. Every issue ranked by what matters most." },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: SITE_CONFIG.colors.primary, borderRadius: "0.875rem" }}>
                {item.step}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: SITE_CONFIG.colors.foreground }}>{item.title}</h3>
              <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What This Means callout */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="p-6" style={{ backgroundColor: `${SITE_CONFIG.colors.accent}0D`, border: `1px solid ${SITE_CONFIG.colors.accent}33`, borderRadius: "1rem" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: SITE_CONFIG.colors.accent }}>
            WHAT THIS MEANS FOR YOUR BUSINESS
          </p>
          <p className="text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>
            You don't need a developer to figure out what's wrong with your website. For the cost of a couple coffees, you get a clear list of every issue — ranked by what will make the biggest difference for your customers. Fix the top items first, and you'll see results.
          </p>
        </div>
      </div>

      {/* Trust footer */}
      <div className="flex items-center justify-center gap-2 text-sm" style={{ color: SITE_CONFIG.colors.muted }}>
        <Shield className="w-4 h-4" />
        <span>Secure payment processed by swipesblue.com</span>
      </div>
    </div>
  );
}
