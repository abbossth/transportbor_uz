import { MongoClient, type Db } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.MONGODB_URI;

declare global {
  var _mongoClient: MongoClient | undefined;
}

function createClient(): MongoClient {
  if (!uri) {
    throw new Error("MONGODB_URI muhit o'zgaruvchisi topilmadi (.env.local yoki Vercel env)");
  }
  const client = new MongoClient(uri, { appName: "transportbor_uz" });
  // Vercel Fluid Compute: funksiya to'xtatilishidan oldin pool to'g'ri yopiladi
  attachDatabasePool(client);
  return client;
}

/** Bitta umumiy MongoClient (dev rejimida HMR paytida ham qayta yaratilmaydi). */
export function getMongoClient(): MongoClient {
  if (!globalThis._mongoClient) {
    globalThis._mongoClient = createClient();
  }
  return globalThis._mongoClient;
}

export function getDb(name = process.env.MONGODB_DB ?? "transportbor"): Db {
  return getMongoClient().db(name);
}
