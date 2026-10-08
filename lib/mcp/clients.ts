// 클라이언트 로고: LobeHub Icons(@lobehub/icons-static-svg, MIT)의 공식 로고 SVG. 상표권은 각 회사에 있다.
export const MCP_URL = "https://dongne-seorap.vercel.app/api/mcp";
const NAME = "dongne-seorap";

export interface McpStep { title: string; code?: string }
export interface McpClient { id: string; name: string; logo: string; note?: string; install?: string; steps: McpStep[] }

const ask: McpStep = { title: "새 대화에서 물어보기" };

export const MCP_CLIENTS: McpClient[] = [
  {
    id: "claude",
    name: "Claude",
    logo: "/brand/clients/claude.svg",
    steps: [
      { title: "설정 → 커넥터 → 사용자 지정 커넥터 추가" },
      { title: "이름은 동네서랍, URL은 아래 주소", code: MCP_URL },
      ask,
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    logo: "/brand/clients/chatgpt.svg",
    note: "웹에서 개발자 모드가 필요해요.",
    steps: [
      { title: "설정 → 앱 → 고급 설정에서 개발자 모드 켜기" },
      { title: "설정 → 앱 → 만들기, 인증은 없음으로", code: MCP_URL },
      ask,
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    logo: "/brand/clients/cursor.svg",
    install: `cursor://anysphere.cursor-deeplink/mcp/install?name=${NAME}&config=${Buffer.from(JSON.stringify({ url: MCP_URL })).toString("base64")}`,
    steps: [
      { title: "버튼으로 설치하거나 ~/.cursor/mcp.json에 추가", code: JSON.stringify({ mcpServers: { [NAME]: { url: MCP_URL } } }, null, 2) },
      ask,
    ],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    logo: "/brand/clients/claude-code.svg",
    steps: [
      { title: "터미널에서 추가", code: `claude mcp add --transport http ${NAME} ${MCP_URL}` },
      { title: "/mcp로 연결 확인" },
    ],
  },
  {
    id: "codex",
    name: "Codex",
    logo: "/brand/clients/codex.svg",
    steps: [
      { title: "터미널에서 추가", code: `codex mcp add ${NAME} --url ${MCP_URL}` },
      { title: "/mcp로 연결 확인" },
    ],
  },
];

export const EXAMPLE_PROMPT = "월계동 홀몸 어르신 안부 확인 관련 지난 시도와 다른 지역 해법을 찾아줘";
