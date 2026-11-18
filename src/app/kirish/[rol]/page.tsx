import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Package, ShieldCheck, Truck } from "lucide-react";
import { ROLE_INFO, ROLE_SLUGS } from "@/lib/roles";
import { PasswordInput } from "@/components/PasswordInput";

export const metadata: Metadata = { title: "Kirish — TransportBor" };

export function generateStaticParams() {
  return Object.keys(ROLE_SLUGS).map((rol) => ({ rol }));
}

const ERRORS: Record<string, string> = {
  login: "Login yoki parol noto‘g‘ri.",
  maydon: "Maydonlarni to‘ldiring: login 3–32 belgi (a–z, 0–9, _ . -), parol kamida 6 belgi.",
  band: "Bu login band. Boshqasini tanlang.",
  admin: "Admin allaqachon mavjud. Admin hisobi bilan kiring.",
};
const ICONS = { shipper: Package, carrier: Truck, admin: ShieldCheck };

const input =
  "w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-brand focus:bg-card focus:outline-none";

async function AuthCard({ params, searchParams }: PageProps<"/kirish/[rol]">) {
  const { rol } = await params;
  const sp = await searchParams;
  const role = ROLE_SLUGS[rol];
  if (!role) notFound();
  const register = sp.tab === "royxat";
  const error = typeof sp.xato === "string" ? ERRORS[sp.xato] : undefined;
  const Icon = ICONS[role];
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  const q = next ? `&next=${encodeURIComponent(next)}` : "";

  return (
    <div className="tb-word w-full max-w-md rounded-[28px] border border-line bg-card p-6 shadow-pop sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-teal text-white">
          <Icon className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-ink">{ROLE_INFO[role].title}</p>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em]">{register ? "Ro‘yxatdan o‘tish" : "Hisobga kirish"}</h1>
        </div>
      </div>

      {next && !error && (
        <p className="mt-5 rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-ink">
          Davom etish uchun hisobingizga kiring — so‘ng so‘ragan sahifangiz ochiladi.
        </p>
      )}
      {error && (
        <p role="alert" className="tb-shake mt-5 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-ink">
          {error}
        </p>
      )}

      {register ? (
        <form method="post" action="/api/auth/register" className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Ism va familiya
            <input name="name" required maxLength={60} autoComplete="name" placeholder="Masalan: Ali Valiyev" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Login
            <input name="login" required pattern="[a-zA-Z0-9_.\-]{3,32}" autoComplete="username" placeholder="ali_valiyev" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Parol
            <PasswordInput name="password" required minLength={6} autoComplete="new-password" placeholder="Kamida 6 belgi" className={input} />
          </label>
          <button className="press mt-2 min-h-12 rounded-full bg-brand font-bold text-on-brand hover:bg-brand-hover">Ro‘yxatdan o‘tish</button>
          <p className="text-center text-sm text-muted">
            Hisobingiz bormi?{" "}
            <Link href={`/kirish/${rol}${q ? `?${q.slice(1)}` : ""}`} className="font-bold text-brand-ink hover:underline">
              Kirish
            </Link>
          </p>
        </form>
      ) : (
        <form method="post" action="/api/auth/login" className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="rol" value={rol} />
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Login
            <input name="login" required autoComplete="username" placeholder="Loginingiz" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Parol
            <PasswordInput name="password" required autoComplete="current-password" placeholder="Parolingiz" className={input} />
          </label>
          <button className="press mt-2 min-h-12 rounded-full bg-brand font-bold text-on-brand hover:bg-brand-hover">Kirish</button>
          <p className="text-center text-sm text-muted">
            Hisobingiz yo‘qmi?{" "}
            <Link href={`/kirish/${rol}?tab=royxat${q}`} className="font-bold text-brand-ink hover:underline">
              Ro‘yxatdan o‘tish
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function AuthPage(props: PageProps<"/kirish/[rol]">) {
  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1100px] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />
      <Link href="/kirish" className="mb-6 inline-flex items-center gap-2 self-center text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Boshqa rolni tanlash
      </Link>
      <Suspense fallback={<div className="h-[460px] w-full max-w-md animate-pulse rounded-[28px] bg-line/60" />}>
        <AuthCard {...props} />
      </Suspense>
    </div>
  );
}
