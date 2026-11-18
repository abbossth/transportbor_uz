import { DESTINATIONS, TRIP_IDS, type Destination } from "./trips.ts";

export type AssistantAction =
  | { type: "filter"; value: Destination }
  | { type: "select"; value: string }
  | { type: "none"; value: "" };

export type AssistantReply = {
  reply: string;
  action: AssistantAction;
  transcript?: string;
  source: "gemini" | "local";
};

export type ChatTurn = { role: "user" | "assistant"; text: string };

export const NO_ACTION: AssistantAction = { type: "none", value: "" };

/** Modeldan kelgan amalni whitelist bo‘yicha tekshiradi. */
export function sanitizeAction(raw: unknown): AssistantAction {
  if (typeof raw !== "object" || raw === null) return NO_ACTION;
  const { type, value } = raw as { type?: unknown; value?: unknown };
  if (typeof value !== "string") return NO_ACTION;
  if (type === "filter") {
    const match = DESTINATIONS.find((d) => d.toLowerCase() === value.trim().toLowerCase());
    return match ? { type: "filter", value: match } : NO_ACTION;
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
