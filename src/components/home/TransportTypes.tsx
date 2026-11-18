import { ArrowUpRight, Car, Container, Truck, Caravan, type LucideIcon } from "lucide-react";
import { Photo } from "@/components/Photo";
import type { ImageName } from "@/lib/images";
import { Reveal } from "./Reveal";

const TYPES: { image: ImageName; title: string; text: string; Icon: LucideIcon; tone: "teal" | "green" | "dawn" | "night" }[] = [
  { image: "t-car", title: "Yengil avtomobil", text: "Hujjatlar, kichik posilkalar va sovg‘alar", Icon: Car, tone: "teal" },
  { image: "t-mini", title: "Mini yuk mashinasi", text: "Maishiy texnika va bir nechta quti", Icon: Caravan, tone: "green" },
  { image: "t-pickup", title: "Pikap", text: "Qurilish mollari, mebel qismlari", Icon: Truck, tone: "dawn" },
  { image: "t-semi", title: "Fura", text: "Katta hajmdagi va ulgurji yuklar", Icon: Container, tone: "night" },
];

export function TransportTypes() {
  return (
    <section aria-labelledby="types-title" className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-24">
      <Reveal>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink">Transport turlari</p>
        <h2 id="types-title" className="mt-2 text-3xl font-extrabold tracking-[-0.02em] sm:text-5xl">
          Har qanday yuk uchun mos transport
        </h2>
        <p className="mt-3 max-w-xl text-muted">Posilkadan tortib katta hajmli yukkacha — qatnovlar turli transportda amalga oshiriladi.</p>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TYPES.map((t, i) => (
          <Reveal key={t.title} delay={i * 0.06}>
            <a
              href="#qatnovlar"
              className="press group relative isolate flex h-80 flex-col justify-end overflow-hidden rounded-[24px] p-6 text-white shadow-card hover:shadow-pop"
            >
              <div className="absolute inset-0 -z-20 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
                <Photo name={t.image} alt="" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" tone={t.tone} />
              </div>
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1220]/95 via-[#0b1220]/40 to-transparent" />
              <span className="glass absolute left-5 top-5 grid size-11 place-items-center rounded-2xl">
                <t.Icon className="size-5" aria-hidden />
              </span>
              <span className="glass absolute right-5 top-5 grid size-11 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
              <span className="font-display text-2xl font-extrabold tracking-[-0.02em]">{t.title}</span>
              <span className="mt-1 text-sm text-white/85">{t.text}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
