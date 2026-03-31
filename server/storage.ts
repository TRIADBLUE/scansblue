import { eq, and, gt, sql, desc } from "drizzle-orm";
import { db } from "./db";
import { analysisCache, websiteAnalysis, conversations, conversationMessages, scansblue_purchases, type InsertAnalysisCache, type AnalysisCache, type InsertWebsiteAnalysis, type WebsiteAnalysis, type InsertConversation, type Conversation, type InsertConversationMessage, type ConversationMessage, type InsertPurchase, type Purchase } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCachedAnalysis(url: string, analysisType: string): Promise<AnalysisCache | undefined>;
  setCachedAnalysis(data: InsertAnalysisCache): Promise<AnalysisCache>;
  cleanExpiredCache(): Promise<void>;
  getWebsiteAnalysis(url: string): Promise<WebsiteAnalysis | undefined>;
  setWebsiteAnalysis(data: InsertWebsiteAnalysis): Promise<WebsiteAnalysis>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(data: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<void>;
  addMessageToConversation(data: InsertConversationMessage): Promise<ConversationMessage>;
  getConversationMessages(conversationId: string): Promise<ConversationMessage[]>;
  createPurchase(data: InsertPurchase): Promise<Purchase>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  getPurchaseBySessionId(sessionId: string): Promise<Purchase | undefined>;
  getPurchaseByAssessmentId(assessmentId: string): Promise<Purchase | undefined>;
  updatePurchaseSessionId(id: string, sessionId: string): Promise<Purchase | undefined>;
  updatePurchasePaymentStatus(id: string, status: string, paidAt?: Date): Promise<Purchase | undefined>;
  updatePurchaseReportStatus(id: string, status: string, reportData?: any, deliveredAt?: Date): Promise<Purchase | undefined>;
}

export class DbStorage implements IStorage {
  async getCachedAnalysis(url: string, analysisType: string): Promise<AnalysisCache | undefined> {
    if (!db) return undefined;
    
    try {
      const results = await db
        .select()
        .from(analysisCache)
        .where(
          and(
            eq(analysisCache.url, url),
            eq(analysisCache.analysisType, analysisType),
            gt(analysisCache.expiresAt, sql`NOW()`)
          )
        )
        .limit(1);
      
      return results[0];
    } catch (error) {
      console.warn("Cache lookup failed:", error);
      return undefined;
    }
  }

  async setCachedAnalysis(data: InsertAnalysisCache): Promise<AnalysisCache> {
    if (!db) {
      // Return a mock result when database is not available
      return { 
        id: randomUUID(), 
        createdAt: new Date(),
        ...data 
      } as AnalysisCache;
    }
    
    try {
      const id = randomUUID();
      const result = await db
        .insert(analysisCache)
        .values({ ...data, id })
        .returning();
      
      return result[0];
    } catch (error) {
      console.warn("Cache storage failed:", error);
      // Return mock on failure
      return { 
        id: randomUUID(), 
        createdAt: new Date(),
        ...data 
      } as AnalysisCache;
    }
  }

  async cleanExpiredCache(): Promise<void> {
    if (!db) return;
    
    try {
      await db
        .delete(analysisCache)
        .where(gt(sql`NOW()`, analysisCache.expiresAt));
    } catch (error) {
      console.warn("Cache cleanup failed:", error);
    }
  }

  async getWebsiteAnalysis(url: string): Promise<WebsiteAnalysis | undefined> {
    if (!db) return undefined;
    
    try {
      const results = await db
        .select()
        .from(websiteAnalysis)
        .where(eq(websiteAnalysis.url, url))
        .orderBy((t) => t.createdAt)
        .limit(1);
      
      return results[0];
    } catch (error) {
      console.warn("Website analysis lookup failed:", error);
      return undefined;
    }
  }

  async setWebsiteAnalysis(data: InsertWebsiteAnalysis): Promise<WebsiteAnalysis> {
    if (!db) {
      // Return a mock result when database is not available
      return { 
        id: Math.floor(Math.random() * 10000),
        createdAt: new Date(),
        ...data 
      } as WebsiteAnalysis;
    }
    
    try {
      const result = await db
        .insert(websiteAnalysis)
        .values(data)
        .returning();
      
      return result[0];
    } catch (error) {
      console.warn("Website analysis storage failed:", error);
      // Return mock on failure
      return { 
        id: Math.floor(Math.random() * 10000),
        createdAt: new Date(),
        ...data 
      } as WebsiteAnalysis;
    }
  }

