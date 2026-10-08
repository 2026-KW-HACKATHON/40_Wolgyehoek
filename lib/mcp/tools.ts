import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { knowledgeGraph } from "@/lib/queries";
import type { IdeaCheck } from "@/lib/domain/ideas";
import { STATE_LABELS } from "@/lib/domain/graph";
import {
  buildProblems, elsewhere, needsOf, placesOf, precedentsFor, PRECEDENTS,
  regionReport, searchProblems,
} from "@/lib/domain/problems";
import type { Precedent, Problem, ProblemAttempt } from "@/lib/domain/problems";
import { toolSchemas } from "./catalog";
import { RpcError } from "./protocol";

export { listTools } from "./catalog";
export const siteUrl = "https://dongne-seorap.vercel.app";

const result = (text: string, structuredContent: Record<string, unknown>) =>
  ({ content: [{ type: "text", text }], structuredContent });

function parse<S extends z.ZodType>(schema: S, args: unknown): z.output<S> {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    throw new RpcError(-32602, `입력값을 확인하세요: ${parsed.error.issues.map(i => `${i.path.join(".") || "arguments"}: ${i.message}`).join("; ")}`);
  }
  return parsed.data;
}

const lines = <T,>(items: readonly T[], format: (item: T) => string, empty = "기록이 없습니다.") =>
  items.length ? items.map(item => `- ${format(item)}`).join("\n") : empty;

const problemUrl = (id: string) => `${siteUrl}/problems/${encodeURIComponent(id)}`;
const yearLabel = (year: number) => year > 0 ? `${year}년` : "연도 미확인";
const absoluteHref = (href: string | null) => href ? new URL(href, siteUrl).href : null;
const attempt = (a: ProblemAttempt) => ({
  ...a, year: a.year > 0 ? a.year : null, stateLabel: STATE_LABELS[a.state], url: absoluteHref(a.href),
});
const problemSummary = (p: Problem) => ({
  id: p.id, need: p.need, place: p.place, counts: p.counts,
  topBarriers: p.barriers.slice(0, 3),
  attempts: p.attempts.map(a => ({ id: a.id, title: a.title, year: a.year > 0 ? a.year : null })),
  url: problemUrl(p.id),
});
const problemLine = (p: Problem) =>
  `${p.need.label} · ${p.place.label} (${p.id}): ${p.counts.total}번 시도, 시행 ${p.counts.going}, 멈춤 ${p.counts.stopped}, 검증 중 ${p.counts.live}, 결과 미확인 ${p.counts.unknown}\n  멈춘 이유: ${p.barriers.slice(0, 3).map(b => `${b.label} ${b.count}번`).join(", ") || "기록 없음"}\n  시도: ${p.attempts.map(a => `${a.title} (${yearLabel(a.year)})`).join(", ")}\n  ${problemUrl(p.id)}`;
const precedentLine = (p: Precedent) =>
  `${p.title} (${yearLabel(p.year)}, ${p.country} · ${p.region}) · ${p.approach}\n  ${STATE_LABELS[p.outcome]}: ${p.reason || "이유 기록 없음"} · 대상: ${p.beneficiary} · 주체: ${p.by}\n  출처: ${p.sourceTitle || "제목 미확인"} ${p.sourceUrl || "(URL 기록 없음)"}`;
const groupedPrecedents = (items: Precedent[]) => ({
  domestic: items.filter(p => p.countryCode.toUpperCase() === "KR"),
  overseas: items.filter(p => p.countryCode.toUpperCase() !== "KR"),
});
const precedentSections = (items: Precedent[]) => {
  const grouped = groupedPrecedents(items);
  return `### 국내 선례\n${lines(grouped.domestic, precedentLine, "등록된 국내 선례가 없습니다.")}\n### 해외 선례\n${lines(grouped.overseas, precedentLine, "등록된 해외 선례가 없습니다.")}`;
};

