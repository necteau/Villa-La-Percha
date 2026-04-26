/**
 * fallbackOrchestrator.ts — Centralized fallback routing for the inquiry system.
 *
 * When DATABASE_URL is not configured or throws, all inquiry operations gracefully
 * degrade to JSON fallback files. When the database is available, it uses Prisma.
 *
 * This file centralizes the fallback logic so it's consistent across all libs
 * and easier to audit/transition to DB-only mode.
 */

/**
 * Check if the database is operational.
 * A DB is considered "operational" if:
 * 1. DATABASE_URL is set
 * 2. It doesn't contain placeholder patterns
 * 3. A connection test succeeds (on first call)
 */
let _dbReady: boolean | null = null;

export async function isDbReady(): Promise<boolean> {
  if (_dbReady !== null) return _dbReady;

  const url = process.env.DATABASE_URL;
  if (!url || url.includes("USER:PASSWORD@HOST")) {
    _dbReady = false;
    return false;
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    _dbReady = true;
    return true;
  } catch {
    _dbReady = false;
    return false;
  }
}

/**
 * Check if database is ready synchronously (no connection test).
 * Use this in hot paths where you don't want the DB probe delay.
 * If in doubt, fall back to JSON.
 */
export function canUseDatabaseSync(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes("USER:PASSWORD@HOST");
}

/**
 * Read a fallback JSON file with graceful error handling.
 */
export async function readJsonFallback<T>(filePath: string, defaultData: T): Promise<T> {
  try {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultData;
  }
}

/**
 * Write a fallback JSON file with graceful error handling.
 */
export async function writeJsonFallback(filePath: string, data: unknown): Promise<boolean> {
  try {
    const fs = await import("fs/promises");
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}