  async getAllConversations(): Promise<Conversation[]> {
    if (!db) return [];
    try {
      return await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
    } catch (error) {
      console.warn("Failed to fetch conversations:", error);
      return [];
    }
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    if (!db) return { ...data, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() } as Conversation;
    try {
      const result = await db.insert(conversations).values(data).returning();
      return result[0];
    } catch (error) {
      console.warn("Failed to create conversation:", error);
      return { ...data, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() } as Conversation;
    }
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    if (!db) return undefined;
    try {
      const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.warn("Failed to get conversation:", error);
      return undefined;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.delete(conversations).where(eq(conversations.id, id));
    } catch (error) {
      console.warn("Failed to delete conversation:", error);
    }
  }

  async addMessageToConversation(data: InsertConversationMessage): Promise<ConversationMessage> {
    if (!db) return { ...data, id: randomUUID(), createdAt: new Date() } as ConversationMessage;
    try {
      const result = await db.insert(conversationMessages).values(data).returning();
      return result[0];
    } catch (error) {
      console.warn("Failed to add message:", error);
      return { ...data, id: randomUUID(), createdAt: new Date() } as ConversationMessage;
    }
  }

  async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    if (!db) return [];
    try {
      return await db.select().from(conversationMessages).where(eq(conversationMessages.conversationId, conversationId)).orderBy(conversationMessages.createdAt);
    } catch (error) {
      console.warn("Failed to fetch messages:", error);
      return [];
    }
  }

  async createPurchase(data: InsertPurchase): Promise<Purchase> {
    if (!db) {
      return { ...data, id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), paidAt: null, deliveredAt: null, reportData: null, sessionId: data.sessionId ?? null, amountCents: data.amountCents ?? 1000, paymentStatus: data.paymentStatus ?? "pending", reportStatus: data.reportStatus ?? "pending" } as Purchase;
    }
    try {
      const result = await db.insert(scansblue_purchases).values(data).returning();
      return result[0];
    } catch (error) {
      console.warn("Failed to create purchase:", error);
      return { ...data, id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), paidAt: null, deliveredAt: null, reportData: null, sessionId: data.sessionId ?? null, amountCents: data.amountCents ?? 1000, paymentStatus: data.paymentStatus ?? "pending", reportStatus: data.reportStatus ?? "pending" } as Purchase;
    }
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    if (!db) return undefined;
    try {
      const result = await db.select().from(scansblue_purchases).where(eq(scansblue_purchases.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.warn("Failed to get purchase:", error);
      return undefined;
    }
  }

  async getPurchaseBySessionId(sessionId: string): Promise<Purchase | undefined> {
    if (!db) return undefined;
    try {
      const result = await db.select().from(scansblue_purchases).where(eq(scansblue_purchases.sessionId, sessionId)).limit(1);
      return result[0];
    } catch (error) {
      console.warn("Failed to get purchase by session:", error);
      return undefined;
    }
  }

  async getPurchaseByAssessmentId(assessmentId: string): Promise<Purchase | undefined> {
    if (!db) return undefined;
    try {
      const result = await db.select().from(scansblue_purchases).where(eq(scansblue_purchases.assessmentId, assessmentId)).limit(1);
      return result[0];
    } catch (error) {
      console.warn("Failed to get purchase by assessment:", error);
      return undefined;
    }
  }

  async updatePurchaseSessionId(id: string, sessionId: string): Promise<Purchase | undefined> {
    if (!db) return undefined;
    try {
      const result = await db.update(scansblue_purchases).set({ sessionId, updatedAt: new Date() }).where(eq(scansblue_purchases.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn("Failed to update purchase session ID:", error);
      return undefined;
    }
  }

  async updatePurchasePaymentStatus(id: string, status: string, paidAt?: Date): Promise<Purchase | undefined> {
    if (!db) return undefined;
    try {
      const updates: any = { paymentStatus: status, updatedAt: new Date() };
      if (paidAt) updates.paidAt = paidAt;
      const result = await db.update(scansblue_purchases).set(updates).where(eq(scansblue_purchases.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn("Failed to update purchase payment status:", error);
      return undefined;
    }
  }

  async updatePurchaseReportStatus(id: string, status: string, reportData?: any, deliveredAt?: Date): Promise<Purchase | undefined> {
    if (!db) return undefined;
    try {
      const updates: any = { reportStatus: status, updatedAt: new Date() };
      if (reportData) updates.reportData = reportData;
      if (deliveredAt) updates.deliveredAt = deliveredAt;
      const result = await db.update(scansblue_purchases).set(updates).where(eq(scansblue_purchases.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn("Failed to update purchase report status:", error);
      return undefined;
    }
  }
}

export const storage = new DbStorage();
