/** Klient va server uchun bitta umumiy validatsiya. */

export const NAME_MAX = 60;
export const CARGO_MAX = 200;

export const MESSAGES = {
  nameRequired: "Ismingizni kiriting.",
  nameTooLong: `Ism ${NAME_MAX} belgidan oshmasligi kerak.`,
  cargoRequired: "Yukning qisqa tavsifini kiriting.",
  cargoTooLong: `Yuk tavsifi ${CARGO_MAX} belgidan oshmasligi kerak.`,
  tripRequired: "Qatnov tanlanmagan.",
  tripNotFound: "Bunday qatnov topilmadi.",
} as const;

const INVISIBLE = /[\s​-‍﻿]/g;

/** String emas yoki faqat bo‘shliq / ko‘rinmas belgilardan iborat bo‘lsa — true. */
export function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.replace(INVISIBLE, "") === "";
}

/** Ko‘rinmas belgilarni olib tashlaydi, chetlarini kesadi, ichki bo‘shliqlarni bittaga qisqartiradi. */
export function normalizeText(value: string): string {
  return value.replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
}

export type RequestField = "tripId" | "name" | "cargo";
export type FieldErrors = Partial<Record<RequestField, string>>;
export type RequestInput = { tripId: string; name: string; cargo: string };

export type ValidationResult =
  | { ok: true; data: RequestInput }
  | { ok: false; errors: FieldErrors };

/**
 * @param validTripIds berilsa, qatnov ID shu ro‘yxatda bo‘lishi shart.
 */
export function validateRequest(input: unknown, validTripIds?: readonly string[]): ValidationResult {
  const src = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const tripId = typeof src.tripId === "string" ? src.tripId.trim().toUpperCase() : "";
  if (!tripId) errors.tripId = MESSAGES.tripRequired;
  else if (validTripIds && !validTripIds.includes(tripId)) errors.tripId = MESSAGES.tripNotFound;

  let name = "";
  if (isBlank(src.name)) errors.name = MESSAGES.nameRequired;
  else {
    name = normalizeText(src.name as string);
    if (name.length > NAME_MAX) errors.name = MESSAGES.nameTooLong;
  }

  let cargo = "";
  if (isBlank(src.cargo)) errors.cargo = MESSAGES.cargoRequired;
  else {
    cargo = normalizeText(src.cargo as string);
    if (cargo.length > CARGO_MAX) errors.cargo = MESSAGES.cargoTooLong;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { tripId, name, cargo } };
}
