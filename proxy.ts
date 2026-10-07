import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "dn_device";

export function proxy(request: NextRequest) {
  if (/^d_[0-9a-f]{16}$/.test(request.cookies.get(COOKIE)?.value ?? "")) return NextResponse.next();
  const id = `d_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  request.cookies.set(COOKIE, id);
  const res = NextResponse.next({ request: { headers: request.headers } });
  res.cookies.set(COOKIE, id, { httpOnly: true, secure: process.env.COOKIE_SECURE === "true" || request.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = {
  // 업로드·미디어 스트림은 proxy가 본문을 버퍼링하지 않도록 제외한다(기기 쿠키는 이미 발급된 상태).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/media|media/).*)"],
};
