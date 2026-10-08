import type { IdeaCheck, IdeaRelated } from "@/lib/domain/ideas";

export interface TeamMemory { team: string; place: string; topic: string }
export interface ResearchQuestion {
  key: "scale" | "existing" | "operator";
  label: string;
  prompt: string;
  options: string[];
}

export function researchQuestions(text: string, check: IdeaCheck | null, memory: TeamMemory): ResearchQuestion[] {
  const questions: ResearchQuestion[] = [];
  if (!/\d+\s*(명|가구|세대|사람)/.test(text)) {
    questions.push({
      key: "scale", label: "대상 규모", prompt: "몇 명·가구를 대상으로 조사할까요?",
      options: ["규모 미확인 · 수요 조사 예정", "10가구부터 조사 (가설)", "30명부터 조사 (가설)"],
    });
  }
  if (!/기존\s*(제도|사업|서비스).{0,60}(확인|차이|다르|비교)|차별점\s*[:：]|조사 메모[\s\S]*기존 제도/.test(text)) {
    const going = check?.related.find((r) => r.succeeded || ["GO", "GOING"].includes(r.status.toUpperCase()));
    questions.push({
      key: "existing", label: "기존 제도·사업",
      prompt: going ? `시행 중인 「${going.title}」와 무엇이 다른가요?` : "기존 제도·사업과의 차이를 확인했나요?",
      options: ["기존 사업 확인 후 차이 조사", "현장 방문·대면 확인을 보완", "기존 사업의 미지원 대상을 조사"],
    });
  }
  if (!/(?:운영|담당)\s*(?:주체|팀|기관)?\s*[:：]\s*(?!(?:없음|미정|미확인|모름))\S+|(?:팀|센터|동아리|기관|학생들?)이?\s*(?:운영을 맡|계속 운영|이어갈|이어가)/.test(text) &&
      !/조사 메모[\s\S]*운영 주체/.test(text)) {
    const missing = check?.outcome.reasons.some((r) => r.tag === "운영 주체 없음");
    questions.push({
      key: "operator", label: "운영 주체",
      prompt: missing || /수업|학기|과제/.test(text) ? "수업 종료 후 누가 이어가나요?" : "운영은 누가 맡나요?",
      options: ["운영 주체 미정 · 인계 계획 조사", ...(memory.team ? [`${memory.team}에서 인계 계획 수립`] : ["학생팀에서 인계 계획 수립"]), "주민센터·복지기관과 운영 협의"],
    });
  }
  return questions.slice(0, 3);
}

export function takeoverCandidates(related: IdeaRelated[]) {
  return related.filter((r) => r.canTakeOver || ["STOP", "STOPPED", "HOLD", "STALE", "UNKNOWN"].includes(r.status.toUpperCase()) ||
    /미확인|중단|보류|정체|멈춤/.test(r.statusLabel));
}

export function researchMemo(questions: ResearchQuestion[], answers: Partial<Record<ResearchQuestion["key"], string>>) {
  const lines = questions.flatMap((q) => answers[q.key] ? [`${q.label}: ${answers[q.key]}`] : []);
  return lines.length ? `\n\n조사 메모\n${lines.join("\n")}` : "";
}
