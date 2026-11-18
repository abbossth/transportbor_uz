import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/Photo";
import { TRIPS, filterTrips, type Destination } from "@/lib/trips";
import type { ImageName } from "@/lib/images";
import { RegionButton } from "./RegionButton";
import { Reveal } from "./Reveal";

const REGIONS: { dest: Exclude<Destination, "Barchasi">; image: ImageName; tone: "dawn" | "teal" | "green" }[] = [
  { dest: "A tumani", image: "road-a", tone: "dawn" },
  { dest: "B tumani", image: "road-b", tone: "teal" },
  { dest: "C tumani", image: "road-c", tone: "green" },
];

export function Regions() {
  return (
    <section aria-labelledby="regions-title" className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink">Hududlar</p>
        <h2 id="regions-title" className="mt-2 text-3xl font-extrabold tracking-[-0.02em] sm:text-5xl">
          Qayerga yuk jo‘natasiz?
        </h2>
        <p className="mt-3 max-w-xl text-muted">Hududni tanlang — ro‘yxat shu yo‘nalishdagi qatnovlar bilan ochiladi.</p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {REGIONS.map((r, i) => {
          const count = filterTrips(TRIPS, r.dest).length;
          return (
            <Reveal key={r.dest} delay={i * 0.07}>
              <RegionButton value={r.dest} label={`${r.dest}: ${count} ta qatnov. Filtrni qo‘llash`}>
                <div className="absolute inset-0 -z-20 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
                  <Photo name={r.image} sizes="(min-width: 768px) 33vw, 100vw" tone={r.tone} />
                </div>
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1220]/90 via-[#0b1220]/35 to-transparent" />
                <span className="glass absolute right-5 top-5 grid size-11 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" aria-hidden />
                </span>
                <span className="font-display text-3xl font-extrabold tracking-[-0.02em]">{r.dest}</span>
                <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                  {count} ta qatnov
                </span>
              </RegionButton>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
