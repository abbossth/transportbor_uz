import { DESTINATIONS, TRIP_IDS, type Destination } from "./trips.ts";

export type AssistantAction =
  | { type: "filter"; value: Destination }
  | { type: "select"; value: string }
  | { type: "navigate"; value: string }
  | { type: "none"; value: "" };

export type AssistantReply = {
  reply: string;
  action: AssistantAction;
  transcript?: string;
  source: "gemini" | "local";
};

export type ChatTurn = { role: "user" | "assistant"; text: string };

export const NO_ACTION: AssistantAction = { type: "none", value: "" };

/** Yordamchi ocha oladigan sahifalar (whitelist). */
export const NAV_PAGES: Record<string, string> = {
  "/": "Bosh sahifa (qatnovlar)",
  "/sorovlar": "Yuborilgan so‘rovlar",
  "/panel": "Shaxsiy panel (tizimga kirish talab qilinadi)",
  "/kirish": "Kirish: rol tanlash",
  "/kirish/yuk-egasi": "Yuk egasi sifatida kirish",
  "/kirish/transport-egasi": "Transport egasi sifatida kirish",
  "/kirish/admin": "Admin sifatida kirish",
  "/kirish/yuk-egasi?tab=royxat": "Yuk egasi sifatida ro‘yxatdan o‘tish",
  "/kirish/transport-egasi?tab=royxat": "Transport egasi sifatida ro‘yxatdan o‘tish",
  "/credits": "Rasmlar mualliflari",
};
const NAV_RE = /^\/(?:|sorovlar|panel|credits|kirish(?:\/(?:yuk-egasi|transport-egasi|admin))?)(?:\?(?:tab=royxat|next=%2Fpanel)(?:&(?:tab=royxat|next=%2Fpanel))?)?$/;
export function isNavPath(v: string): boolean {
  return NAV_RE.test(v);
}

/** Modeldan kelgan amalni whitelist bo‘yicha tekshiradi. */
export function sanitizeAction(raw: unknown): AssistantAction {
  if (typeof raw !== "object" || raw === null) return NO_ACTION;
  const { type, value } = raw as { type?: unknown; value?: unknown };
  if (typeof value !== "string") return NO_ACTION;
  if (type === "filter") {
    const match = DESTINATIONS.find((d) => d.toLowerCase() === value.trim().toLowerCase());
    return match ? { type: "filter", value: match } : NO_ACTION;
  }
  if (type === "navigate") {
    const path = value.trim();
    return isNavPath(path) ? { type: "navigate", value: path } : NO_ACTION;
  }
  if (type === "select") {
    const id = value.trim().toUpperCase();
    return TRIP_IDS.includes(id) ? { type: "select", value: id } : NO_ACTION;
  }
  return NO_ACTION;
}

export type AssistantMode = "shipper" | "carrier";

/** Transport egasi rejimi uchun yuk xulosasi (shaxsiy ma’lumotsiz). */
export type CargoSummary = { code: string; tripId: string; route: string; when: string; cargo: string };
