import type { Locale } from "@/lib/i18n/config";
import { intake } from "@/lib/i18n/messages/intake";

import type { IdeaCheck, IdeaRelated } from "@/lib/domain/ideas";

export interface TeamMemory { team: string; place: string; topic: string }
export interface ResearchQuestion {
  key: "scale" | "existing" | "operator";
  label: string;
  prompt: string;
  options: string[];
}

export function researchQuestions(text: string, check: IdeaCheck | null, memory: TeamMemory, locale: Locale = "ko"): ResearchQuestion[] {
  const t = { intake: intake[locale] };
  const questions: ResearchQuestion[] = [];
  if (!/\d+\s*(명|가구|세대|사람|people|persons?|households?|residents?)/i.test(text)) {
    questions.push({
      key: "scale", label: t.intake.scaleLabel, prompt: t.intake.scalePrompt,
      options: [t.intake.scaleUnknown, t.intake.scaleTen, t.intake.scaleThirty],
    });
  }
  if (!/기존\s*(제도|사업|서비스).{0,60}(확인|차이|다르|비교)|차별점\s*[:：]|조사 메모[\s\S]*기존 제도|existing\s+(?:programs?|services?|polic(?:y|ies)).{0,60}(?:check|review|compar|differ)|Research notes[\s\S]*Existing programs/i.test(text)) {
    const going = check?.related.find((r) => r.succeeded || ["GO", "GOING"].includes(r.status.toUpperCase()));
    questions.push({
      key: "existing", label: t.intake.existingLabel,
      prompt: going ? t.intake.existingComparison(going.title) : t.intake.existingPrompt,
      options: [t.intake.existingCheck, t.intake.existingVisit, t.intake.existingGap],
    });
  }
  if (!/(?:운영|담당)\s*(?:주체|팀|기관)?\s*[:：]\s*(?!(?:없음|미정|미확인|모름))\S+|(?:팀|센터|동아리|기관|학생들?)이?\s*(?:운영을 맡|계속 운영|이어갈|이어가)/.test(text) &&
      !/조사 메모[\s\S]*운영 주체|(?:operator|operating team)\s*:\s*(?!(?:none|unknown|undecided|not decided)\b)\S+|(?:team|center|students?)\s+(?:will\s+)?(?:run|operate|continue)|Research notes[\s\S]*Operator/i.test(text)) {
    const missing = check?.outcome.reasons.some((r) => r.tag === "운영 주체 없음");
    questions.push({
      key: "operator", label: t.intake.operatorLabel,
      prompt: missing || /수업|학기|과제|class|semester|assignment/i.test(text) ? t.intake.operatorAfterClass : t.intake.operatorPrompt,
      options: [t.intake.operatorUnknown, ...(memory.team ? [t.intake.teamHandover(memory.team)] : [t.intake.operatorStudent]), t.intake.operatorPartners],
    });
  }
  return questions.slice(0, 3);
}

export function takeoverCandidates(related: IdeaRelated[]) {
  return related.filter((r) => r.canTakeOver || ["STOP", "STOPPED", "HOLD", "STALE", "UNKNOWN"].includes(r.status.toUpperCase()) ||
    /미확인|중단|보류|정체|멈춤/.test(r.statusLabel));
}

export function researchMemo(questions: ResearchQuestion[], answers: Partial<Record<ResearchQuestion["key"], string>>, locale: Locale = "ko") {
  const t = intake[locale];
  const lines = questions.flatMap((q) => answers[q.key] ? [`${q.label}: ${answers[q.key]}`] : []);
  return lines.length ? `\n\n${t.researchMemo}\n${lines.join("\n")}` : "";
}
