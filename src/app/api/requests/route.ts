import { connection } from "next/server";
import { findTrip } from "@/lib/trips";
import { validateRequest } from "@/lib/validate";
import { buildRecord, getTrips, listRequests, saveRequest } from "@/lib/store";
import type { ApiResponse, RequestRecord } from "@/lib/types";
import { getSession } from "@/lib/auth";

function json<T>(body: ApiResponse<T>, status = 200) {
  return Response.json(body, { status });
}

export async function GET() {
  await connection();
  const { requests } = await listRequests();
  return json<RequestRecord[]>({ ok: true, data: requests });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "So‘rov formati noto‘g‘ri." }, 400);
  }

  const { trips } = await getTrips();
  const result = validateRequest(body, trips.map((t) => t.id));
  if (!result.ok) {
    return json({ ok: false, message: "Ma’lumotlarni tekshirib, qayta yuboring.", errors: result.errors }, 400);
  }

  const trip = findTrip(trips, result.data.tripId);
  if (!trip) {
    return json({ ok: false, message: "Bunday qatnov topilmadi.", errors: { tripId: "Bunday qatnov topilmadi." } }, 400);
  }

  try {
    const session = await getSession().catch(() => null);
    const record0 = buildRecord(result.data, trip);
    if (session) record0.owner = session.login;
    const { record } = await saveRequest(record0);
    return json<RequestRecord>({ ok: true, data: record }, 201);
  } catch (error) {
    console.error("[requests] saqlashda xato:", error);
    return json({ ok: false, message: "So‘rovni saqlab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring." }, 500);
  }
}
