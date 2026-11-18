import { authenticate, makeSessionCookie, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const login = String(form.get("login") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const slug = String(form.get("rol") ?? "yuk-egasi").replace(/[^a-z-]/g, "");
  const nextRaw = String(form.get("next") ?? "");
  const next = /^\/(?!\/)[\w\-/?=&%.]*$/.test(nextRaw) ? nextRaw : "/panel";
  const user = login && password ? await authenticate(login, password) : null;
  const url = new URL(user ? next : `/kirish/${slug}?xato=login${nextRaw ? `&next=${encodeURIComponent(next)}` : ""}`, request.url);
  const headers = new Headers({ Location: url.toString() });
  if (user) {
    headers.append("Set-Cookie", `${SESSION_COOKIE}=${makeSessionCookie(user)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${url.protocol === "https:" ? "; Secure" : ""}`);
  }
  return new Response(null, { status: 303, headers });
}
