import { adminExists, createUser, findUser, hashPassword, makeSessionCookie, SESSION_COOKIE, type Role } from "@/lib/auth";

const ROLES: Role[] = ["shipper", "carrier", "admin"];

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
  const login = String(form.get("login") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const role = String(form.get("role") ?? "") as Role;

  const slug = role === "carrier" ? "transport-egasi" : role === "admin" ? "admin" : "yuk-egasi";
  const fail = (code: string) => Response.redirect(new URL(`/kirish/${slug}?tab=royxat&xato=${code}`, request.url), 303);
  if (!name || !/^[a-z0-9_.-]{3,32}$/.test(login) || password.length < 6 || !ROLES.includes(role)) return fail("maydon");
  if (role === "admin" && (await adminExists())) return fail("admin");
  if (await findUser(login)) return fail("band");

  const user = { login, name, role, passwordHash: hashPassword(password), createdAt: new Date().toISOString() };
  try {
    await createUser(user);
  } catch {
    return fail("band");
  }
  const url = new URL("/panel", request.url);
  const headers = new Headers({ Location: url.toString() });
  headers.append("Set-Cookie", `${SESSION_COOKIE}=${makeSessionCookie(user)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${url.protocol === "https:" ? "; Secure" : ""}`);
  return new Response(null, { status: 303, headers });
}
