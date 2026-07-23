import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!dbInstance) {
    const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL or NEON_DATABASE_URL must be set. Please check your environment variables.");
    }
    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

/**
 * Executes a DB operation with exponential backoff retries for Neon serverless connection stability.
 */
export async function withDbRetry<T>(
  operation: (db: NeonHttpDatabase<typeof schema>) => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const db = getDb();
      return await operation(db);
    } catch (err: unknown) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      console.warn(`[Neon DB] Retry attempt ${attempt}/${retries} after error:`, err);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error("[Neon DB] Connection failed after maximum retries.");
}
