"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { DESTINATIONS, type Destination } from "@/lib/trips";
import { dispatchUiAction } from "@/lib/ui-events";
import { scrollToId } from "@/lib/scroll";

type Props = { counts: Record<Destination, number> };

/** Hero'dagi glass "qidiruv kartasi": chip bosilsa filtr o‘rnatiladi va ro‘yxatga scroll qilinadi. */
export function HeroSearchCard({ counts }: Props) {
  return (
    <div className="glass w-full max-w-xl rounded-[24px] p-4 text-white shadow-pop sm:p-5">
      <p id="hero-where" className="mb-3 text-sm font-semibold text-white/85">
        Qayerga yuborasiz?
      </p>
      <div role="group" aria-labelledby="hero-where" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DESTINATIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => dispatchUiAction({ type: "filter", value: d })}
            className="press flex min-h-12 items-center justify-between gap-2 rounded-2xl border border-white/20 bg-white/10 px-3.5 text-left text-sm font-bold hover:border-white/50 hover:bg-white/20"
          >
            <span className="truncate">{d}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">{counts[d]}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scrollToId("qatnovlar")}
        className="press group mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover"
      >
        Qatnovlarni ko‘rish
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      </button>
      <span className="sr-only">
        <ArrowDown aria-hidden />
      </span>
    </div>
  );
}
