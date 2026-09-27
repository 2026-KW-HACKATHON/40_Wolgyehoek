import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "dn_device";

export function proxy(request: NextRequest) {
  if (request.cookies.get(COOKIE)) return NextResponse.next();
  const id = `d_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  request.cookies.set(COOKIE, id);
  const res = NextResponse.next({ request: { headers: request.headers } });
  res.cookies.set(COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
