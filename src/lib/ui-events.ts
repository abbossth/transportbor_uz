"use client";

import type { AssistantAction } from "./assistant-types";

/** Yordamchi → qatnovlar ro‘yxati o‘rtasidagi yengil hodisa kanali. */
export const UI_ACTION_EVENT = "tb:assistant-action";
export type UiAction = Exclude<AssistantAction, { type: "none" }>;

export function dispatchUiAction(action: UiAction) {
  window.dispatchEvent(new CustomEvent<UiAction>(UI_ACTION_EVENT, { detail: action }));
}

/** Header'dagi mikrofon → yordamchini ochib, yozishni boshlash. */
export const ASSISTANT_VOICE_EVENT = "tb:assistant-voice";

/** Yordamchini ochish (ixtiyoriy: darhol yuboriladigan xabar). */
export const ASSISTANT_OPEN_EVENT = "tb:assistant-open";
export type AssistantOpenDetail = { message?: string };
export function openAssistant(detail: AssistantOpenDetail = {}) {
  window.dispatchEvent(new CustomEvent<AssistantOpenDetail>(ASSISTANT_OPEN_EVENT, { detail }));
}
