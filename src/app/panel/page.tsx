import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, LogOut, Package, Route, Timer, Truck, Users } from "lucide-react";
import { countUsers, getSession, ROLE_LABEL } from "@/lib/auth";
import { getTrips, listRequests } from "@/lib/store";
import { nextTrip, routeLabel, whenLabel } from "@/lib/trips";
import { untilLabel } from "@/lib/dates";
import { CANCELLED, STAGES, effectiveStage, locationLabel } from "@/lib/status";
import { AreaChart, BarChart, CANCEL_COLOR, DonutChart, STAGE_COLORS } from "@/components/panel/Charts";
import { RequestManager, type ManagedItem } from "@/components/panel/RequestManager";
import { NewRequestForm } from "@/components/panel/NewRequestForm";
import { YoldoshBot } from "@/components/YoldoshBot";

export const metadata: Metadata = { title: "Panel — TransportBor" };

function Stat({ icon, value, label, accent }: { icon: ReactNode; value: ReactNode; label: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] border border-line bg-card p-5 shadow-card">
      <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${accent ? "bg-gradient-to-br from-brand to-teal text-white" : "bg-brand-soft text-brand-ink"}`}>{icon}</span>
      <p className="min-w-0">
        <span className="block font-display text-2xl font-extrabold tabular-nums leading-tight sm:text-3xl">{value}</span>
        <span className="text-sm text-muted">{label}</span>
      </p>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[22px] border border-line bg-card p-5 shadow-card ${className}`}>
      <h2 className="mb-4 text-base font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/kirish");
  const now = new Date();
  const [{ requests }, { trips }] = await Promise.all([listRequests(), getTrips()]);
  const users = session.role === "admin" ? await countUsers() : null;
  const tripById = new Map(trips.map((t) => [t.id, t]));

  const visible =
    session.role === "shipper" ? requests.filter((r) => r.owner === session.login || (!r.owner && r.name.toLowerCase() === session.name.toLowerCase())) : requests;

  const items: ManagedItem[] = visible.map((r) => {
    const trip = tripById.get(r.tripId);
    const stage = effectiveStage(trip, r.createdAt, r.status, now);
    return { record: r, stage, location: stage < 0 ? CANCELLED : locationLabel(trip, stage) };
  });

  const active = items.filter((i) => i.stage >= 0);
  const onRoad = items.filter((i) => i.stage === 3).length;
  const delivered = items.filter((i) => i.stage === 4).length;
  const cancelled = items.filter((i) => i.stage === -1).length;
  const next = nextTrip(trips, now);

  // Diagramma ma’lumotlari
  const statusData = [
    ...STAGES.map((s, i) => ({ label: s, value: items.filter((it) => it.stage === i).length, color: STAGE_COLORS[i] })),
    { label: CANCELLED, value: cancelled, color: CANCEL_COLOR },
  ];
  const perTrip = trips.map((t) => ({ label: t.id, sub: t.to, value: active.filter((i) => i.record.tripId === t.id).length }));
  const days = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(now.getTime() - (6 - k) * 864e5);
    const key = d.toISOString().slice(0, 10);
    return { label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`, value: visible.filter((r) => r.createdAt.slice(0, 10) === key).length };
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <YoldoshBot className="hidden size-20 shrink-0 sm:block" />
          <div>
            <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand-ink">{ROLE_LABEL[session.role]} paneli</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Salom, {session.name}!</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.role === "shipper" && (
            <Link href="/#qatnovlar" className="press group inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover">
              Qatnov tanlash <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          )}
          <form method="post" action="/api/auth/logout">
            <button className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold hover:bg-bg">
              <LogOut className="size-4" aria-hidden /> Chiqish
            </button>
          </form>
        </div>
      </div>

      {/* Ko‘rsatkichlar */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat accent icon={<Package className="size-6" aria-hidden />} value={visible.length} label={session.role === "shipper" ? "mening so‘rovlarim" : "jami so‘rov"} />
        <Stat icon={<Truck className="size-6" aria-hidden />} value={onRoad} label="yo‘ldagi yuklar" />
        <Stat icon={<CheckCircle2 className="size-6" aria-hidden />} value={delivered} label="yetkazilgan" />
        {session.role === "admin" && users ? (
          <Stat icon={<Users className="size-6" aria-hidden />} value={users.admin + users.shipper + users.carrier} label={`foydalanuvchi · ${users.shipper} yuk / ${users.carrier} transport egasi`} />
        ) : (
          <Stat icon={<Timer className="size-6" aria-hidden />} value={next ? untilLabel(next.departure, now).replace(" qoldi", "") : "—"} label={next ? `eng yaqin jo‘nash · ${next.id}` : "jo‘naydigan qatnov yo‘q"} />
        )}
      </div>

      {/* Diagrammalar */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="So‘rovlar holati">
          <DonutChart data={statusData} center={String(items.length)} sub="so‘rov" />
        </Panel>
        <Panel title="Qatnovlar bo‘yicha faol yuklar">
          <BarChart data={perTrip} unit="ta yuk" />
        </Panel>
        <Panel title="Oxirgi 7 kun — yangi so‘rovlar">
          <AreaChart points={days} unit="ta so‘rov" />
        </Panel>
      </div>

      {/* Rolga xos bloklar */}
      {session.role === "shipper" && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <NewRequestForm trips={trips} name={session.name} />
          <Panel title="Mavjud qatnovlar">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {trips.map((t) => (
                <li key={t.id}>
                  <Link href={`/?trip=${t.id}`} className="press group flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg px-4 py-3 hover:border-brand">
                    <span className="min-w-0">
                      <span className="font-mono text-xs font-bold text-brand-ink">{t.id}</span>
                      <span className="block truncate font-semibold">{routeLabel(t)}</span>
                      <span className="text-xs tabular-nums text-muted">{whenLabel(t)}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-ink" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {session.role === "carrier" && (
        <section className="mt-6">
          <h2 className="mb-4 text-2xl font-extrabold">Qatnovlaringiz va yuklar</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((t) => {
              const list = active.filter((i) => i.record.tripId === t.id);
              return (
                <article key={t.id} className="rounded-[22px] border border-line bg-card p-5 shadow-card">
                  <p className="flex items-center justify-between">
                    <span className="rounded-lg bg-brand-soft px-2 py-0.5 font-mono text-sm font-bold text-brand-ink">{t.id}</span>
                    <span className="text-sm tabular-nums text-muted">{whenLabel(t)}</span>
                  </p>
                  <p className="mt-2 font-bold">{routeLabel(t)}</p>
                  <p className="text-xs text-muted">{untilLabel(t.departure, now)}</p>
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                    {list.length === 0 ? (
                      <li className="rounded-xl bg-bg px-3 py-2 text-muted">Hozircha yuk yo‘q</li>
                    ) : (
                      list.map((i) => (
                        <li key={i.record.code} className="flex items-center justify-between gap-2 rounded-xl bg-bg px-3 py-2">
                          <span className="min-w-0 truncate">{i.record.cargo}</span>
                          <span className="shrink-0 text-xs font-semibold text-brand-ink">{STAGES[i.stage]}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* So‘rovlar va kuzatuv */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-extrabold">{session.role === "shipper" ? "Yuklarim kuzatuvi" : "So‘rovlarni boshqarish"}</h2>
          <p className="text-sm text-muted">
            <Route className="mr-1 inline size-4" aria-hidden />
            Demo kuzatuv: GPS’siz, holat bosqichlari bo‘yicha
          </p>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[22px] border border-dashed border-line bg-card px-6 py-12 text-center">
            <YoldoshBot className="size-24" />
            <p className="text-muted">Hozircha so‘rov yo‘q. Yuqoridagi formadan yoki bosh sahifadan qatnov tanlab, birinchi so‘rovni yuboring.</p>
          </div>
        ) : (
          <RequestManager items={items} role={session.role} login={session.login} />
        )}
      </section>
    </>
  );
}

export default function PanelPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-line/60" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
