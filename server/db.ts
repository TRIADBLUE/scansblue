import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool: PgPool } = pg;
import ws from "ws";

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> | null = null;

// Initialize database only if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    const isNeon = process.env.DATABASE_URL.includes('neon.tech');

    if (isNeon) {
      // Production: Neon serverless driver (requires WebSocket proxy)
      neonConfig.webSocketConstructor = ws;
      const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
      db = drizzleNeon(pool);
    } else {
      // Development: Standard PostgreSQL driver (Replit built-in Postgres)
      const pool = new PgPool({ connectionString: process.env.DATABASE_URL });
      db = drizzlePg(pool);
    }
  } catch (error) {
    console.warn("Failed to initialize database:", error);
    db = null;
  }
} else {
  console.warn("DATABASE_URL not configured - caching will be disabled");
  db = null;
}

export { db };
