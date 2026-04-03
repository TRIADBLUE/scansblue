import { z } from "zod";
import { pgTable, varchar, text, timestamp, jsonb, serial, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Database schema for chat conversations
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationMessages = pgTable("conversation_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({ id: true, createdAt: true });
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type ConversationMessage = typeof conversationMessages.$inferSelect;

// Database schema for caching analysis results
export const analysisCache = pgTable("analysis_cache", {
  id: varchar("id").primaryKey(),
  url: varchar("url").notNull(),
  analysisType: varchar("analysis_type").notNull(),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertAnalysisCacheSchema = createInsertSchema(analysisCache).omit({ id: true, createdAt: true });
export type InsertAnalysisCache = z.infer<typeof insertAnalysisCacheSchema>;
export type AnalysisCache = typeof analysisCache.$inferSelect;

// Database schema for website task analysis results
export const websiteAnalysis = pgTable("website_analysis", {
  id: serial("id").primaryKey(),
  url: varchar("url").notNull(),
  pagesAnalyzed: text("pages_analyzed").array().notNull(),
  issues: jsonb("issues").notNull(),
  tasks: jsonb("tasks").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebsiteAnalysisSchema = createInsertSchema(websiteAnalysis).omit({ id: true, createdAt: true });
export type InsertWebsiteAnalysis = z.infer<typeof insertWebsiteAnalysisSchema>;
export type WebsiteAnalysis = typeof websiteAnalysis.$inferSelect;

// Database schema for tracking report purchases
export const scansblue_purchases = pgTable("scansblue_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessmentId: varchar("assessment_id").notNull(),
  email: varchar("email").notNull(),
  websiteUrl: varchar("website_url").notNull(),
  sessionId: varchar("session_id"),
  amountCents: integer("amount_cents").notNull().default(1000),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  reportStatus: varchar("report_status").notNull().default("pending"),
  reportData: jsonb("report_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  deliveredAt: timestamp("delivered_at"),
});

export const insertPurchaseSchema = createInsertSchema(scansblue_purchases).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof scansblue_purchases.$inferSelect;

// Checkout request schema
export const checkoutRequestSchema = z.object({
  assessmentId: z.string().min(1, "Assessment ID is required"),
  email: z.string().email("Valid email is required"),
  websiteUrl: z.string().min(1, "Website URL is required"),
  plan: z.enum(["comprehensive", "bundle", "questions"]).default("comprehensive"),
  amount: z.number().int().min(500).max(2000).optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

// API request schema for the agent endpoint
export const agentRequestSchema = z.object({
  content: z.string().min(1, "Question cannot be empty"),
  webhookUrl: z.string().url().optional(),
});

export type AgentRequest = z.infer<typeof agentRequestSchema>;

// Website analysis request schema
export const websiteAnalysisRequestSchema = z.object({
  url: z.string()
    .min(1, "URL cannot be empty")
    .transform(url => url.startsWith("http") ? url : `https://${url}`)
    .pipe(z.string().url("Must be a valid URL")),
  maxPages: z.number().int().min(1).max(100).default(50).optional(),
  webhookUrl: z.string().url().optional(),
});

export type WebsiteAnalysisRequest = z.infer<typeof websiteAnalysisRequestSchema>;

// Batch request schema
export const batchAgentRequestSchema = z.object({
  requests: z.array(z.object({
    content: z.string().min(1),
  })).min(1).max(10),
  webhookUrl: z.string().url().optional(),
});

export type BatchAgentRequest = z.infer<typeof batchAgentRequestSchema>;

// API response schema
export const agentResponseSchema = z.object({
  content: z.string(),
  screenshot: z.string().optional(),
  devScreenshot: z.string().optional(),
  prodScreenshot: z.string().optional(),
});

export type AgentResponse = z.infer<typeof agentResponseSchema>;

// Website analysis response schema
export const websiteAnalysisResponseSchema = z.object({
  url: z.string(),
  pagesAnalyzed: z.array(z.string()),
  totalIssues: z.number(),
  tasks: z.array(z.object({
    id: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    category: z.enum(["accessibility", "performance", "seo", "ux", "security", "content"]),
    title: z.string(),
    description: z.string(),
    affectedPages: z.array(z.string()),
    estimatedEffort: z.enum(["quick", "medium", "complex"]),
    status: z.enum(["open", "in-progress", "completed"]).default("open"),
  })),
  summary: z.string(),
});

export type WebsiteAnalysisResponse = z.infer<typeof websiteAnalysisResponseSchema>;

// Batch response schema
export const batchAgentResponseSchema = z.object({
  results: z.array(agentResponseSchema),
});

export type BatchAgentResponse = z.infer<typeof batchAgentResponseSchema>;

// Code audit request/response schemas
export const auditRequestSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string().default("javascript"),
  question: z.string().optional(),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;

export const auditResponseSchema = z.object({
  analysis: z.string(),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type AuditResponse = z.infer<typeof auditResponseSchema>;

// File metadata schema
export const fileMetadataSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedAt: z.string(),
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

// Internal analysis result types
export interface ButtonAnalysis {
  total: number;
  buttons: {
    text: string;
    destination?: string;
    location: string;
    state?: string;
    styling?: string;
  }[];
  screenshot?: string;
}

export interface LogoAnalysis {
  found: boolean;
  logos: {
    src: string;
    alt: string;
    width: number;
    height: number;
    location: string;
    className?: string;
    attributes?: Record<string, string>;
  }[];
  screenshot?: string;
}

export interface FaviconAnalysis {
  found: boolean;
  href?: string;
  type?: string;
  message: string;
  screenshot?: string;
}

export interface NavigationAnalysis {
  menuItems: number;
  structure: {
    label: string;
    href: string;
    isHidden?: boolean;
    parentClass?: string;
    children?: {
      label: string;
      href: string;
    }[];
  }[];
  mobileMenus?: {
    hamburgerDetected: boolean;
    hamburgerSelector?: string;
    mobileMenuItems: number;
    structure: {
      label: string;
      href: string;
      isHidden?: boolean;
      parentClass?: string;
    }[];
    hiddenMenuCount: number;
  };
  comparisonNote?: string;
  screenshot?: string;
  mobileScreenshot?: string;
}

export interface AccessibilityAnalysis {
  ariaLabels: {
    total: number;
    missing: number;
    coverage: number;
  };
  altText: {
    totalImages: number;
    withAlt: number;
    coverage: number;
  };
  headingStructure: {
    valid: boolean;
    issues: string[];
  };
  screenshot?: string;
}

export interface FormsAnalysis {
  totalForms: number;
  forms: {
    id?: string;
    name?: string;
    method: string;
    action?: string;
    fields: {
      name?: string;
      type: string;
      required: boolean;
      label?: string;
    }[];
  }[];
  screenshot?: string;
}

export interface ImagesAnalysis {
  totalImages: number;
  images: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    location: string;
  }[];
  missingAlt: number;
  altCoverage: number;
  screenshot?: string;
}

export interface HeadingStructure {
  headings: {
    level: number;
    text: string;
    id?: string;
  }[];
  issues: string[];
  h1Count: number;
  isValid: boolean;
  screenshot?: string;
}

export interface ComparisonResult {
  devResult: any;
  prodResult: any;
  differences: string[];
  devScreenshot?: string;
  prodScreenshot?: string;
}
