import { randomInt } from "node:crypto";
import type { Db } from "mongodb";
import { connection } from "next/server";
import { TRIPS, routeLabel, whenLabel, type Trip } from "./trips";
import type { DataSource, RequestRecord } from "./types";
import type { RequestInput } from "./validate";
import { getDb, markDbFailed } from "./mongodb";

/* ---------- Xotiradagi zaxira ombor (demo rejim) ---------- */
type MemoryStore = { requests: RequestRecord[]; seeded?: Promise<void> };
declare global {
  var _tbMemory: MemoryStore | undefined;
}
const memory: MemoryStore = (globalThis._tbMemory ??= { requests: demoRequests() });

/** Demo yuk egasi (yuk_egasi) uchun namunaviy so‘rovlar. */
function demoRequests(): RequestRecord[] {
  const base = Date.now();
  const items: [string, string, RequestRecord["status"] | undefined][] = [
    ["Y01", "Maishiy texnika: mikroto‘lqinli pech", "Tasdiqlandi"],
    ["Y02", "2 quti kitob", undefined],
    ["Y03", "Kiyim-kechak posilkasi", "Yuklanmoqda"],
    ["Y04", "Ofis jihozlari: 2 ta stul", "Qabul qilindi"],
    ["Y05", "Bolalar o‘yinchoqlari", "Bekor qilindi"],
  ];
  return items.map(([tripId, cargo, status], i) => {
    const trip = TRIPS.find((t) => t.id === tripId)!;
    return {
      code: `TB-DEMO0${i + 1}`,
      tripId,
      route: routeLabel(trip),
      when: whenLabel(trip),
      name: "Yuk Egasi",
      cargo,
      createdAt: new Date(base - (i + 1) * 3_600_000).toISOString(),
      owner: "yuk_egasi",
      ...(status ? { status } : {}),
    };
  });
}

/* ---------- Yordamchilar ---------- */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeRequestCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `TB-${code}`;
}

export function buildRecord(input: RequestInput, trip: Trip): RequestRecord {
  return {
    code: makeRequestCode(),
    tripId: trip.id,
    route: routeLabel(trip),
    when: whenLabel(trip),
    name: input.name,
    cargo: input.cargo,
    createdAt: new Date().toISOString(),
  };
}

/** Indekslar va boshlang‘ich qatnovlar (bir marta, jarayon bo‘yicha). */
function ensureSeeded(db: Db): Promise<void> {
  memory.seeded ??= (async () => {
    const trips = db.collection<Trip>("trips");
    await Promise.all([
      trips.createIndex({ id: 1 }, { unique: true }),
      db.collection("requests").createIndex({ code: 1 }, { unique: true }),
      db.collection("requests").createIndex({ createdAt: -1 }),
    ]);
    if ((await trips.countDocuments({}, { limit: 1 })) === 0) {
      await trips.insertMany(TRIPS.map((t) => ({ ...t })), { ordered: false }).catch((e: unknown) => {
        // Parallel seed paytida dublikat bo‘lishi mumkin — e’tiborsiz qoldiramiz.
        if (!(e instanceof Error && /E11000/.test(e.message))) throw e;
      });
      console.info("[mongodb] trips kolleksiyasi seed qilindi (5 ta qatnov).");
    }
    // Demo panel ma’lumotlari (bir marta)
    const meta = db.collection<{ _id: string }>("meta");
    if (!(await meta.findOne({ _id: "demo-seed-v1" }))) {
      await db.collection<RequestRecord>("requests").insertMany(demoRequests(), { ordered: false }).catch(() => {});
      await meta.insertOne({ _id: "demo-seed-v1" }).catch(() => {});
    }
  })().catch((e: unknown) => {
    memory.seeded = undefined;
    throw e;
  });
  return memory.seeded;
}

/** MongoDB bilan bajaradi; imkon bo‘lmasa — zaxira natija. */
async function withDb<T>(op: (db: Db) => Promise<T>, fallback: () => T): Promise<{ value: T; source: DataSource }> {
  await connection(); // ma’lumotlar bazasi — har doim so‘rov vaqtida
  const db = await getDb();
  if (db) {
    try {
      await ensureSeeded(db);
      return { value: await op(db), source: "mongodb" };
    } catch (error) {
      markDbFailed(error);
    }
  }
  return { value: fallback(), source: "demo" };
}

/* ---------- Ommaviy API ---------- */
export async function getTrips(): Promise<{ trips: Trip[]; source: DataSource }> {
  const { value, source } = await withDb(
    (db) =>
      db
        .collection<Trip>("trips")
        .find({}, { projection: { _id: 0, id: 1, from: 1, to: 1, date: 1, time: 1, departure: 1 } })
        .sort({ departure: 1 })
        .toArray(),
    () => [...TRIPS],
  );
  return { trips: value.length > 0 ? value : [...TRIPS], source };
}

export async function saveRequest(record: RequestRecord): Promise<{ record: RequestRecord; source: DataSource }> {
  const { source } = await withDb(
    async (db) => {
      await db.collection<RequestRecord>("requests").insertOne({ ...record });
      return true;
    },
    () => {
      memory.requests.unshift(record);
      return true;
    },
  );
  return { record, source };
}

export async function listRequests(): Promise<{ requests: RequestRecord[]; source: DataSource }> {
  const { value, source } = await withDb(
    (db) =>
      db
        .collection<RequestRecord>("requests")
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray(),
    () => [...memory.requests],
  );
  return { requests: value, source };
}

export async function getDataSource(): Promise<DataSource> {
  await connection();
  return (await getDb()) ? "mongodb" : "demo";
}

export async function getRequest(code: string): Promise<RequestRecord | null> {
  const { value } = await withDb(
    (db) => db.collection<RequestRecord>("requests").findOne({ code }, { projection: { _id: 0 } }),
    () => memory.requests.find((r) => r.code === code) ?? null,
  );
  return value;
}

export async function updateRequest(code: string, patch: Partial<Pick<RequestRecord, "cargo" | "status">>): Promise<boolean> {
  const set = { ...patch, updatedAt: new Date().toISOString() };
  const { value } = await withDb(
    async (db) => (await db.collection<RequestRecord>("requests").updateOne({ code }, { $set: set })).matchedCount > 0,
    () => {
      const r = memory.requests.find((x) => x.code === code);
      if (r) Object.assign(r, set);
      return Boolean(r);
    },
  );
  return value;
}

export async function deleteRequest(code: string): Promise<boolean> {
  const { value } = await withDb(
    async (db) => (await db.collection<RequestRecord>("requests").deleteOne({ code })).deletedCount > 0,
    () => {
      const i = memory.requests.findIndex((x) => x.code === code);
      if (i >= 0) memory.requests.splice(i, 1);
      return i >= 0;
    },
  );
  return value;
}
