import { useRef, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AuditResponse {
  analysis: string;
  issues: string[];
  suggestions: string[];
}

export default function CodeAuditor() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your independent code and project auditor powered by DeepSeek AI. Paste any code, text, architecture diagrams, or project details you want me to review. Ask me anything - I'll give you an honest, independent assessment of what's actually there vs. what you were told. What would you like me to look at?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const auditMutation = useMutation({
    mutationFn: async () => {
      if (!input.trim()) {
        throw new Error("Please enter something");
      }

      // Detect if it's code or freeform text
      const isLikelyCode =
        input.includes("{") ||
        input.includes("}") ||
        input.includes("function") ||
        input.includes("const ") ||
        input.includes("=>") ||
        input.includes("class ");

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: input,
          language: isLikelyCode ? "javascript" : "text",
          question: undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      }

      return response.json() as Promise<AuditResponse>;
    },
    onSuccess: (data) => {
      const newMessage: Message = {
        id: String(messages.length + 1),
        role: "assistant",
        content: data.analysis,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: String(messages.length + 1),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to audit API
    auditMutation.mutate();
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="py-4 border-b">
        <h1 className="text-2xl font-bold">Independent Auditor</h1>
        <p className="text-sm text-muted-foreground">
          Paste code, text, or project details. Ask anything. Get honest feedback.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
            data-testid={`message-${message.role}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {auditMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
              <p className="text-sm text-muted-foreground">Analyzing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t py-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Paste code, text, or anything you want audited. Ask any question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="resize-none min-h-[100px]"
            data-testid="input-message"
            disabled={auditMutation.isPending}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={auditMutation.isPending || !input.trim()}
              className="gap-2"
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
