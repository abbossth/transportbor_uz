import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Package, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { YoldoshBot } from "@/components/YoldoshBot";
import { ROLE_INFO, ROLE_SLUG } from "@/lib/roles";
import type { Role } from "@/lib/auth-types";

export const metadata: Metadata = { title: "Kirish — TransportBor" };

const CARDS: { role: Role; Icon: LucideIcon }[] = [
  { role: "shipper", Icon: Package },
  { role: "carrier", Icon: Truck },
  { role: "admin", Icon: ShieldCheck },
];

export default function LoginChooser() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1100px] flex-col justify-center px-4 py-14 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />
      <h1 className="tb-word text-center text-3xl font-extrabold tracking-[-0.02em] sm:text-5xl">Kirish uchun foydalanuvchi turini tanlang</h1>
      <p className="tb-word mt-3 text-center text-muted" style={{ animationDelay: "0.1s" }}>
        Har bir rol uchun alohida panel. Hisobingiz bo‘lmasa, keyingi qadamda ro‘yxatdan o‘ting.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {CARDS.map(({ role, Icon }, i) => (
          <Link
            key={role}
            href={`/kirish/${ROLE_SLUG[role]}`}
            className="press tb-word group relative isolate flex min-h-60 flex-col justify-end overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-card transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-brand/60 hover:shadow-pop"
            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          >
            <Icon aria-hidden className="absolute -left-4 -top-4 -z-10 size-40 text-brand/[0.07] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[-6deg]" />
            <span className="mb-auto grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-brand to-teal text-white shadow-[0_10px_24px_-10px_rgb(18_183_106/0.8)]">
              <Icon className="size-8" aria-hidden />
            </span>
            <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-bg text-ink transition-all duration-300 group-hover:rotate-45 group-hover:bg-brand group-hover:text-on-brand">
              <ArrowUpRight className="size-5" aria-hidden />
            </span>
            <span className="mt-8 block font-display text-2xl font-extrabold">{ROLE_INFO[role].title}</span>
            <span className="mt-1 block text-sm text-muted">{ROLE_INFO[role].text}</span>
          </Link>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-center gap-3 text-sm text-muted">
        <YoldoshBot className="size-14" />
        Savol bo‘lsa, Yo‘ldoshdan so‘rang — o‘ng pastdagi robot.
      </div>
    </div>
  );
}
