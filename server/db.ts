import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSocket for local development
neonConfig.webSocketConstructor = ws;

let db: ReturnType<typeof drizzle> | null = null;

// Initialize database only if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool);
  } catch (error) {
    console.warn("Failed to initialize database:", error);
    db = null;
  }
} else {
  console.warn("DATABASE_URL not configured - caching will be disabled");
  db = null;
}

export { db };
