import { connection } from "next/server";
import { Database, FlaskConical } from "lucide-react";
import { getDataSource } from "@/lib/store";

export async function DataSourceBadge() {
  await connection();
  const source = await getDataSource();
  const mongo = source === "mongodb";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-semibold text-muted"
      title="Ma’lumot manbai"
    >
      {mongo ? <Database className="size-3.5 text-brand-ink" aria-hidden /> : <FlaskConical className="size-3.5" aria-hidden />}
      <span className="sr-only">Ma’lumot manbai: </span>
      {mongo ? "MongoDB" : "Demo rejim"}
    </span>
  );
}
