import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./mongodb";

import type { Role } from "./auth-types";
export { ROLE_LABEL, type Role } from "./auth-types";
export type User = { login: string; name: string; role: Role; passwordHash: string; createdAt: string };
export type Session = { login: string; name: string; role: Role };

const COOKIE = "tb-session";
const SECRET = process.env.AUTH_SECRET || process.env.MONGODB_URI || "transportbor-dev-secret";

declare global {
  var _tbUsers: User[] | undefined;
}
const memoryUsers: User[] = (globalThis._tbUsers ??= []);

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}
function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function users() {
  const db = await getDb();
  if (!db) return null;
  const col = db.collection<User>("users");
  await col.createIndex({ login: 1 }, { unique: true }).catch(() => {});
  return col;
}

/** Demo hisoblar (login = parol). */
const DEMO_USERS: { login: string; name: string; role: Role }[] = [
  { login: "yuk_egasi", name: "Yuk Egasi", role: "shipper" },
  { login: "transport_egasi", name: "Transport Egasi", role: "carrier" },
  { login: "admin", name: "Administrator", role: "admin" },
];
let demoSeeded: Promise<void> | null = null;
function ensureDemoUsers(): Promise<void> {
  demoSeeded ??= (async () => {
    const col = await users();
    for (const d of DEMO_USERS) {
      const exists = col ? await col.findOne({ login: d.login }) : memoryUsers.find((u) => u.login === d.login);
      if (exists) continue;
      const user: User = { ...d, passwordHash: hashPassword(d.login), createdAt: new Date().toISOString() };
      if (col) await col.insertOne(user).catch(() => {});
      else memoryUsers.push(user);
    }
  })().catch(() => {
    demoSeeded = null;
  });
  return demoSeeded;
}

export async function findUser(login: string): Promise<User | null> {
  await ensureDemoUsers();
  const col = await users();
  if (col) return col.findOne({ login }, { projection: { _id: 0 } });
  return memoryUsers.find((u) => u.login === login) ?? null;
}

export async function createUser(user: User): Promise<void> {
  const col = await users();
  if (col) await col.insertOne({ ...user });
  else memoryUsers.push(user);
}

export async function adminExists(): Promise<boolean> {
  await ensureDemoUsers();
  const col = await users();
  if (col) return (await col.countDocuments({ role: "admin" }, { limit: 1 })) > 0;
  return memoryUsers.some((u) => u.role === "admin");
}

export async function authenticate(login: string, password: string): Promise<User | null> {
  const user = await findUser(login);
  return user && verifyPassword(password, user.passwordHash) ? user : null;
}

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function makeSessionCookie(s: Session): string {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + 7 * 864e5 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSession(value: string | undefined): Session | null {
  if (!value) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig || sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session & { exp: number };
    return data.exp > Date.now() ? { login: data.login, name: data.name, role: data.role } : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  return parseSession((await cookies()).get(COOKIE)?.value);
}

export const SESSION_COOKIE = COOKIE;

export async function countUsers(): Promise<Record<Role, number>> {
  await ensureDemoUsers();
  const out: Record<Role, number> = { admin: 0, shipper: 0, carrier: 0 };
  const col = await users();
  const list = col ? await col.find({}, { projection: { role: 1 } }).toArray() : memoryUsers;
  for (const u of list) out[u.role as Role]++;
  return out;
}
