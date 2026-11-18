import type { Metadata } from "next";
import { Suspense } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { YoldoshBot } from "@/components/YoldoshBot";

export const metadata: Metadata = { title: "Kirish — TransportBor" };

const ERRORS: Record<string, string> = {
  login: "Login yoki parol noto‘g‘ri.",
  maydon: "Barcha maydonlarni to‘ldiring: login 3–32 belgi (a–z, 0–9), parol kamida 6 belgi.",
  band: "Bu login band. Boshqasini tanlang.",
  admin: "Admin allaqachon mavjud. Yuk egasi yoki transport egasi sifatida ro‘yxatdan o‘ting.",
};

const input =
  "w-full rounded-2xl border border-line bg-bg px-4 py-3 text-base text-ink placeholder:text-muted/80 focus:bg-card focus:outline-none focus-visible:outline-3 focus-visible:outline-brand";

async function Forms({ searchParams }: { searchParams: PageProps<"/kirish">["searchParams"] }) {
  const sp = await searchParams;
  const error = typeof sp.xato === "string" ? ERRORS[sp.xato] : undefined;
  const register = sp.tab === "royxat";
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {error && (
        <p role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-ink lg:col-span-2">
          {error}
        </p>
      )}
      <form method="post" action="/api/auth/login" className={`flex flex-col gap-4 rounded-[24px] border border-line bg-card p-6 shadow-card ${register ? "" : "ring-2 ring-brand/40"}`}>
        <h2 className="flex items-center gap-2 text-xl font-extrabold"><LogIn className="size-5 text-brand-ink" aria-hidden /> Kirish</h2>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Login<input name="login" required autoComplete="username" className={input} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Parol<input name="password" type="password" required autoComplete="current-password" className={input} /></label>
        <button className="press mt-1 min-h-12 rounded-full bg-brand font-bold text-on-brand hover:bg-brand-hover">Kirish</button>
      </form>
      <form method="post" action="/api/auth/register" className={`flex flex-col gap-4 rounded-[24px] border border-line bg-card p-6 shadow-card ${register ? "ring-2 ring-brand/40" : ""}`}>
        <h2 className="flex items-center gap-2 text-xl font-extrabold"><UserPlus className="size-5 text-brand-ink" aria-hidden /> Ro‘yxatdan o‘tish</h2>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Ismingiz<input name="name" required maxLength={60} autoComplete="name" className={input} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Login<input name="login" required pattern="[a-zA-Z0-9_.\-]{3,32}" autoComplete="username" className={input} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Parol (kamida 6 belgi)<input name="password" type="password" required minLength={6} autoComplete="new-password" className={input} /></label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">Rolingiz</legend>
          <div className="grid grid-cols-3 gap-2">
            {[["shipper", "Yuk egasi"], ["carrier", "Transport egasi"], ["admin", "Admin"]].map(([v, l], i) => (
              <label key={v} className="flex cursor-pointer items-center justify-center rounded-2xl border border-line bg-bg px-2 py-2.5 text-center text-sm font-bold has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-ink">
                <input type="radio" name="role" value={v} defaultChecked={i === 0} className="sr-only" />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="press mt-1 min-h-12 rounded-full bg-ink font-bold text-bg hover:opacity-90">Ro‘yxatdan o‘tish</button>
      </form>
    </div>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/kirish">) {
  return (
    <div className="mx-auto max-w-[1000px] px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-8 flex items-center gap-4">
        <YoldoshBot className="size-20 shrink-0" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Shaxsiy panel</h1>
          <p className="mt-1 text-muted">Yuk egasi, transport egasi yoki admin sifatida kiring.</p>
        </div>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-line/60" />}>
        <Forms searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
