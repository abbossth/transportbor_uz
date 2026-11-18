"use client";

import type { AssistantAction } from "./assistant-types";

/** Yordamchi → qatnovlar ro‘yxati o‘rtasidagi yengil hodisa kanali. */
export const UI_ACTION_EVENT = "tb:assistant-action";
export type UiAction = Exclude<AssistantAction, { type: "none" }>;

export function dispatchUiAction(action: UiAction) {
  window.dispatchEvent(new CustomEvent<UiAction>(UI_ACTION_EVENT, { detail: action }));
}
