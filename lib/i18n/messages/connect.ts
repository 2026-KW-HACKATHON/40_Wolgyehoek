const ko = {
  title: "커넥터",
  lead: "쓰던 AI 앱에서 문제·선례·지역 리포트를 바로 물어보세요.",
  serverUrl: "서버 URL",
  noAuth: "로그인·API 키 없이 연결돼요.",
  ask: "물어보기",
  apps: "연결할 앱",
  copy: "복사",
  copied: "복사됨",
  installCursor: "Cursor에 설치",
  notes: { chatgpt: "웹에서 개발자 모드가 필요해요." } as Record<string, string>,
  steps: {
    claude: ["설정 → 커넥터 → 사용자 지정 커넥터 추가", "이름은 동네서랍, URL은 아래 주소", "새 대화에서 물어보기"],
    chatgpt: ["설정 → 앱 → 고급 설정에서 개발자 모드 켜기", "설정 → 앱 → 만들기, 인증은 없음으로", "새 대화에서 물어보기"],
    cursor: ["버튼으로 설치하거나 ~/.cursor/mcp.json에 추가", "새 대화에서 물어보기"],
    "claude-code": ["터미널에서 추가", "/mcp로 연결 확인"],
    codex: ["터미널에서 추가", "/mcp로 연결 확인"],
  } as Record<string, string[]>,
  example: "월계동 홀몸 어르신 안부 확인 관련 지난 시도와 다른 지역 해법을 찾아줘",
};

const en: typeof ko = {
  title: "Connector",
  lead: "Ask about problems, precedents, and region reports from the AI app you already use.",
  serverUrl: "Server URL",
  noAuth: "No login or API key needed.",
  ask: "Ask",
  apps: "Apps",
  copy: "Copy",
  copied: "Copied",
  installCursor: "Install in Cursor",
  notes: { chatgpt: "Requires developer mode on the web." },
  steps: {
    claude: ["Settings → Connectors → Add custom connector", "Name it Dongne Seorap and use the URL below", "Ask in a new chat"],
    chatgpt: ["Settings → Apps → Advanced settings: turn on developer mode", "Settings → Apps → Create, with no authentication", "Ask in a new chat"],
    cursor: ["Install with the button or add to ~/.cursor/mcp.json", "Ask in a new chat"],
    "claude-code": ["Add from the terminal", "Check the connection with /mcp"],
    codex: ["Add from the terminal", "Check the connection with /mcp"],
  },
  example: "Find past attempts and other regions' solutions for checking in on seniors living alone in Wolgye-dong",
};

export const connect = { ko, en };
