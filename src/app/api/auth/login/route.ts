import { authenticate, makeSessionCookie, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const login = String(form.get("login") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = login && password ? await authenticate(login, password) : null;
  const url = new URL(user ? "/panel" : "/kirish?xato=login", request.url);
  const res = Response.redirect(url, 303);
  if (!user) return res;
  const headers = new Headers(res.headers);
  headers.append("Set-Cookie", `${SESSION_COOKIE}=${makeSessionCookie(user)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${url.protocol === "https:" ? "; Secure" : ""}`);
  return new Response(null, { status: 303, headers });
}
