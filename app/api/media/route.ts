import { cookies } from "next/headers";
import { deviceCookie, springUrl } from "@/lib/api";

// 브라우저 업로드를 버퍼링 없이 Spring으로 흘려보낸다.
export async function POST(request: Request) {
  const cookie = deviceCookie((await cookies()).get("dn_device")?.value);
  const type = request.headers.get("content-type") ?? "";
  if (!cookie) return Response.json({ message: "새로고침 후 다시 올려 주세요." }, { status: 401 });
  if (!type.startsWith("multipart/form-data") || !request.body) return Response.json({ message: "파일을 골라 주세요." }, { status: 400 });
  try {
    const upstream = await fetch(springUrl("/api/media"), {
      method: "POST", headers: { "content-type": type, cookie }, body: request.body, cache: "no-store",
      duplex: "half", signal: AbortSignal.timeout(120_000),
    } as RequestInit & { duplex: "half" });
    return new Response(upstream.body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" } });
  } catch {
    return Response.json({ message: "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
