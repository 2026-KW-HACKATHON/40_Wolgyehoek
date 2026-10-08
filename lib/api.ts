import "server-only";
import { cookies } from "next/headers";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const springUrl = (path: string) => `${process.env.SPRING_API_URL ?? "http://localhost:8080"}${path}`;
export const deviceCookie = (value: string | undefined) => value && /^d_[0-9a-f]{16}$/.test(value) ? `dn_device=${value}` : null;

export const PUBLIC_DATA_TAG = "public-data";

// shared: 기기와 무관한 공개 조회를 5분간 공유 캐시한다. 쓰기 액션이 PUBLIC_DATA_TAG를 비운다.
export async function api<T>(path: string, options: { method?: string; body?: unknown; shared?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  const cookie = options.shared ? null : deviceCookie((await cookies()).get("dn_device")?.value);
  if (cookie) headers.cookie = cookie;
  let response: Response;
  try {
    response = await fetch(springUrl(path), {
      method: options.method ?? "GET", headers,
      ...(options.shared ? { next: { revalidate: 300, tags: [PUBLIC_DATA_TAG] } } : { cache: "no-store" as const }),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ApiError(503, "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(response.status, error?.message ?? "요청을 처리하지 못했어요.");
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
