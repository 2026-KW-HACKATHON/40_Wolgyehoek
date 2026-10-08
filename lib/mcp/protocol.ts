export type RpcId = string | number | null;
export type RpcResponse =
  | { jsonrpc: "2.0"; id: RpcId; result: unknown }
  | { jsonrpc: "2.0"; id: RpcId; error: { code: number; message: string } };

export class RpcError extends Error {
  constructor(public readonly code: number, message: string) { super(message); }
}

export const rpcError = (id: RpcId, code: number, message: string): RpcResponse =>
  ({ jsonrpc: "2.0", id, error: { code, message } });

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export interface McpService {
  readonly list: () => unknown;
  readonly call: (name: string, args: unknown) => Promise<unknown>;
}

const versions: readonly string[] = ["2025-06-18", "2025-03-26", "2024-11-05"];

async function handleOne(value: unknown, service: McpService): Promise<RpcResponse | null> {
  if (!isObject(value)) return rpcError(null, -32600, "JSON-RPC 요청 객체가 필요합니다.");
  const hasId = Object.hasOwn(value, "id");
  const validId = value.id === null || typeof value.id === "string" ||
    (typeof value.id === "number" && Number.isFinite(value.id));
  const id: RpcId = hasId && (typeof value.id === "string" || typeof value.id === "number") ? value.id : null;
  if (value.jsonrpc !== "2.0" || typeof value.method !== "string" || (hasId && !validId)) {
    return rpcError(id, -32600, "올바른 JSON-RPC 2.0 요청이 아닙니다.");
  }
  // 알림에는 응답하지 않으며 도구 실행도 시작하지 않는다.
  if (!hasId) return null;
  if (value.params !== undefined && !isObject(value.params) && !Array.isArray(value.params)) {
    return rpcError(id, -32600, "params는 객체 또는 배열이어야 합니다.");
  }
  const params = value.params ?? {};
  try {
    let result: unknown;
    switch (value.method) {
      case "initialize": {
        if (!isObject(params) || typeof params.protocolVersion !== "string" ||
          !isObject(params.capabilities) || !isObject(params.clientInfo) ||
          typeof params.clientInfo.name !== "string" || typeof params.clientInfo.version !== "string") {
          throw new RpcError(-32602, "protocolVersion, capabilities, clientInfo가 필요합니다.");
        }
        result = {
          protocolVersion: versions.includes(params.protocolVersion) ? params.protocolVersion : "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "dongne-seorap", version: "1.0.0" },
          instructions: "동네서랍은 필요(니즈)와 장소별로 지난 시도를 모읍니다. 시도에는 시행·멈춤·검증 중·결과 미확인 상태, 장벽, 대상, 주체와 출처가 연결됩니다. list_vocabulary로 키를 확인하고 문제·타 지역 시도·국내외 선례를 탐색하세요. 공개 기록만 조회하며 빈 결과와 미확인 결과는 해결이나 부재의 증거가 아닙니다.",
        };
        break;
      }
      case "ping":
        result = {};
        break;
      case "tools/list":
        result = { tools: service.list() };
        break;
      case "tools/call":
        if (!isObject(params) || typeof params.name !== "string" ||
          (params.arguments !== undefined && !isObject(params.arguments))) {
          throw new RpcError(-32602, "도구 이름과 arguments 객체가 필요합니다.");
        }
        result = await service.call(params.name, params.arguments ?? {});
        break;
      default:
        throw new RpcError(-32601, "지원하지 않는 메서드입니다.");
    }
    return { jsonrpc: "2.0", id, result };
  } catch (error) {
    return error instanceof RpcError
      ? rpcError(id, error.code, error.message)
      : rpcError(id, -32603, "요청 처리 중 내부 오류가 발생했습니다.");
  }
}

export async function handleRpc(value: unknown, service: McpService) {
  if (!Array.isArray(value)) return handleOne(value, service);
  if (value.length === 0) return rpcError(null, -32600, "빈 배치는 허용되지 않습니다.");
  const responses = await Promise.all(value.map(item => handleOne(item, service)));
  const replies = responses.filter((reply): reply is RpcResponse => reply !== null);
  return replies.length ? replies : null;
}
