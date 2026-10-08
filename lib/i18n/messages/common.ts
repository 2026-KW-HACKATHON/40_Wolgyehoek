const ko = {
  topics: { CARE: "돌봄", COMMERCE: "골목상권", SAFETY: "안전", ENVIRONMENT: "환경", YOUTH: "청년", NEIGHBOR: "이웃" } as Record<string, string>,
  topicShort: { CARE: "돌봄", COMMERCE: "상권", SAFETY: "안전", ENVIRONMENT: "환경", YOUTH: "청년", NEIGHBOR: "이웃" } as Record<string, string>,
  ideaStates: { GOING: "시행", STOPPED: "멈춤", LIVE: "검증 중", UNKNOWN: "결과 미확인" } as Record<string, string>,
  cardStatus: { open: "검증 중", closed: "검증 종료", go: "진행", hold: "보류", stop: "중단", stale: "정체" } as Record<string, string>,
  decisions: { go: "진행", hold: "보류", stop: "중단" } as Record<string, string>,
  stances: { pro: "공감", con: "반론", conditional: "보완" } as Record<string, string>,
  origins: { STUDENT: "학생 프로젝트", POLICY: "구·시 사업", RESIDENT: "주민 제안", PLEDGE: "선거 공약" } as Record<string, string>,
  needs: {} as Record<string, string>,
  places: {} as Record<string, string>,
  placeShort: { KW_STATION: "광운대역", KW_UNIV: "광운대 앞", SEOKGYE: "석계역", YEONGCHUK: "영축산", GYEONGCHUN: "숲길", STREAM: "하천", FACILITY: "복지시설", HOMES: "주거 골목", WIDE: "동 전역" } as Record<string, string>,
  beneficiaries: {} as Record<string, string>,
  barriers: {} as Record<string, string>,
  signals: { DEMAND: "수요 미충족", STALLED: "장벽 해결", SPREAD: "확산", UNVERIFIED: "결과 미확인", CROWDED: "포화", WHITESPACE: "빈칸" } as Record<string, string>,
  nodeTypes: { IDEA: "시도", NEED: "문제 영역", PLACE: "장소", ACTOR: "주체", BENEFICIARY: "대상", BARRIER: "장벽", SOURCE: "출처" } as Record<string, string>,
  respondents: { resident: "거주", work_study: "직장·학교", visitor: "방문" } as Record<string, string>,
  steps: ["괜찮다", "써볼 것 같다", "이 가격이면 쓰겠다", "알림 신청"],
  countries: {} as Record<string, string>,
  times: (n: number) => `${n}번`,
  source: "출처",
  takeover: "이어받기",
  close: "닫기",
  back: "뒤로",
};

const en: typeof ko = {
  topics: { CARE: "Care", COMMERCE: "Local shops", SAFETY: "Safety", ENVIRONMENT: "Environment", YOUTH: "Youth", NEIGHBOR: "Neighbors" },
  topicShort: { CARE: "Care", COMMERCE: "Shops", SAFETY: "Safety", ENVIRONMENT: "Env.", YOUTH: "Youth", NEIGHBOR: "Neighbors" },
  ideaStates: { GOING: "Running", STOPPED: "Stopped", LIVE: "Testing", UNKNOWN: "Outcome unknown" },
  cardStatus: { open: "Testing", closed: "Closed", go: "Go", hold: "On hold", stop: "Stopped", stale: "Stalled" },
  decisions: { go: "Go", hold: "Hold", stop: "Stop" },
  stances: { pro: "Agree", con: "Counterpoint", conditional: "Improve" },
  origins: { STUDENT: "Student project", POLICY: "Public program", RESIDENT: "Resident proposal", PLEDGE: "Election pledge" },
  needs: {
    MARKET: "Markets", SHOP: "Reviving local shops", MEAL: "Eating together", NIGHT: "Night safety", TRAFFIC: "Walking & traffic",
    WEATHER: "Heat, floods & snow", TRASH: "Waste & recycling", GREEN: "Green space & streams", WALK: "Walking & exercise", REPAIR: "Repair & sharing",
    DIGITAL: "Digital literacy", ELDER: "Elder care", CHILD: "Childcare", MENTOR: "Mentoring & learning", SPACE: "Shared spaces",
    CULTURE: "Festivals & culture", GATHER: "Youth–resident exchange", HOUSING: "Student housing", PET: "Pets", HEALTH: "Health & wellbeing",
  },
  places: {
    KW_STATION: "Kwangwoon Univ. Station", KW_UNIV: "Near Kwangwoon Univ.", SEOKGYE: "Seokgye Station", YEONGCHUK: "Mt. Yeongchuk",
    GYEONGCHUN: "Gyeongchun Forest Trail", STREAM: "Jungnang & Ui streams", FACILITY: "Community & welfare centers", HOMES: "Residential alleys", WIDE: "All of Wolgye 1-dong",
  },
  placeShort: { KW_STATION: "KW Station", KW_UNIV: "KW Univ.", SEOKGYE: "Seokgye", YEONGCHUK: "Yeongchuk", GYEONGCHUN: "Trail", STREAM: "Streams", FACILITY: "Centers", HOMES: "Alleys", WIDE: "Whole dong" },
  beneficiaries: { ELDER: "Seniors", YOUTH: "Youth & students", CHILD: "Children & families", MERCHANT: "Merchants", SOLO: "Single households", COMMUTER: "Commuters" },
  barriers: { "운영 주체 없음": "No operator", "예산·공간 부족": "Lack of budget or space", "수요 부족": "Low demand", "규제·허가": "Regulation & permits", "기타": "Other" },
  signals: { DEMAND: "Demand", STALLED: "Blocked", SPREAD: "Spread", UNVERIFIED: "Unverified", CROWDED: "Crowded", WHITESPACE: "Whitespace" },
  nodeTypes: { IDEA: "Attempt", NEED: "Need", PLACE: "Place", ACTOR: "Actor", BENEFICIARY: "Target", BARRIER: "Barrier", SOURCE: "Source" },
  respondents: { resident: "Resident", work_study: "Work/School", visitor: "Visitor" },
  steps: ["Okay", "Might use it", "Would pay this price", "Notify me"],
  countries: { "대한민국": "Korea", "일본": "Japan", "영국": "UK", "네덜란드": "Netherlands", "싱가포르": "Singapore" },
  times: (n: number) => `${n}×`,
  source: "Source",
  takeover: "Take over",
  close: "Close",
  back: "Back",
};

export const common = { ko, en };

// 데이터(백엔드·기록)는 한국어 원문이다. 영어 화면에서는 아는 키만 바꾸고, 모르는 값은 원문을 그대로 보여준다.
export const pick = (map: Record<string, string>, key: string | null | undefined, fallback = "") => (key && map[key]) || fallback;
