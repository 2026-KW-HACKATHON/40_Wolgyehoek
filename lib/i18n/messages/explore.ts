import type { GraphNode } from "@/lib/domain/graph";
import { common, pick } from "./common";

const ko = {
  heading: "같은 문제, 먼저 시도한 사람들",
  intro: "지역 문제를 누가, 어디서, 어떻게 시도했고 왜 멈췄는지 보고 시작하세요.",
  attempts: "시도",
  problems: "문제",
  repeated: "반복되는 문제",
  stoppedAttempts: "멈춘 시도",
  precedents: "다른 지역 선례",
  allProblems: "전체 문제",
  placeTopic: "장소 × 분야",
  cellLabel: (place: string, topic: string, count: string) => `${place} ${topic} ${count}건`,
  mapHint: "빈칸 · 장소 이름을 누르면 지역 리포트",
  noAttempts: "아직 아무도 시도하지 않았어요",
  firstIdea: "첫 아이디어 등록",
  graphCounts: (ideas: string, links: string) => `${ideas}개 시도 · ${links}개 연결`,
  clearSelection: "선택 해제",
  opportunities: "기회",
  untouchedProblems: "아직 아무도 시도하지 않은 문제",
  signalHint: "공개 기록과 동네서랍 반응으로 계산한 신호예요 · 시장 규모가 아니에요",
  going: "시행",
  stopped: "멈춤",
  testing: "검증 중",
  unknown: "미확인",
  responses: "반응",
  viewProblem: "문제 보기",
  viewNeed: "이 니즈의 문제 보기",
  viewReport: "지역 리포트 보기",
  viewCard: "카드 보기",
  viewOriginal: "원문 보기",
  succeeded: "성사",
  newCombination: "처음 보는 조합이에요",
  already: "이미 ",
  repeatedIdea: " 나온 아이디어",
  sameGroup: "같은 묶음",
  lineageCounts: (stopped: string, going: string) => `멈춤 ${stopped} · 진행 ${going}`,
  since: (year: number) => `${year}년부터 · `,
  stopReasons: "멈춘 이유",
  wolgye: "월계1동",
  brand: "동네서랍",
  actorKinds: { "행정": "행정", "주민 조직": "주민 조직", "대학": "대학", "주민": "주민", "시연": "시연", "기타": "기타" } as Record<string, string>,
  cardStatus: "카드 상태",
  all: "전체",
  done: "결론·종료",
  cardSearch: "카드 검색",
  searchPlaceholder: "아이디어, 장소 검색",
  search: "검색",
  items: (n: string) => `${n}건`,
  together: (pledges: string, goal: string) => `${pledges}/${goal}명 함께`,
  activity: (responses: string, opinions: string) => `반응 ${responses} · 의견 ${opinions}`,
  overview: {
    ideas: "쌓인 아이디어",
    responses: "남겨진 수요 반응",
    takeovers: "이어받은 시도",
    suffix: "건",
    location: "월계1동의 생각이 모이는 곳",
    heading: "동네의 좋은 생각,",
    nextAttempt: "다음 시도",
    headingEnd: "로 이어지다.",
    intro: "내 아이디어에 이웃의 생각을 더해요.",
    introEnd: "함께 확인한 결과는 동네의 기록으로 남아요.",
    submit: "아이디어 올리기",
    browse: "동네 둘러보기",
    waiting: "지금, 이웃의 생각을 기다려요",
    waitingFirst: "첫 번째 이야기를 기다려요",
    example: "예시 카드",
    responsesCount: (n: string) => `반응 ${n}건`,
    opinionsCount: (n: string) => `의견 ${n}개`,
    contribute: "이 아이디어에 생각 보태기",
    emptyHeading: "“우리 동네에 이런 게 있으면?”",
    emptyIntro: "작은 불편도, 함께 해보고 싶은 일도 좋아요. 첫 제안으로 동네의 변화를 시작해 보세요.",
    firstIdea: "첫 아이디어 적어보기",
    statsHint: "예시 카드 제외 · 저장된 기록 기준",
    lineage: "이어진 기록",
    restarted: "다시 시작된 이야기",
    recordHeading: "이전의 기록이,",
    recordHeadingEnd: " 다음의 출발점이 됩니다.",
    previous: "이전 시도",
    preserved: "이전의 반응과 기록을 그대로 보존해요.",
    next: "새로운 시도",
    takenOver: "이전 아이디어를 이어받았어요.",
    steps: [["01", "아이디어를 남기고", "일상의 작은 생각에서 시작해요."], ["02", "이웃의 생각을 듣고", "써볼 의향과 조건을 함께 확인해요."], ["03", "결과를 다시 나눠요", "결론을 남기고, 다음 시도로 이어가요."]],
  },
};

