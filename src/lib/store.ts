import { randomInt } from "node:crypto";
import { TRIPS, routeLabel, whenLabel, type Trip } from "./trips";
import type { DataSource, RequestRecord } from "./types";
import type { RequestInput } from "./validate";

/** Xotiradagi zaxira ombor (demo rejim). */
type MemoryStore = { requests: RequestRecord[] };
declare global {
  var _tbMemory: MemoryStore | undefined;
}
const memory: MemoryStore = (globalThis._tbMemory ??= { requests: [] });

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

export async function getTrips(): Promise<{ trips: Trip[]; source: DataSource }> {
  return { trips: [...TRIPS], source: "demo" };
}

export async function saveRequest(record: RequestRecord): Promise<{ record: RequestRecord; source: DataSource }> {
  memory.requests.unshift(record);
  return { record, source: "demo" };
}

export async function listRequests(): Promise<{ requests: RequestRecord[]; source: DataSource }> {
  return { requests: [...memory.requests], source: "demo" };
}

export async function getDataSource(): Promise<DataSource> {
  return "demo";
}
