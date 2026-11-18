import type { RequestRecord } from "@/lib/types";

function formatCreated(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}, ${get("hour")}:${get("minute")}`;
}

export function RequestsTable({ requests }: { requests: RequestRecord[] }) {
  return (
    <>
      {/* Kompyuter: jadval */}
      <div className="hidden overflow-hidden rounded-[16px] border border-line bg-card shadow-card md:block">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">Yuborilgan so‘rovlar ro‘yxati</caption>
          <thead className="bg-bg text-muted">
            <tr>
              <th scope="col" className="w-[120px] px-4 py-3 font-semibold">Raqam</th>
              <th scope="col" className="w-[70px] px-4 py-3 font-semibold">Qatnov</th>
              <th scope="col" className="px-4 py-3 font-semibold">Yo‘nalish</th>
              <th scope="col" className="w-[150px] px-4 py-3 font-semibold">Jo‘nash vaqti</th>
              <th scope="col" className="w-[150px] px-4 py-3 font-semibold">Ism</th>
              <th scope="col" className="px-4 py-3 font-semibold">Yuk tavsifi</th>
              <th scope="col" className="w-[150px] px-4 py-3 font-semibold">Yuborilgan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {requests.map((r) => (
              <tr key={r.code} className="align-top">
                <td className="px-4 py-3 font-mono font-bold tabular-nums text-brand-ink">{r.code}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{r.tripId}</td>
                <td className="break-words px-4 py-3">{r.route}</td>
                <td className="px-4 py-3 tabular-nums">{r.when}</td>
                <td className="break-words px-4 py-3">{r.name}</td>
                <td className="break-words px-4 py-3">{r.cargo}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{formatCreated(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Telefon: kartochkalar */}
      <ul className="flex flex-col gap-3 md:hidden">
        {requests.map((r) => (
          <li key={r.code} className="rounded-[16px] border border-line bg-card p-4 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold tabular-nums text-brand-ink">{r.code}</span>
              <span className="rounded-lg bg-brand-soft px-2 py-0.5 text-sm font-bold tabular-nums text-brand-ink">{r.tripId}</span>
            </div>
            <p className="mt-2 break-words font-semibold">{r.route}</p>
            <p className="text-sm tabular-nums text-muted">{r.when}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted">Ism</dt>
              <dd className="min-w-0 break-words font-medium">{r.name}</dd>
              <dt className="text-muted">Yuk</dt>
              <dd className="min-w-0 break-words font-medium">{r.cargo}</dd>
              <dt className="text-muted">Yuborilgan</dt>
              <dd className="tabular-nums">{formatCreated(r.createdAt)}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