const en: typeof ko = {
  heading: "The same problems, those who tried first",
  intro: "See who tried what, where, and why it stopped before you start.",
  attempts: "Attempts",
  problems: "Problems",
  repeated: "Recurring problems",
  stoppedAttempts: "Stopped attempts",
  precedents: "Examples elsewhere",
  allProblems: "All problems",
  placeTopic: "Place × topic",
  cellLabel: (place, topic, count) => `${place} ${topic}: ${count} attempts`,
  mapHint: "Untouched · Select a place name for its report",
  noAttempts: "No one has tried this yet",
  firstIdea: "Add the first idea",
  graphCounts: (ideas, links) => `${ideas} attempts · ${links} connections`,
  clearSelection: "Clear selection",
  opportunities: "Opportunities",
  untouchedProblems: "Problems no one has tried yet",
  signalHint: "Signals from public records and community responses · Not market size",
  going: "Running",
  stopped: "Stopped",
  testing: "Testing",
  unknown: "Unknown",
  responses: "Responses",
  viewProblem: "View problem",
  viewNeed: "Problems for this need",
  viewReport: "View area report",
  viewCard: "View card",
  viewOriginal: "View original",
  succeeded: "Succeeded",
  newCombination: "A new combination",
  already: "An idea tried ",
  repeatedIdea: " before",
  sameGroup: "Related attempts",
  lineageCounts: (stopped, going) => `Stopped ${stopped} · Running ${going}`,
  since: (year) => `Since ${year} · `,
  stopReasons: "Why it stopped",
  wolgye: "Wolgye 1-dong",
  brand: "Dongne Seorap",
  actorKinds: { "행정": "Government", "주민 조직": "Resident group", "대학": "University", "주민": "Resident", "시연": "Demo", "기타": "Other" },
  cardStatus: "Card status",
  all: "All",
  done: "Concluded",
  cardSearch: "Search cards",
  searchPlaceholder: "Search ideas or places",
  search: "Search",
  items: (n) => `${n} items`,
  together: (pledges, goal) => `${pledges}/${goal} people joining`,
  activity: (responses, opinions) => `Responses ${responses} · Opinions ${opinions}`,
  overview: {
    ideas: "Ideas shared",
    responses: "Demand responses",
    takeovers: "Attempts taken over",
    suffix: "",
    location: "Where Wolgye 1-dong shares ideas",
    heading: "Good neighborhood ideas,",
    nextAttempt: "the next attempt",
    headingEnd: " starts here.",
    intro: "Add your neighbors’ thoughts to your idea.",
    introEnd: "What we learn together becomes our neighborhood’s record.",
    submit: "Share an idea",
    browse: "Explore the neighborhood",
    waiting: "Waiting for your neighbors’ thoughts",
    waitingFirst: "Waiting for the first story",
    example: "Example card",
    responsesCount: (n) => `Responses ${n}`,
    opinionsCount: (n) => `Opinions ${n}`,
    contribute: "Add your thoughts",
    emptyHeading: "“What if our neighborhood had this?”",
    emptyIntro: "Share a small inconvenience or something to try together. Start a change with the first idea.",
    firstIdea: "Write the first idea",
    statsHint: "Excludes example cards · Based on saved records",
    lineage: "Connected records",
    restarted: "A story restarted",
    recordHeading: "Past records",
    recordHeadingEnd: " become the next starting point.",
    previous: "Previous attempt",
    preserved: "Previous responses and records are preserved.",
    next: "New attempt",
    takenOver: "This builds on a previous idea.",
    steps: [["01", "Share an idea", "Start with a small everyday thought."], ["02", "Hear from neighbors", "Explore willingness to use it and the conditions."], ["03", "Share the outcome", "Record the conclusion and build on it."]],
  },
};

export const explore = { ko, en };

