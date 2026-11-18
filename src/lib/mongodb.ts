import { MongoClient, type Db } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

/**
 * Global keshlangan MongoClient. URI yo‘q yoki ulanish xato bo‘lsa `null` qaytaradi —
 * chaqiruvchi xotiradagi zaxira omborga (demo rejim) o‘tadi.
 */
type MongoCache = {
  client?: MongoClient;
  connecting?: Promise<Db | null>;
  /** Oxirgi muvaffaqiyatsiz urinishdan keyin qayta urinmaslik muddati (ms timestamp). */
  retryAfter: number;
  warnedNoUri?: boolean;
};

declare global {
  var _tbMongo: MongoCache | undefined;
}
const cache: MongoCache = (globalThis._tbMongo ??= { retryAfter: 0 });
const RETRY_COOLDOWN_MS = 30_000;

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (!cache.warnedNoUri) {
      console.warn("[mongodb] MONGODB_URI topilmadi — demo rejim (xotiradagi ombor) ishlatiladi.");
      cache.warnedNoUri = true;
    }
    return null;
  }
  if (cache.connecting) return cache.connecting;
  if (Date.now() < cache.retryAfter) return null;

  cache.connecting = (async () => {
    try {
      const client = (cache.client ??= new MongoClient(uri, {
        appName: "transportbor",
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }));
      attachDatabasePool(client);
      await client.connect();
      const name = process.env.MONGODB_DB || undefined;
      return client.db(name);
    } catch (error) {
      console.warn("[mongodb] ulanib bo‘lmadi — demo rejimga o‘tildi:", error instanceof Error ? error.message : error);
      cache.retryAfter = Date.now() + RETRY_COOLDOWN_MS;
      const failed = cache.client;
      cache.client = undefined;
      failed?.close().catch(() => {});
      cache.connecting = undefined;
      return null;
    }
  })();
  return cache.connecting;
}

/** Ish paytida ulanish uzilsa, keyingi so‘rov qayta ulanishga harakat qilsin. */
export function markDbFailed(error: unknown) {
  console.warn("[mongodb] so‘rov xatosi — demo rejimga o‘tildi:", error instanceof Error ? error.message : error);
  cache.connecting = undefined;
  cache.retryAfter = Date.now() + RETRY_COOLDOWN_MS;
}
