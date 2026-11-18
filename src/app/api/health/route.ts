import { getDb } from "@/lib/mongodb";

export async function GET(_request: Request) {
  try {
    const start = Date.now();
    await getDb().command({ ping: 1 });
    return Response.json({ ok: true, db: "connected", latencyMs: Date.now() - start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ ok: false, db: "error", message }, { status: 500 });
  }
}