const placeKeys: Record<string, string> = {
  "광운대역": "KW_STATION", "광운대 앞": "KW_UNIV", "석계역": "SEOKGYE", "영축산": "YEONGCHUK",
  "경춘선숲길": "GYEONGCHUN", "중랑천·우이천": "STREAM", "주민센터·복지시설": "FACILITY", "주거 골목": "HOMES", "월계1동 전역": "WIDE",
};

export const placeLabel = (label: string, vocab: typeof common.ko) => pick(vocab.places, placeKeys[label], label);

const needKeys: Record<string, string> = {
  "장터·플리마켓": "MARKET", "골목 가게 살리기": "SHOP", "함께 먹기": "MEAL", "밤길·방범": "NIGHT",
  "보행·교통": "TRAFFIC", "폭염·침수·제설": "WEATHER", "쓰레기·분리배출": "TRASH", "녹지·하천": "GREEN",
  "걷기·운동": "WALK", "수리·나눔": "REPAIR", "디지털 배움": "DIGITAL", "어르신 돌봄": "ELDER",
  "아이 돌봄": "CHILD", "멘토링·배움": "MENTOR", "함께 쓰는 공간": "SPACE", "축제·문화": "CULTURE",
  "청년·주민 교류": "GATHER", "자취·주거": "HOUSING", "반려동물": "PET", "건강·마음": "HEALTH",
};

export const needLabel = (label: string, vocab: typeof common.ko) => pick(vocab.needs, needKeys[label], label);

const term = (label: string, vocab: typeof common.ko) =>
  pick(vocab.needs, needKeys[label], "") || pick(vocab.places, placeKeys[label], "") || pick(vocab.barriers, label, label);
const terms = (list: string, vocab: typeof common.ko) => list.split(", ").map((x) => term(x, vocab)).join(", ");

// 기회 신호 문장은 백엔드(KnowledgeGraphService.signals)가 한국어 템플릿으로 만든다. 같은 템플릿을 거꾸로 풀어 영어로 다시 쓴다.
export function signalText(s: { title: string; detail: string }, locale: string, vocab: typeof common.ko) {
  if (locale === "ko") return { title: s.title, detail: s.detail };
  let m: RegExpMatchArray | null;
  let title = s.title.split(" · ").map((x) => terms(x, vocab)).join(" · ");
  if ((m = s.title.match(/^(.+)에 (\d+)명이 반응했어요$/))) title = `${term(m[1], vocab)}: ${m[2]} people responded`;
  else if ((m = s.title.match(/^(.+) · (.+)에서 시행$/))) title = `${term(m[1], vocab)} · running in ${terms(m[2], vocab)}`;
  let detail = s.detail;
  if ((m = s.detail.match(/^아직 시행된 시도가 없어요 · (\d+)번 시도$/))) detail = `Nothing running yet · ${m[1]} attempts`;
  else if ((m = s.detail.match(/^(.+?)(?: 외 (\d+)곳)?은 아직 시도 없음$/))) detail = `No attempts yet in ${terms(m[1], vocab)}${m[2] ? ` and ${m[2]} more` : ""}`;
  else if ((m = s.detail.match(/^(\d+)번 시도 · (\d+)번 멈춤(?: · (.+))?$/))) detail = `${m[1]} attempts · ${m[2]} stopped${m[3] ? ` · ${terms(m[3], vocab)}` : ""}`;
  else if ((m = s.detail.match(/^(\d+)번 나왔지만 결과가 남지 않았어요$/))) detail = `Proposed ${m[1]} times with no recorded outcome`;
  else if ((m = s.detail.match(/^이미 (\d+)건 시행 · 차별점 필요$/))) detail = `${m[1]} already running · needs a new angle`;
  else if (s.detail === "아직 아무도 시도하지 않았어요") detail = "No one has tried this yet";
  return { title, detail };
}

export function graphNodeLabel(node: GraphNode, vocab: typeof common.ko): string {
  const key = node.id.slice(node.id.indexOf(":") + 1);
  switch (node.type) {
    case "NEED": return pick(vocab.needs, key, node.label);
    case "PLACE": return pick(vocab.places, key, node.label);
    case "BENEFICIARY": return pick(vocab.beneficiaries, key, node.label);
    case "BARRIER": return pick(vocab.barriers, node.label, node.label);
    default: return node.label;
  }
}
