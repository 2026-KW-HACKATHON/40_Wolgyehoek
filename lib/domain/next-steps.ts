import type { IdeaRelated } from "./ideas";

export type StepKey = "FUNDING" | "OPERATOR" | "DEMAND" | "PERMIT" | "CONSENT" | "OVERLAP" | "DIFFERENCE" | "ASK_RESULT";
export interface NextStep { key: StepKey; ref: string }
export interface Contact { name: string; count: number }

const BY_TAG: Record<string, StepKey> = {
  "예산·공간 부족": "FUNDING",
  "운영 주체 없음": "OPERATOR",
  "수요 부족": "DEMAND",
  "규제·허가": "PERMIT",
};
const BY_REASON: [RegExp, StepKey][] = [
  [/반대/, "CONSENT"],
  [/겹|통합|중복/, "OVERLAP"],
];

/** 멈춘 기록의 이유를 다음 팀이 먼저 할 일로 바꾼다. 같은 할 일은 한 번만, 최대 3개. */
export function nextSteps(related: IdeaRelated[]): NextStep[] {
  const out = new Map<StepKey, NextStep>();
  const add = (key: StepKey, ref: string) => { if (!out.has(key)) out.set(key, { key, ref }); };
  const stopped = related.filter((r) => r.decision === "HOLD" || r.decision === "STOP" || r.reasonTags.length > 0);
  for (const r of stopped) {
    for (const [re, key] of BY_REASON) if (re.test(r.reason)) add(key, r.title);
    for (const tag of r.reasonTags) if (BY_TAG[tag]) add(BY_TAG[tag], r.title);
  }
  const running = related.find((r) => r.status === "GO" || r.succeeded);
  if (running) add("DIFFERENCE", running.title);
  const unknown = related.find((r) => r.status === "UNKNOWN");
  if (unknown) add("ASK_RESULT", unknown.title);
  return [...out.values()].slice(0, 3);
}

const DEPARTMENT = /(과|팀|주민센터|주민자치회|캠퍼스타운|센터|구의회)$/;

/** 같은 문제를 맡았던 담당 부서·기관. 구청 전체("노원구")처럼 막연한 이름은 뺀다. */
export function contacts(related: IdeaRelated[]): Contact[] {
  const counts = new Map<string, number>();
  for (const r of related) {
    for (const name of (r.by ?? "").split(/[·,]/).map((s) => s.trim())) {
      if (DEPARTMENT.test(name)) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 3);
}
