"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, CalendarClock, Info, Loader2, PackageCheck, Send, X } from "lucide-react";
import { routeLabel, whenLabel, type Trip } from "@/lib/trips";
import { dayLabel } from "@/lib/dates";
import { CARGO_MAX, NAME_MAX, validateRequest, type FieldErrors } from "@/lib/validate";
import type { ApiResponse, RequestRecord } from "@/lib/types";
import { Confirmation } from "./Confirmation";
import type { ReactNode } from "react";
import { Photo } from "./Photo";

type Props = {
  trip: Trip | null;
  tripIds: readonly string[];
  onClose: () => void;
  onSubmitted?: (record: RequestRecord) => void;
};

export function RequestDialog({ trip, tripIds, onClose, onSubmitted }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (trip && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("scroll-locked");
      // showModal() fokusni birinchi tugmaga qo‘yadi — birinchi maydonga qaytaramiz
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!trip && dialog.open) {
      dialog.close();
    }
  }, [trip]);

  function handleClose() {
    document.documentElement.classList.remove("scroll-locked");
    setSession((s) => s + 1);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="tb-dialog"
      aria-labelledby="dialog-title"
      aria-modal="true"
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="tb-dialog-panel relative flex max-h-[inherit] flex-col overflow-y-auto overscroll-contain rounded-t-[24px] bg-card text-ink shadow-pop sm:rounded-[24px] md:overflow-hidden">
        <span className="absolute left-1/2 top-2.5 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden" aria-hidden />
        {trip && (
          <RequestFlow
            key={`${trip.id}-${session}`}
            trip={trip}
            tripIds={tripIds}
            close={() => dialogRef.current?.close()}
            onSubmitted={onSubmitted}
          />
        )}
      </div>
    </dialog>
  );
}

type FlowProps = {
  trip: Trip;
  tripIds: readonly string[];
  close: () => void;
  onSubmitted?: (record: RequestRecord) => void;
};

