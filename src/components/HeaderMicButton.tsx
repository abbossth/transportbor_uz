"use client";

import { Mic } from "lucide-react";
import { ASSISTANT_VOICE_EVENT } from "@/lib/ui-events";

export function HeaderMicButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(ASSISTANT_VOICE_EVENT))}
      aria-label="Ovozli buyruq berish"
      title="Ovozli buyruq"
      className="press grid size-10 place-items-center rounded-full border border-line bg-card text-ink group-data-[overlay=true]/header:border-white/25 group-data-[overlay=true]/header:bg-white/10 group-data-[overlay=true]/header:text-white hover:border-brand hover:bg-brand-soft"
    >
      <Mic className="size-5" aria-hidden />
    </button>
  );
}
