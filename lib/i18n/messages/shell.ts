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
  description: "지역 문제를 푸는 시도의 결과와 멈춘 이유를 남기고, 다음 팀이 시작할 때 먼저 보여줍니다.",
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
  description: "Keeps what happened to local problem-solving attempts and why they stopped, and shows it to the next team before they start.",
};

export const shell = { ko, en };
