import { cookies } from "next/headers";
import { deviceCookie, springUrl } from "@/lib/api";

const PASS = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control", "etag", "last-modified", "x-content-type-options"];

// 사진·영상을 Spring에서 그대로 스트리밍한다. Range를 넘겨 영상 탐색을 지원한다.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{12}$/.test(id)) return new Response(null, { status: 404 });
  const headers: Record<string, string> = {};
  const cookie = deviceCookie((await cookies()).get("dn_device")?.value);
  if (cookie) headers.cookie = cookie;
  for (const name of ["range", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  try {
    const upstream = await fetch(springUrl(`/api/media/${id}`), { headers, cache: "no-store", signal: request.signal });
    const out = new Headers();
    for (const name of PASS) { const value = upstream.headers.get(name); if (value) out.set(name, value); }
    return new Response(upstream.ok || upstream.status === 304 ? upstream.body : null, { status: upstream.status, headers: upstream.ok ? out : undefined });
  } catch {
    return new Response(null, { status: 503 });
  }
}
