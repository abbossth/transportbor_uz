"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import type { Trip } from "@/lib/trips";
import { routeLabel, whenLabel } from "@/lib/trips";
import { CARGO_MAX, validateRequest } from "@/lib/validate";

export function NewRequestForm({ trips, name }: { trips: Trip[]; name: string }) {
  const router = useRouter();
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [cargo, setCargo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const v = validateRequest({ tripId, name, cargo }, trips.map((t) => t.id));
        if (!v.ok) return setMsg({ ok: false, text: v.errors.cargo ?? v.errors.name ?? v.errors.tripId ?? "Xato" });
        start(async () => {
          const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v.data) });
          const json = (await res.json()) as { ok: boolean; message?: string; data?: { code: string } };
          if (json.ok) {
            setCargo("");
            setMsg({ ok: true, text: `So‘rov ${json.data?.code} qo‘shildi.` });
            router.refresh();
          } else setMsg({ ok: false, text: json.message ?? "Xatolik" });
        });
      }}
      className="flex flex-col gap-3 rounded-[22px] border border-line bg-card p-5 shadow-card"
    >
      <h3 className="flex items-center gap-2 text-lg font-extrabold">
        <Plus className="size-5 text-brand-ink" aria-hidden /> Yangi so‘rov
      </h3>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Qatnov
        <select value={tripId} onChange={(e) => setTripId(e.target.value)} className="min-h-12 rounded-2xl border border-line bg-bg px-3 text-ink focus:border-brand focus:outline-none">
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} · {routeLabel(t)} · {whenLabel(t)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Yuk tavsifi
        <input value={cargo} maxLength={CARGO_MAX} onChange={(e) => setCargo(e.target.value)} placeholder="Masalan: 2 quti kitob" className="min-h-12 rounded-2xl border border-line bg-bg px-4 text-ink focus:border-brand focus:outline-none" />
      </label>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`text-sm font-semibold ${msg.ok ? "text-brand-ink" : "text-danger-ink"}`}>
          {msg.text}
        </p>
      )}
      <button disabled={busy} className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand font-bold text-on-brand hover:bg-brand-hover">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />} So‘rov qo‘shish
      </button>
    </form>
  );
}
