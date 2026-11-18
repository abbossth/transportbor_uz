import type { Metadata } from "next";
import credits from "@/lib/credits.json";

export const metadata: Metadata = { title: "Rasmlar mualliflari — TransportBor" };

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 pb-16 pt-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Rasmlar mualliflari</h1>
      <p className="mt-2 text-muted">Saytdagi bezak rasmlari Wikimedia Commons’dan olingan va ochiq litsenziyalar asosida ishlatiladi.</p>
      <ul className="mt-8 divide-y divide-line rounded-[22px] border border-line bg-card">
        {credits.map((c) => (
          <li key={c.file} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{c.title}</span>
              <span className="text-sm text-muted">
                Muallif: {c.author} · {c.license}
              </span>
            </span>
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-brand-ink hover:underline">
              Manba ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
