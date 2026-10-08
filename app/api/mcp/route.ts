import { handleRpc, rpcError } from "@/lib/mcp/protocol";
import { callTool, listTools } from "@/lib/mcp/tools";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, mcp-session-id, mcp-protocol-version, authorization",
  "Cache-Control": "no-store",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(rpcError(null, -32700, "JSON을 읽을 수 없습니다."), { status: 400, headers });
  }
  const response = await handleRpc(body, { list: listTools, call: callTool });
  return response === null
    ? new Response(null, { status: 202, headers })
    : Response.json(response, { headers });
}

export function GET() {
  return new Response(null, { status: 405, headers: { ...headers, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers });
}
