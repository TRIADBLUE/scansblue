import { eq, and, gt, sql } from "drizzle-orm";
import { db } from "./db";
import { analysisCache, websiteAnalysis, type InsertAnalysisCache, type AnalysisCache, type InsertWebsiteAnalysis, type WebsiteAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCachedAnalysis(url: string, analysisType: string): Promise<AnalysisCache | undefined>;
  setCachedAnalysis(data: InsertAnalysisCache): Promise<AnalysisCache>;
  cleanExpiredCache(): Promise<void>;
  getWebsiteAnalysis(url: string): Promise<WebsiteAnalysis | undefined>;
  setWebsiteAnalysis(data: InsertWebsiteAnalysis): Promise<WebsiteAnalysis>;
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
}

export const storage = new DbStorage();