function RequestFlow({ trip, tripIds, close, onSubmitted }: FlowProps) {
  const [name, setName] = useState("");
  const [cargo, setCargo] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState<RequestRecord | null>(null);
  const busy = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const cargoRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const nameWrapRef = useRef<HTMLDivElement>(null);
  const cargoWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (record) successRef.current?.focus();
    else nameRef.current?.focus();
  }, [record]);

  function focusFirstError(errs: FieldErrors) {
    // Xatoli maydonlar yengil chayqaladi (300ms)
    for (const [has, el] of [[errs.name, nameWrapRef.current], [errs.cargo, cargoWrapRef.current]] as const) {
      if (!has || !el) continue;
      el.classList.remove("tb-shake");
      void el.offsetWidth;
      el.classList.add("tb-shake");
    }
    if (errs.name) nameRef.current?.focus();
    else if (errs.cargo) cargoRef.current?.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;
    setSubmitError(null);

    const local = validateRequest({ tripId: trip.id, name, cargo }, tripIds);
    if (!local.ok) {
      setErrors(local.errors);
      focusFirstError(local.errors);
      return;
    }

    busy.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local.data),
      });
      const body = (await res.json()) as ApiResponse<RequestRecord>;
      if (res.ok && body.ok) {
        setRecord(body.data);
        onSubmitted?.(body.data);
      } else if (!body.ok) {
        if (body.errors) {
          setErrors(body.errors);
          focusFirstError(body.errors);
        }
        setSubmitError(body.message);
      } else {
        setSubmitError("So‘rovni yuborib bo‘lmadi. Qayta urinib ko‘ring.");
      }
    } catch {
      setSubmitError("Server bilan aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  function again() {
    setRecord(null);
    setName("");
    setCargo("");
    setErrors({});
    setSubmitError(null);
  }

  const fieldBase =
    "w-full rounded-2xl border bg-bg px-4 py-3 text-base text-ink placeholder:text-muted/80 transition-colors focus:bg-card focus:outline-none focus-visible:outline-3 focus-visible:outline-brand";

  const body = record ? (
    <Confirmation ref={successRef} record={record} onBackToList={close} onAgain={again} />
  ) : (
    <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-7">
        <div>
          <p className="text-sm font-semibold text-brand-ink">Tanlangan qatnov · {trip.id}</p>
          <h2 id="dialog-title" className="text-2xl font-extrabold tracking-[-0.02em]">
            So‘rov yuborish
          </h2>
        </div>
        <CloseButton onClick={close} />
      </div>

      <div className="flex flex-col gap-4 px-5 py-5 sm:px-7">
        <div ref={nameWrapRef} className="flex flex-col gap-1.5">
          <label htmlFor="req-name" className="text-sm font-semibold">
            Ismingiz <span className="text-danger-ink" aria-hidden>*</span>
          </label>
          <input
            ref={nameRef}
            id="req-name"
            data-autofocus
            name="name"
            type="text"
            autoComplete="name"
            maxLength={NAME_MAX}
            required
            placeholder="Masalan: Sinovchi 01"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
            }}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "req-name-error" : undefined}
            className={`${fieldBase} ${errors.name ? "border-danger" : "border-line"}`}
          />
          {errors.name && (
            <p id="req-name-error" className="flex items-center gap-1.5 text-sm font-medium text-danger-ink">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {errors.name}
            </p>
          )}
        </div>

        <div ref={cargoWrapRef} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="req-cargo" className="text-sm font-semibold">
              Yuk tavsifi <span className="text-danger-ink" aria-hidden>*</span>
            </label>
            <span id="req-cargo-count" className="text-xs tabular-nums text-muted" aria-live="off">
              {cargo.length}/{CARGO_MAX}
            </span>
          </div>
          <textarea
            ref={cargoRef}
            id="req-cargo"
            name="cargo"
            rows={3}
            maxLength={CARGO_MAX}
            required
            placeholder="Masalan: 2 quti kitob"
            value={cargo}
            onChange={(e) => {
              setCargo(e.target.value);
              if (errors.cargo) setErrors((er) => ({ ...er, cargo: undefined }));
            }}
            aria-invalid={errors.cargo ? true : undefined}
            aria-describedby={errors.cargo ? "req-cargo-error req-cargo-count" : "req-cargo-count"}
            className={`${fieldBase} resize-y ${errors.cargo ? "border-danger" : "border-line"}`}
          />
          {errors.cargo && (
            <p id="req-cargo-error" className="flex items-center gap-1.5 text-sm font-medium text-danger-ink">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {errors.cargo}
            </p>
          )}
        </div>

        {submitError && (
          <p role="alert" className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-medium text-danger-ink">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {submitError}
          </p>
        )}

        <p className="flex items-start gap-2 text-xs text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Bu sinov loyihasi: haqiqiy band qilish yoki xabar yuborish amalga oshirilmaydi.
        </p>
      </div>

      <div className="sticky bottom-0 mt-auto flex flex-col-reverse gap-2 border-t border-line bg-card px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
        <button
          type="button"
          onClick={close}
          className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold hover:bg-bg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ortga
        </button>
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="press group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-on-brand hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          )}
          {submitting ? "Yuborilmoqda…" : "So‘rov yuborish"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="grid min-h-0 md:max-h-[calc(100dvh-48px)] md:grid-cols-[340px_1fr]">
      <TripVisual trip={trip} done={Boolean(record)}>
        {record ? (
          <>
            <PackageCheck className="size-6" aria-hidden />
            <p className="mt-2 font-display text-lg font-extrabold leading-tight">Yukingiz yo‘lga tayyor</p>
            <p className="mt-1 text-sm text-white/80">So‘rov {record.code} raqami bilan saqlandi.</p>
          </>
        ) : null}
      </TripVisual>
      <div className="flex min-h-0 flex-col md:overflow-y-auto">{body}</div>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Yopish"
      className="press grid size-11 shrink-0 place-items-center rounded-full border border-line text-muted hover:bg-bg hover:text-ink"
    >
      <X className="size-5" aria-hidden />
    </button>
  );
}

/** Chap ustun (desktop) / tepadagi foto-banner (mobil): tanlangan qatnov tafsiloti glass kartochkada. */
function TripVisual({ trip, done, children }: { trip: Trip; done: boolean; children?: ReactNode }) {
  return (
    <aside aria-label="Qatnov tafsiloti" className="relative isolate flex min-h-36 flex-col justify-end overflow-hidden p-4 text-white sm:p-5 md:min-h-[540px]">
      <div className="absolute inset-0 -z-10">
        <Photo name={done ? "handover" : "boxes"} sizes="(min-width: 768px) 340px, 100vw" tone={done ? "green" : "teal"} />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1220]/90 via-[#0b1220]/45 to-[#0b1220]/10" />
      <div className="glass rounded-[20px] p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded-lg bg-white/20 px-2.5 py-1 font-mono text-sm font-bold tabular-nums">{trip.id}</span>
          <p className="min-w-0 break-words font-display text-lg font-extrabold leading-tight">{routeLabel(trip)}</p>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          <span>
            Jo‘nash vaqti: <strong className="font-semibold text-white tabular-nums">{whenLabel(trip)}</strong>
            <span className="hidden md:inline"> · {dayLabel(trip.date)}</span>
          </span>
        </p>
      </div>
      {children && <div className="mt-3 hidden md:block">{children}</div>}
    </aside>
  );
}
