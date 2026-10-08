const ko = {
  brand: "동네서랍",
  nav: { explore: "탐색", problems: "문제", report: "지역 리포트", me: "내 서랍" },
  mainMenu: "주 메뉴",
  skip: "본문으로 건너뛰기",
  unread: (n: number) => `읽지 않은 소식 ${n}개`,
  newIdea: "아이디어 등록",
  connector: "커넥터",
  switchTo: "English",
  switchLabel: "Switch to English",
  operator: "운영자",
  description: "지역 문제를 처음 맡은 청년 팀에게 같은 문제를 먼저 시도한 기록과 멈춘 이유를 보여줘, 아이디어를 내기 전에 문제부터 제대로 정의하게 돕습니다.",
};

const en: typeof ko = {
  brand: "Dongne Seorap",
  nav: { explore: "Explore", problems: "Problems", report: "Region report", me: "My drawer" },
  mainMenu: "Main menu",
  skip: "Skip to content",
  unread: (n: number) => `${n} unread updates`,
  newIdea: "Add idea",
  connector: "Connector",
  switchTo: "한국어",
  switchLabel: "한국어로 보기",
  operator: "Operator",
  description: "Shows youth teams new to a local problem who tried the same problem before and why it stopped, so they define the problem before pitching an idea.",
};

export const shell = { ko, en };
