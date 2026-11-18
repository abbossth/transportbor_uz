import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LogOut, Package, Route, Truck, Users } from "lucide-react";
import { getSession, ROLE_LABEL } from "@/lib/auth";
import { getTrips, listRequests } from "@/lib/store";
import { routeLabel, whenLabel } from "@/lib/trips";
import { RequestsTable } from "@/components/RequestsTable";

export const metadata: Metadata = { title: "Panel — TransportBor" };

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] border border-line bg-card p-5 shadow-card">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-ink">{icon}</span>
      <p>
        <span className="block font-display text-3xl font-extrabold tabular-nums">{value}</span>
        <span className="text-sm text-muted">{label}</span>
      </p>
    </div>
  );
}

async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/kirish");
  const [{ requests }, { trips }] = await Promise.all([listRequests(), getTrips()]);

  const mine = session.role === "shipper" ? requests.filter((r) => r.name.toLowerCase() === session.name.toLowerCase()) : requests;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand-ink">{ROLE_LABEL[session.role]}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Salom, {session.name}!</h1>
        </div>
        <form method="post" action="/api/auth/logout">
          <button className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold hover:bg-bg">
            <LogOut className="size-4" aria-hidden /> Chiqish
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {session.role === "admin" && (
          <>
            <Stat icon={<Package className="size-6" aria-hidden />} value={requests.length} label="jami so‘rov" />
            <Stat icon={<Route className="size-6" aria-hidden />} value={trips.length} label="qatnov" />
            <Stat icon={<Users className="size-6" aria-hidden />} value={new Set(requests.map((r) => r.name)).size} label="yuk egasi" />
          </>
        )}
        {session.role === "carrier" && (
          <>
            <Stat icon={<Truck className="size-6" aria-hidden />} value={trips.length} label="qatnov" />
            <Stat icon={<Package className="size-6" aria-hidden />} value={requests.length} label="kelgan yuk so‘rovi" />
            <Stat icon={<Route className="size-6" aria-hidden />} value={new Set(requests.map((r) => r.tripId)).size} label="band qatnov" />
          </>
        )}
        {session.role === "shipper" && (
          <>
            <Stat icon={<Package className="size-6" aria-hidden />} value={mine.length} label="mening so‘rovlarim" />
            <Stat icon={<Route className="size-6" aria-hidden />} value={new Set(mine.map((r) => r.tripId)).size} label="qatnov" />
            <Stat icon={<Truck className="size-6" aria-hidden />} value="Qabul qilindi" label="holat" />
          </>
        )}
      </div>

      {session.role === "carrier" && (
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Qatnovlaringizdagi yuklar</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((t) => {
              const list = requests.filter((r) => r.tripId === t.id);
              return (
                <article key={t.id} className="rounded-[22px] border border-line bg-card p-5 shadow-card">
                  <p className="flex items-center justify-between">
                    <span className="rounded-lg bg-brand-soft px-2 py-0.5 font-mono text-sm font-bold text-brand-ink">{t.id}</span>
                    <span className="text-sm tabular-nums text-muted">{whenLabel(t)}</span>
                  </p>
                  <p className="mt-2 font-bold">{routeLabel(t)}</p>
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                    {list.length === 0 ? <li className="text-muted">Hozircha yuk yo‘q</li> : list.map((r) => <li key={r.code} className="rounded-xl bg-bg px-3 py-2"><b className="font-mono text-brand-ink">{r.code}</b> · {r.cargo}</li>)}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-extrabold">{session.role === "shipper" ? "Mening so‘rovlarim" : "Barcha so‘rovlar"}</h2>
        {mine.length === 0 ? (
          <p className="rounded-[22px] border border-dashed border-line bg-card px-6 py-10 text-center text-muted">
            Hozircha so‘rov yo‘q. {session.role === "shipper" ? "So‘rov yuborishda shu ismni kiriting — u shu yerda ko‘rinadi." : ""}
          </p>
        ) : (
          <RequestsTable requests={mine} />
        )}
      </section>
    </>
  );
}

export default function PanelPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-line/60" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
