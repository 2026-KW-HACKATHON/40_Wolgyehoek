import { describe, expect, it } from "vitest";
import { handleRpc, RpcError } from "@/lib/mcp/protocol";
import type { McpService } from "@/lib/mcp/protocol";
import { listTools, toolSchemas } from "@/lib/mcp/catalog";

const service: McpService = {
  list: listTools,
  call: async (name, args) => {
    if (name !== "list_vocabulary") throw new RpcError(-32602, "등록되지 않은 도구");
    if (!toolSchemas.list_vocabulary.safeParse(args).success) throw new RpcError(-32602, "입력 오류");
    return { content: [{ type: "text", text: "" }], structuredContent: { needs: [], places: [] } };
  },
};
const initialize = (protocolVersion: string) => ({
  jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion, capabilities: {}, clientInfo: { name: "test", version: "1" } },
});

describe("MCP JSON-RPC", () => {
  it.each(["2025-06-18", "2025-03-26", "2024-11-05"])("echoes supported protocol %s", async version => {
    const response = await handleRpc(initialize(version), service);
    expect(response).toMatchObject({ jsonrpc: "2.0", id: 1, result: { protocolVersion: version, capabilities: { tools: {} } } });
  });
  it("negotiates a default for an unsupported version", async () => {
    const response = await handleRpc(initialize("future"), service);
    expect(response).toMatchObject({ result: { protocolVersion: "2025-06-18" } });
  });
  it("returns only request replies from mixed batches", async () => {
    const batch = [{ jsonrpc: "2.0", method: "notifications/initialized" }, { jsonrpc: "2.0", id: "ping", method: "ping" }];
    expect(await handleRpc(batch, service)).toEqual([{ jsonrpc: "2.0", id: "ping", result: {} }]);
  });
  it("accepts a notification-only batch without a body", async () => {
    expect(await handleRpc([{ jsonrpc: "2.0", method: "notifications/initialized" }], service)).toBeNull();
  });
  it("rejects empty batches", async () => {
    expect(await handleRpc([], service)).toMatchObject({ id: null, error: { code: -32600 } });
  });
  it.each([null, 1, { jsonrpc: "1.0", id: 1, method: "ping" }, { jsonrpc: "2.0", id: {}, method: "ping" }])("rejects malformed requests %#", async value => {
    expect(await handleRpc(value, service)).toMatchObject({ error: { code: -32600 } });
  });
  it("rejects unknown methods while preserving the ID", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", id: "unknown", method: "missing" }, service))
      .toMatchObject({ id: "unknown", error: { code: -32601 } });
  });
  it("rejects invalid initialize parameters", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", id: 2, method: "initialize", params: {} }, service))
      .toMatchObject({ error: { code: -32602 } });
  });
  it("returns all six tool schemas", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", id: 3, method: "tools/list" }, service))
      .toMatchObject({ result: { tools: listTools() } });
    expect(listTools()).toHaveLength(6);
    expect(listTools().every(t => t.inputSchema.type === "object")).toBe(true);
  });
  it("passes a tool result through the protocol", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "list_vocabulary", arguments: {} } }, service))
      .toMatchObject({ result: { structuredContent: { needs: [], places: [] } } });
  });
  it("rejects unknown tool names", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "missing" } }, service))
      .toMatchObject({ error: { code: -32602 } });
  });
  it("rejects invalid tool arguments", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "list_vocabulary", arguments: { extra: true } } }, service))
      .toMatchObject({ error: { code: -32602 } });
  });
  it("contains unexpected internal failures", async () => {
    const failing = { ...service, call: async () => { throw new TypeError("internal details"); } };
    expect(await handleRpc({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "list_vocabulary" } }, failing))
      .toMatchObject({ error: { code: -32603 } });
  });
});
