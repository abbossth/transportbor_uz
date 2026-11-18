import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, Inbox } from "lucide-react";
import { listRequests } from "@/lib/store";
import { RequestsTable } from "@/components/RequestsTable";

export const metadata: Metadata = { title: "Yuborilgan so‘rovlar — TransportBor" };

async function RequestsSection() {
  await connection();
  const { requests } = await listRequests();
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[16px] border border-dashed border-line bg-card px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand-soft text-brand-ink">
          <Inbox className="size-7" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-extrabold">Hozircha so‘rov yo‘q</h2>
          <p className="mt-1 text-muted">Qatnovni tanlab, birinchi so‘rovni yuboring.</p>
        </div>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover">
          Qatnovlarga o‘tish
        </Link>
      </div>
    );
  }
  return <RequestsTable requests={requests} />;
}

export default function RequestsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        Ortga, qatnovlarga
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Yuborilgan so‘rovlar</h1>
      <p className="mt-2 text-muted">Eng yangi so‘rovlar tepada. Bular sinov so‘rovlari — haqiqiy band qilinmagan.</p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-[16px] bg-line/60" aria-hidden />}>
          <RequestsSection />
        </Suspense>
      </div>
    </div>
  );
}
