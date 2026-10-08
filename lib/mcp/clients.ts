// 클라이언트 로고: LobeHub Icons(@lobehub/icons-static-svg, MIT)의 공식 로고 SVG. 상표권은 각 회사에 있다.
export const MCP_URL = "https://dongne-seorap.vercel.app/api/mcp";
const NAME = "dongne-seorap";

export interface McpStep { code?: string }
export interface McpClient { id: string; name: string; logo: string; install?: string; steps: McpStep[] }

export const MCP_CLIENTS: McpClient[] = [
  { id: "claude", name: "Claude", logo: "/brand/clients/claude.svg", steps: [{}, { code: MCP_URL }, {}] },
  { id: "chatgpt", name: "ChatGPT", logo: "/brand/clients/chatgpt.svg", steps: [{}, { code: MCP_URL }, {}] },
  {
    id: "cursor",
    name: "Cursor",
    logo: "/brand/clients/cursor.svg",
    install: `cursor://anysphere.cursor-deeplink/mcp/install?name=${NAME}&config=${btoa(JSON.stringify({ url: MCP_URL }))}`,
    steps: [{ code: JSON.stringify({ mcpServers: { [NAME]: { url: MCP_URL } } }, null, 2) }, {}],
  },
  { id: "claude-code", name: "Claude Code", logo: "/brand/clients/claude-code.svg", steps: [{ code: `claude mcp add --transport http ${NAME} ${MCP_URL}` }, {}] },
  { id: "codex", name: "Codex", logo: "/brand/clients/codex.svg", steps: [{ code: `codex mcp add ${NAME} --url ${MCP_URL}` }, {}] },
];
