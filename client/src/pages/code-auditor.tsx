import { useRef, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Zap, Upload, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface Message {
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

export default function CodeAuditor() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your independent code and project auditor powered by DeepSeek AI. Paste any code, text, architecture diagrams, or project details you want me to review. Upload files. Ask me anything - I'll give you an honest, independent assessment of what's actually there vs. what you were told. What would you like me to look at?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const auditMutation = useMutation({
    mutationFn: async (codeInput: string) => {
      if (!codeInput.trim()) {
        throw new Error("Please enter something");
      }

      // Detect if it's code or freeform text
      const isLikelyCode =
        codeInput.includes("{") ||
        codeInput.includes("}") ||
        codeInput.includes("function") ||
        codeInput.includes("const ") ||
        codeInput.includes("=>") ||
        codeInput.includes("class ");

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeInput,
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: base64,
              name: file.name,
              type: file.type,
            }),
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const metadata = await response.json();
          setAttachments((prev) => [...prev, metadata]);
          toast({
            title: "File uploaded",
            description: file.name,
          });
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    try {
      await fetch(`/api/upload/${id}`, { method: "DELETE" });
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast({
        title: "Failed to remove attachment",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: String(messages.length + 1),
      role: "user",
      content: input || "(Files attached)",
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Pass the input to mutation before clearing it
    const messageInput = input;
    setInput("");
    setAttachments([]);

    // Send to audit API with the captured input
    auditMutation.mutate(messageInput);
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

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.attachments.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 rounded text-xs ${
                        message.role === "user"
                          ? "bg-primary-foreground/20"
                          : "bg-foreground/10"
                      }`}
                      data-testid={`attachment-${file.id}`}
                    >
                      <span className="truncate">{file.originalName}</span>
                      <a
                        href={`/api/download/${file.id}`}
                        download={file.originalName}
                        className="ml-2 flex-shrink-0"
                        data-testid={`button-download-${file.id}`}
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

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
      <div className="border-t py-4 space-y-3">
        {/* Attachments Display */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs"
                data-testid={`attachment-chip-${file.id}`}
              >
                <Upload className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{file.originalName}</span>
                <button
                  onClick={() => handleRemoveAttachment(file.id)}
                  className="ml-1 flex-shrink-0"
                  data-testid={`button-remove-attachment-${file.id}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Paste code, text, or anything you want audited. Ask any question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="resize-none min-h-[100px]"
            data-testid="input-message"
            disabled={auditMutation.isPending || uploading}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={uploading || auditMutation.isPending}
                className="hidden"
                data-testid="input-file"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || auditMutation.isPending}
                className="gap-2"
                data-testid="button-attach"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Attach"}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={
                auditMutation.isPending ||
                uploading ||
                (!input.trim() && attachments.length === 0)
              }
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
