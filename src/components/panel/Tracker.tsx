import { Check, MapPin } from "lucide-react";
import { STAGES } from "@/lib/status";

/** 5 bosqichli kuzatuv chizig‘i. */
export function Tracker({ stage, location }: { stage: number; location: string }) {
  return (
    <div>
      <ol className="relative grid grid-cols-5 gap-1" aria-label={`Holat: ${STAGES[stage]}`}>
        <span aria-hidden className="absolute left-[10%] right-[10%] top-4 h-1 rounded-full bg-line" />
        <span
          aria-hidden
          className="absolute left-[10%] top-4 h-1 rounded-full bg-gradient-to-r from-brand to-teal transition-[width] duration-700"
          style={{ width: `${(stage / 4) * 80}%` }}
        />
        {STAGES.map((s, i) => {
          const done = i < stage;
          const now = i === stage;
          return (
            <li key={s} className="relative flex flex-col items-center gap-2 text-center" aria-current={now ? "step" : undefined}>
              <span
                className={`relative grid size-9 place-items-center rounded-full border-2 text-xs font-bold ${
                  done ? "border-brand bg-brand text-on-brand" : now ? "tb-dot-pulse border-brand bg-card text-brand-ink" : "border-line bg-card text-muted"
                }`}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className={`text-[11px] font-semibold leading-tight sm:text-xs ${now ? "text-ink" : "text-muted"}`}>{s}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
        <MapPin className="size-4 text-brand-ink" aria-hidden />
        Hozir: <span className="font-semibold text-ink">{location}</span>
      </p>
    </div>
  );
}
