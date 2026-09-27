export interface Draft {
  title: string;
  target: string;
  place: string;
  effect: string;
  source: "rule" | "llm";
}

const PLACES = [
  "광운로", "석계역", "광운대역", "광운대", "경춘선숲길", "우이천", "중랑천", "초안산", "영축산",
  "월계1동 주민센터", "주민센터", "석계역문화공원", "골목", "공터", "시장", "놀이터", "공원", "버스정류장",
];
const TARGETS: [RegExp, string][] = [
  [/어르신|노인|시니어/, "어르신"],
  [/아이|어린이|초등|유아/, "아이와 보호자"],
  [/학생|대학생|광운대/, "학생"],
  [/청년/, "청년"],
  [/1인 가구|혼자/, "1인 가구"],
  [/반려|강아지|고양이/, "반려인"],
  [/소상공인|가게|상인|사장/, "소상공인"],
  [/주민|이웃|동네/, "월계1동 주민"],
];
const EFFECT_HINTS: [RegExp, string][] = [
  [/안전|어두|범죄|가로등/, "밤길 안전이 좋아진다"],
  [/상권|가게|매출|장터|마켓/, "골목 상권에 사람이 모인다"],
  [/쓰레기|환경|재활용|탄소/, "동네 환경이 깨끗해진다"],
  [/교류|모임|함께|이웃/, "이웃 간 교류가 늘어난다"],
  [/접근|휠체어|유모차|계단|배리어/, "이동 약자의 접근성이 좋아진다"],
];

// "~을 열면 좋겠어요", "~가 필요해요" 같은 요청 어미를 떼어 명사형 제목으로 만든다.
const REQUEST_ENDINGS = /\s*(\S*(으면|면)\s*(좋겠|해요|합니다|한다).*|\s*(필요해요|필요합니다|필요하다|해\s?주세요|해\s?주면.*))$/;

export function toTitle(sentence: string): string {
  let t = sentence.replace(REQUEST_ENDINGS, "").replace(/(을|를|이|가|은|는)$/, "").trim();
  if (t.length > 40) t = t.slice(0, 40).replace(/\s+\S*$/, "") + "…";
  return t;
}

export function draftFromText(text: string): Draft {
  const clean = text.replace(/\s+/g, " ").trim();
  const firstSentence = clean.split(/[.!?。\n]/)[0]?.trim() || clean;
  const title = toTitle(firstSentence) || firstSentence.slice(0, 40);
  const place = PLACES.filter((p) => clean.includes(p)).slice(0, 2).join(", ") || "월계1동";
  const target = TARGETS.filter(([re]) => re.test(clean)).map(([, v]) => v).slice(0, 2).join(", ") || "월계1동 주민";
  const effect = EFFECT_HINTS.find(([re]) => re.test(clean))?.[1] ?? "동네 생활이 조금 더 편해진다";
  return { title: title || "새 아이디어", target, place, effect, source: "rule" };
}
