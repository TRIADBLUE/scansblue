import { useRef, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Zap, Upload, Download, X, Plus, Trash2, Mic, Square } from "lucide-react";
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

export default function CodeAuditor() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your independent analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything - I'll give you thorough, honest feedback. What would you like me to look at?",
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInput((prev) => prev + (prev ? " " : "") + transcript);
            } else {
              interimTranscript += transcript;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          toast({
            title: "Microphone error",
            description: event.error,
            variant: "destructive",
          });
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
    }
  };

  // Fetch all conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json() as Promise<Conversation[]>;
    },
  });

  // Fetch current conversation messages
  useQuery({
    queryKey: ["/api/conversations", currentConversationId],
    enabled: !!currentConversationId,
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${currentConversationId}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      const data = await res.json() as ConversationMessage[];
      
      const newMessages = data.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      
      if (newMessages.length === 0) {
        setMessages([{
          id: "1",
          role: "assistant",
          content: "Hi! I'm your independent analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything - I'll give you thorough, honest feedback. What would you like me to look at?",
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
      if (!codeInput.trim()) {
        throw new Error("Please enter something");
      }

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
    onSuccess: async (data) => {
      const newMessage: Message = {
        id: String(messages.length + 1),
        role: "assistant",
        content: data.analysis,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

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
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConversation = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Chat ${new Date().toLocaleDateString()}` }),
      });
      const data = await res.json() as Conversation;
      setCurrentConversationId(data.id);
      setMessages([{
        id: "1",
        role: "assistant",
        content: "Hi! I'm your independent analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything - I'll give you thorough, honest feedback. What would you like me to look at?",
        timestamp: new Date(),
      }]);
      toast({ title: "New conversation created" });
    } catch (error) {
      toast({ title: "Failed to create conversation", variant: "destructive" });
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([{
          id: "1",
          role: "assistant",
          content: "Hi! I'm your independent analyst powered by DeepSeek AI. Paste any text, questions, system descriptions, or project details you want me to analyze. Ask me anything - I'll give you thorough, honest feedback. What would you like me to look at?",
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

    const userMessage: Message = {
      id: String(messages.length + 1),
      role: "user",
      content: input || "(Files attached)",
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

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

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-60 border-r bg-muted/30 p-4 flex flex-col overflow-y-auto">
        <Button onClick={createConversation} className="w-full mb-4 gap-2" size="sm">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        <div className="space-y-2 flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                currentConversationId === conv.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
              data-testid={`button-conversation-${conv.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
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
        <div className="py-4 px-6 border-b">
          <h1 className="text-2xl font-bold">Independent Analyst</h1>
          <p className="text-sm text-muted-foreground">
            Paste text, questions, or details. Ask anything. Get honest analysis.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
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

        <div className="border-t px-6 py-4 space-y-3">
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
              placeholder="Paste text, questions, or anything you want analyzed. Ask any question..."
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
                  disabled={uploading || auditMutation.isPending || isListening}
                  className="gap-2"
                  data-testid="button-attach"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Attach"}
                </Button>
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleListening}
                  disabled={uploading || auditMutation.isPending}
                  className="gap-2"
                  data-testid="button-voice"
                >
                  {isListening ? (
                    <>
                      <Square className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Voice
                    </>
                  )}
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
    </div>
  );
}
