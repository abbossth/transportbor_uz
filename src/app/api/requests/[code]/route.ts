import { getSession } from "@/lib/auth";
import { deleteRequest, getRequest, updateRequest } from "@/lib/store";
import { ALL_STATUSES, CANCELLED, type RequestStatus } from "@/lib/status";
import { CARGO_MAX, isBlank, MESSAGES, normalizeText } from "@/lib/validate";
import type { ApiResponse, RequestRecord } from "@/lib/types";

function json<T>(body: ApiResponse<T>, status = 200) {
  return Response.json(body, { status });
}

async function authorize(code: string) {
  const session = await getSession();
  if (!session) return { error: json({ ok: false, message: "Avval tizimga kiring." }, 401) };
  const record = await getRequest(code);
  if (!record) return { error: json({ ok: false, message: "So‘rov topilmadi." }, 404) };
  return { session, record };
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/requests/[code]">) {
  const { code } = await ctx.params;
  const auth = await authorize(code);
  if ("error" in auth) return auth.error;
  const { session, record } = auth;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: "So‘rov formati noto‘g‘ri." }, 400);
  }

  const patch: Partial<Pick<RequestRecord, "cargo" | "status">> = {};
  const isOwner = session.role === "shipper" && record.owner === session.login;

  if ("cargo" in body) {
    if (!(isOwner || session.role === "admin")) return json({ ok: false, message: "Tahrirlashga ruxsat yo‘q." }, 403);
    if (isBlank(body.cargo)) return json({ ok: false, message: MESSAGES.cargoRequired, errors: { cargo: MESSAGES.cargoRequired } }, 400);
    const cargo = normalizeText(body.cargo as string);
    if (cargo.length > CARGO_MAX) return json({ ok: false, message: MESSAGES.cargoTooLong, errors: { cargo: MESSAGES.cargoTooLong } }, 400);
    patch.cargo = cargo;
  }
  if ("status" in body) {
    const status = body.status as RequestStatus;
    if (!ALL_STATUSES.includes(status)) return json({ ok: false, message: "Noto‘g‘ri holat." }, 400);
    const canSet = session.role === "admin" || session.role === "carrier" || (isOwner && status === CANCELLED);
    if (!canSet) return json({ ok: false, message: "Holatni o‘zgartirishga ruxsat yo‘q." }, 403);
    patch.status = status;
  }
  if (Object.keys(patch).length === 0) return json({ ok: false, message: "O‘zgartirish yo‘q." }, 400);

  await updateRequest(code, patch);
  return json<RequestRecord>({ ok: true, data: { ...record, ...patch } });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/requests/[code]">) {
  const { code } = await ctx.params;
  const auth = await authorize(code);
  if ("error" in auth) return auth.error;
  const { session, record } = auth;
  const allowed = session.role === "admin" || (session.role === "shipper" && record.owner === session.login);
  if (!allowed) return json({ ok: false, message: "O‘chirishga ruxsat yo‘q." }, 403);
  await deleteRequest(code);
  return json({ ok: true, data: { code } });
}
