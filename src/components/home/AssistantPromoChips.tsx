"use client";

import { Mic } from "lucide-react";
import { openAssistant, ASSISTANT_VOICE_EVENT } from "@/lib/ui-events";

const EXAMPLES = ["B tumaniga qatnov bormi?", "Eng yaqin qatnov qachon?", "Y02 ni tanla", "C tumaniga yuk bormi?"];

export function AssistantPromoChips() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => openAssistant({ message: e })}
            className="press rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:border-white/50 hover:bg-white/20"
          >
            {e}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(ASSISTANT_VOICE_EVENT))}
        className="press group inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-brand pl-2 pr-6 font-bold text-on-brand hover:bg-brand-hover"
      >
        <span className="grid size-9 place-items-center rounded-full bg-on-brand/10">
          <Mic className="size-5" aria-hidden />
        </span>
        Ovoz bilan so‘rash
      </button>
    </div>
  );
}
