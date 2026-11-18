import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const headers = new Headers({ Location: new URL("/kirish", request.url).toString() });
  headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return new Response(null, { status: 303, headers });
}
