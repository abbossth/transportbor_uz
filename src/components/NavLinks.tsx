"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Route } from "lucide-react";

const LINKS = [
  { href: "/", label: "Qatnovlar", short: "Qatnovlar", Icon: Route },
  { href: "/sorovlar", label: "Yuborilgan so‘rovlar", short: "So‘rovlar", Icon: ClipboardList },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Asosiy menyu" className="flex items-center gap-1">
      {LINKS.map(({ href, label, short, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`press flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-brand-soft text-brand-ink"
                : "text-muted hover:bg-brand-soft hover:text-ink"
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="hidden md:inline">{label}</span>
            <span className="max-[379px]:sr-only md:hidden">{short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
