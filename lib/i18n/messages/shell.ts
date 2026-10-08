const ko = {
  brand: "동네서랍",
  nav: { explore: "탐색", problems: "문제", report: "지역 리포트", me: "워크스페이스" },
  mainMenu: "주 메뉴",
  skip: "본문으로 건너뛰기",
  unread: (n: number) => `읽지 않은 소식 ${n}개`,
  newIdea: "아이디어 등록",
  connector: "커넥터",
  switchTo: "English",
  switchLabel: "Switch to English",
  operator: "운영자",
  description: "지역 문제를 풀려는 청년 팀이 바로 쓸 수 있는 아이디어 온톨로지. 같은 문제를 누가, 어디서, 어떻게 시도했고 왜 멈췄는지 보고 시작합니다.",
};

const en: typeof ko = {
  brand: "Dongne Seorap",
  nav: { explore: "Explore", problems: "Problems", report: "Region report", me: "Workspace" },
  mainMenu: "Main menu",
  skip: "Skip to content",
  unread: (n: number) => `${n} unread updates`,
  newIdea: "Add idea",
  connector: "Connector",
  switchTo: "한국어",
  switchLabel: "한국어로 보기",
  operator: "Operator",
  description: "An idea ontology for youth teams tackling local problems. See who tried what, where, how, and why it stopped before you start.",
};

export const shell = { ko, en };
