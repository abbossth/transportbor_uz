"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, CalendarClock, Info, Loader2, Send, X } from "lucide-react";
import { routeLabel, whenLabel, type Trip } from "@/lib/trips";
import { dayLabel } from "@/lib/dates";
import { CARGO_MAX, NAME_MAX, validateRequest, type FieldErrors } from "@/lib/validate";
import type { ApiResponse, RequestRecord } from "@/lib/types";
import { Confirmation } from "./Confirmation";

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
      <div className="tb-dialog-panel flex max-h-[inherit] flex-col overflow-y-auto overscroll-contain rounded-t-[20px] bg-card text-ink shadow-pop sm:rounded-[20px]">
        <span className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden" aria-hidden />
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

  useEffect(() => {
    if (record) successRef.current?.focus();
    else nameRef.current?.focus();
  }, [record]);

  function focusFirstError(errs: FieldErrors) {
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

  if (record) {
    return <Confirmation ref={successRef} record={record} onBackToList={close} onAgain={again} />;
  }

  const fieldBase =
    "w-full rounded-xl border bg-bg px-4 py-3 text-base text-ink placeholder:text-muted/80 transition-colors focus:bg-card focus:outline-none focus-visible:outline-3 focus-visible:outline-brand";

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:px-6 sm:pt-6">
        <div>
          <p className="text-sm font-semibold text-brand-ink">Tanlangan qatnov</p>
          <h2 id="dialog-title" className="text-xl font-extrabold sm:text-2xl">
            So‘rov yuborish
          </h2>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Yopish"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:bg-bg hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {/* Tafsilot */}
      <section aria-label="Qatnov tafsiloti" className="mx-5 mt-4 rounded-[16px] border border-line bg-bg p-4 sm:mx-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded-lg bg-brand-soft px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-brand-ink">{trip.id}</span>
          <p className="min-w-0 break-words text-lg font-bold">{routeLabel(trip)}</p>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          <span>
            Jo‘nash vaqti: <strong className="font-semibold text-ink tabular-nums">{whenLabel(trip)}</strong>
            <span className="hidden sm:inline"> · {dayLabel(trip.date)}</span>
          </span>
        </p>
      </section>

      <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-1.5">
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

        <div className="flex flex-col gap-1.5">
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
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-medium text-danger-ink">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {submitError}
          </p>
        )}

        <p className="flex items-start gap-2 text-xs text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Bu sinov loyihasi: haqiqiy band qilish yoki xabar yuborish amalga oshirilmaydi.
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-line bg-card px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={close}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold transition-colors hover:bg-bg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ortga
        </button>
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {submitting ? "Yuborilmoqda…" : "So‘rov yuborish"}
        </button>
      </div>
    </form>
  );
}
