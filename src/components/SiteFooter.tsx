import Link from "next/link";
import { Suspense } from "react";
import { Info, Mic } from "lucide-react";
import { DataSourceBadge } from "./DataSourceBadge";
import { YoldoshBot } from "./YoldoshBot";

const COLS = [
  { title: "Sahifalar", links: [["Qatnovlar", "/#qatnovlar"], ["Yuborilgan so‘rovlar", "/sorovlar"], ["Shaxsiy panel", "/panel"], ["Rasmlar mualliflari", "/credits"]] },
  { title: "Kirish", links: [["Yuk egasi", "/kirish/yuk-egasi"], ["Transport egasi", "/kirish/transport-egasi"], ["Admin", "/kirish/admin"], ["Ro‘yxatdan o‘tish", "/kirish/yuk-egasi?tab=royxat"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mt-0 overflow-hidden border-t border-line bg-card">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-4 pb-10 pt-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/transportbor-logo-horizontal.svg" alt="TransportBor" width={168} height={34} className="h-[34px] w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/transportbor-logo-horizontal-dark.svg" alt="TransportBor" width={168} height={34} className="hidden h-[34px] w-auto dark:block" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">Yukingizga mos qatnovni bir daqiqada toping. Kichik yuk egalari va transport egalarini bog‘laydigan platforma.</p>
          <div className="mt-4">
            <Suspense fallback={null}>
              <DataSourceBadge />
            </Suspense>
          </div>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-sm font-extrabold">{c.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-muted transition-colors hover:text-brand-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="rounded-[22px] border border-line bg-bg p-5">
          <div className="flex items-center gap-3">
            <YoldoshBot className="size-14 shrink-0" />
            <p className="text-sm font-extrabold">Yo‘ldosh har doim yoningizda</p>
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm text-muted">
            <Mic className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
            “B tumaniga qatnov bormi?”, “Panelni och” yoki “Y02 ni tanla” deb ayting.
          </p>
        </div>
      </div>
      <div className="relative border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 pb-28 pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Bu sinov loyihasi: haqiqiy xarid, band qilish yoki xabar yuborish amalga oshirilmaydi.
          </p>
          <p className="shrink-0">
            Rasmlar: <Link href="/credits" className="font-semibold text-ink hover:text-brand-ink">Wikimedia Commons</Link> · © 2026 TransportBor
          </p>
        </div>
      </div>
    </footer>
  );
}