async function execute(name: string, args: unknown) {
  switch (name) {
    case "search_problems": {
      const input = parse(toolSchemas.search_problems, args);
      const matches = searchProblems(buildProblems(await knowledgeGraph()), { text: input.query, need: input.need, place: input.place });
      const problems = matches.slice(0, input.limit ?? 20);
      return result(
        `## 문제 검색\n${matches.length}개 중 ${problems.length}개\n${lines(problems, problemLine, "검색 조건에 맞는 문제 기록이 없습니다.")}`,
        { total: matches.length, returned: problems.length, problems: problems.map(problemSummary) },
      );
    }
    case "get_problem": {
      const input = parse(toolSchemas.get_problem, args);
      const problems = buildProblems(await knowledgeGraph());
      const p = problems.find(p => p.id === input.problem_id);
      if (!p) return { content: [{ type: "text", text: `문제 '${input.problem_id}'의 기록이 없습니다. search_problems로 problem_id를 확인하세요.` }], isError: true };
      const other = elsewhere(problems, p);
      const timeline = [...p.attempts].sort((a, b) => a.year - b.year).map(attempt);
      return result(
        `## ${p.need.label} · ${p.place.label}\n${problemUrl(p.id)}\n### 지난 시도\n${lines(timeline, a => `${a.year ? `${a.year}년` : "연도 미확인"} · ${a.title} · ${a.stateLabel}\n  주체: ${a.actor || "기록 없음"} · 멈춘 이유: ${a.barriers.join(", ") || "기록 없음"}\n  ${a.url || ""} 출처: ${a.sourceUrl || "기록 없음"}`)}\n### 멈춘 이유\n${lines(p.barriers, b => `${b.label}: ${b.count}번`)}\n### 대상\n${lines(p.beneficiaries, b => `${b.label}: ${b.count}번`)}\n### 같은 니즈의 다른 장소\n${lines(other.local, problemLine, "같은 니즈를 다룬 다른 장소의 기록이 없습니다.")}\n${precedentSections(other.precedents)}`,
        { ...p, attempts: timeline, elsewhere: other.local.map(problemSummary), precedents: groupedPrecedents(other.precedents), url: problemUrl(p.id) },
      );
    }
    case "find_similar_attempts": {
      const input = parse(toolSchemas.find_similar_attempts, args);
      const check = await api<IdeaCheck>("/api/ideas/check", { method: "POST", body: { title: input.idea, body: input.idea, place: input.idea } });
      const precedents = precedentsFor(check.concepts.map(c => c.key));
      const related = check.related.map(a => ({
        ...a,
        url: `${siteUrl}/cards/${encodeURIComponent(a.id)}`,
        takeoverUrl: a.canTakeOver || a.status === "UNKNOWN"
          ? `${siteUrl}/cards/${encodeURIComponent(a.id)}/takeover` : null,
      }));
      const summary = check.outcome.attempts
        ? `이미 ${check.outcome.attempts}번 나온 아이디어`
        : "등록된 유사 시도가 없습니다. 새로운 아이디어라는 뜻은 아닙니다.";
      const nextSteps = related.filter(a => a.takeoverUrl).map(a => ({
        action: `${a.title}: ${a.statusLabel} 기록과 ${a.reason || "미확인 결과"}를 확인하고 이어받기를 검토하세요.`,
        url: a.takeoverUrl,
      }));
      return result(
        `## ${summary}\n개념: ${check.concepts.map(c => `${c.label} (${c.key})`).join(", ") || "분류된 개념 없음"}\n장소: ${check.zone.label} (${check.zone.key})\n시행 ${check.outcome.going}, 멈춤 ${check.outcome.stopped}, 검증 중·결과 미확인 ${check.outcome.open}\n### 관련 시도\n${lines(related, a => `${a.title} (${yearLabel(a.year)}) · ${a.statusLabel}${a.succeeded ? " · 목표 달성 기록 있음" : ""}\n  결과: ${a.decision || "결과 미확인"} · 이유: ${[...a.reasonTags, a.reason].filter(Boolean).join(", ") || "기록 없음"}\n  출처: ${a.sourceTitle || "제목 미확인"} ${a.sourceUrl || "(URL 기록 없음)"}\n  ${a.url}${a.takeoverUrl ? `\n  이어받기: ${a.takeoverUrl}` : ""}`, "관련 시도 기록이 없습니다.")}\n${precedentSections(precedents)}\n### 다음 단계\n${lines(nextSteps, step => `${step.action}\n  ${step.url}`, "이어받기 후보가 없습니다. 기존 결과와 필요·장소를 확인한 뒤 새 시도를 검토하세요.")}`,
        { ...check, summary, related, precedents: groupedPrecedents(precedents), nextSteps },
      );
    }
    case "get_region_report": {
      const input = parse(toolSchemas.get_region_report, args);
      const graph = await knowledgeGraph();
      if (input.place && !placesOf(graph).some(p => p.key === input.place)) {
        return { content: [{ type: "text", text: "등록된 장소 키가 아닙니다. list_vocabulary로 확인하세요." }], isError: true };
      }
      const report = regionReport(graph, input.place);
      const url = `${siteUrl}/report${input.place ? `?place=${encodeURIComponent(input.place)}` : ""}`;
      return result(
        `## ${report.place?.label ?? "전체 지역"} 보고서\n${url}\n총 ${report.totals.total}번 시도 · 시행 ${report.totals.going} · 멈춤 ${report.totals.stopped} · 검증 중 ${report.totals.live} · 결과 미확인 ${report.totals.unknown}\n### 주요 문제\n${lines(report.problems, problemLine)}\n### 멈춘 이유 분포\n${lines(report.barriers, b => `${b.label}: ${b.count}번`)}\n### 시도 기록이 없는 니즈\n${lines(report.whitespace, n => `${n.label} (${n.key})`)}\n기록이 없다는 뜻이며 실제 필요나 활동이 없다는 뜻은 아닙니다.\n### 검증 중인 시도\n${lines(report.live, a => `${a.title} (${yearLabel(a.year)}) ${absoluteHref(a.href) || ""}`)}\n### 신호\n${lines(report.signals, s => `${s.label} · ${s.title}: ${s.detail}`)}`,
        { ...report, problems: report.problems.map(problemSummary), live: report.live.map(attempt), url },
      );
    }
    case "list_precedents": {
      const input = parse(toolSchemas.list_precedents, args);
      const country = input.country?.toLowerCase();
      const precedents = (input.need ? precedentsFor([input.need]) : PRECEDENTS)
        .filter(p => !country || p.country.toLowerCase() === country || p.countryCode.toLowerCase() === country);
      return result(`## 국내외 선례 ${precedents.length}개\n${lines(precedents, precedentLine, "조건에 맞는 등록된 선례가 없습니다.")}`, { total: precedents.length, precedents });
    }
    case "list_vocabulary": {
      parse(toolSchemas.list_vocabulary, args);
      const graph = await knowledgeGraph();
      const needs = needsOf(graph);
      const places = placesOf(graph);
      return result(
        `## 검색용 용어\n### 니즈\n${lines(needs, n => `${n.key}: ${n.label}`, "등록된 니즈가 없습니다.")}\n### 장소\n${lines(places, p => `${p.key}: ${p.label}`, "등록된 장소가 없습니다.")}`,
        { needs, places },
      );
    }
    default:
      throw new RpcError(-32602, `등록되지 않은 도구입니다: ${name}`);
  }
}

export async function callTool(name: string, args: unknown) {
  try {
    return await execute(name, args);
  } catch (error) {
    if (error instanceof RpcError) throw error;
    return {
      content: [{ type: "text", text: error instanceof ApiError ? error.message : "도구 실행 중 오류가 발생했습니다. 잠시 후 다시 시도하세요." }],
      isError: true,
    };
  }
}
