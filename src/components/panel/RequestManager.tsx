"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import type { RequestRecord } from "@/lib/types";
import { ALL_STATUSES, CANCELLED, STAGES, type RequestStatus } from "@/lib/status";
import type { Role } from "@/lib/auth-types";
import { CARGO_MAX } from "@/lib/validate";
import { Tracker } from "./Tracker";

export type ManagedItem = { record: RequestRecord; stage: number; location: string };

async function call(code: string, method: "PATCH" | "DELETE", body?: object): Promise<string | null> {
  try {
    const res = await fetch(`/api/requests/${encodeURIComponent(code)}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as { ok: boolean; message?: string };
    return json.ok ? null : (json.message ?? "Xatolik yuz berdi.");
  } catch {
    return "Server bilan aloqa yo‘q.";
  }
}

function Card({ item, role, login }: { item: ManagedItem; role: Role; login: string }) {
  const { record, stage, location } = item;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [cargo, setCargo] = useState(record.cargo);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  const owner = role === "shipper" && record.owner === login;
  const canEdit = owner || role === "admin";
  const canStatus = role === "admin" || role === "carrier";
  const canCancel = (owner || canStatus) && stage !== -1 && stage < 3;
  const canDelete = owner || role === "admin";
  const cancelled = stage === -1;

  function run(method: "PATCH" | "DELETE", body?: object, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const err = await call(record.code, method, body);
      if (err) setError(err);
      else {
        after?.();
        router.refresh();
      }
    });
  }

  return (
    <article className={`rounded-[22px] border bg-card p-5 shadow-card transition-opacity ${cancelled ? "border-line opacity-70" : "border-line"} ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-brand-ink">{record.code}</span>
            <span className="rounded-lg bg-brand-soft px-2 py-0.5 font-mono text-xs font-bold text-brand-ink">{record.tripId}</span>
            {cancelled && <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger-ink">{CANCELLED}</span>}
          </p>
          <h3 className="mt-1 break-words text-lg font-extrabold">{record.route}</h3>
          <p className="text-sm tabular-nums text-muted">
            {record.when} · {record.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {canStatus && (
            <label className="relative">
              <span className="sr-only">Holat</span>
              <select
                value={cancelled ? CANCELLED : (record.status ?? STAGES[Math.max(0, stage)])}
                disabled={busy}
                onChange={(e) => run("PATCH", { status: e.target.value as RequestStatus })}
                className="min-h-10 rounded-full border border-line bg-bg px-3 text-sm font-semibold text-ink focus:border-brand focus:outline-none"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          )}
          {canEdit && !editing && !cancelled && (
            <button type="button" onClick={() => setEditing(true)} aria-label="Yuk tavsifini tahrirlash" className="press grid size-10 place-items-center rounded-full border border-line hover:bg-bg">
              <Pencil className="size-4" aria-hidden />
            </button>
          )}
          {canCancel && (
            <button type="button" disabled={busy} onClick={() => run("PATCH", { status: CANCELLED })} className="press inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-semibold hover:bg-bg">
              <Ban className="size-4" aria-hidden /> Bekor qilish
            </button>
          )}
          {canDelete &&
            (confirmDelete ? (
              <span className="inline-flex items-center gap-1">
                <button type="button" disabled={busy} onClick={() => run("DELETE")} className="press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-danger px-3 text-sm font-bold text-white">
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />} O‘chirilsinmi?
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} aria-label="Bekor" className="press grid size-10 place-items-center rounded-full border border-line">
                  <X className="size-4" aria-hidden />
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} aria-label="O‘chirish" className="press grid size-10 place-items-center rounded-full border border-line text-danger-ink hover:bg-danger/10">
                <Trash2 className="size-4" aria-hidden />
              </button>
            ))}
        </div>
      </div>

      {editing ? (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            run("PATCH", { cargo }, () => setEditing(false));
          }}
        >
          <label htmlFor={`cargo-${record.code}`} className="sr-only">
            Yuk tavsifi
          </label>
          <input
            id={`cargo-${record.code}`}
            value={cargo}
            maxLength={CARGO_MAX}
            onChange={(e) => setCargo(e.target.value)}
            autoFocus
            className="min-w-0 flex-1 rounded-2xl border border-line bg-bg px-4 py-2.5 text-ink focus:border-brand focus:outline-none"
          />
          <div className="flex gap-2">
            <button disabled={busy} className="press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-bold text-on-brand">
              <Check className="size-4" aria-hidden /> Saqlash
            </button>
            <button type="button" onClick={() => { setEditing(false); setCargo(record.cargo); }} className="press min-h-11 rounded-full border border-line px-4 text-sm font-semibold">
              Bekor
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-3 rounded-2xl bg-bg px-4 py-2.5 text-sm">
          <span className="text-muted">Yuk: </span>
          <span className="font-semibold">{record.cargo}</span>
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger-ink">
          {error}
        </p>
      )}

      {!cancelled && (
        <div className="mt-5">
          <Tracker stage={stage} location={location} />
        </div>
      )}
    </article>
  );
}

export function RequestManager({ items, role, login }: { items: ManagedItem[]; role: Role; login: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((it) => (
        <Card key={it.record.code} item={it} role={role} login={login} />
      ))}
    </div>
  );
}
