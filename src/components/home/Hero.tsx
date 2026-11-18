import { ChevronDown } from "lucide-react";
import { Photo } from "@/components/Photo";
import { TRIPS, countByDestination } from "@/lib/trips";
import { HeroSearchCard } from "./HeroSearchCard";
import { RouteSchematic } from "./RouteSchematic";

const TITLE = ["Kichik", "yukingiz", "uchun", "mos", "qatnovni", "toping"];
const HIGHLIGHT = new Set(["mos", "qatnovni"]);

export function Hero() {
  const counts = countByDestination(TRIPS);
  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-16 flex min-h-[100svh] items-center overflow-hidden bg-bg pb-16 pt-24 text-ink">
      <div className="tb-ken-burns absolute inset-0 -z-20">
        <Photo name="hero" priority sizes="100vw" tone="hero" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background:linear-gradient(90deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_82%,transparent)_45%,color-mix(in_srgb,var(--bg)_25%,transparent)_100%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-bg to-transparent" />

      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <p className="tb-fade-in glass-surface inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-card">
            <span className="tb-dot-pulse size-2 rounded-full bg-brand" aria-hidden />
            {TRIPS.length} ta qatnov mavjud
          </p>
          <h1
            id="hero-title"
            className="max-w-[13ch] text-[2.4rem] font-extrabold leading-[1.04] tracking-[-0.02em] sm:text-6xl lg:text-[4.5rem]"
          >
            {TITLE.map((w, i) => (
              <span key={w} className="tb-word" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                <span className={HIGHLIGHT.has(w) ? "text-gradient" : undefined}>{w}</span>
                {i < TITLE.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="tb-word max-w-xl text-lg leading-relaxed text-muted" style={{ animationDelay: "0.55s" }}>
            Yukingizga mos qatnovni bir daqiqada toping. Qatnovni tanlang, ismingiz va yuk tavsifini yozing — so‘rovingiz shu
            zahoti qabul qilinadi.
          </p>
          <div className="tb-word w-full" style={{ animationDelay: "0.7s" }}>
            <HeroSearchCard counts={counts} />
          </div>
        </div>
        <div className="tb-fade-in" style={{ animationDelay: "0.3s" }}>
          <RouteSchematic />
        </div>
      </div>

      <a
        href="#ishonch"
        aria-label="Pastga o‘tish"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-semibold text-muted hover:text-ink sm:flex"
      >
        <span className="flex h-9 w-6 justify-center rounded-full border border-line pt-2">
          <span className="tb-scroll-cue h-2 w-1 rounded-full bg-brand" />
        </span>
        <ChevronDown className="size-4" aria-hidden />
      </a>
    </section>
  );
}
