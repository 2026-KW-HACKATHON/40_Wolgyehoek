import { z } from "zod";

const key = z.string().trim().min(1);

export const toolSchemas = {
  search_problems: z.object({
    query: z.string().trim().optional(),
    need: key.optional(),
    place: key.optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }).strict(),
  get_problem: z.object({ problem_id: key }).strict(),
  find_similar_attempts: z.object({ idea: z.string().trim().min(1).max(2000) }).strict(),
  get_region_report: z.object({ place: key.optional() }).strict(),
  list_precedents: z.object({ need: key.optional(), country: key.optional() }).strict(),
  list_vocabulary: z.object({}).strict(),
};

export const toolCatalog = [
  { name: "search_problems", description: "니즈·장소별 문제를 검색합니다. need·place는 list_vocabulary의 키이며 limit은 1~100(기본 20)입니다." },
  { name: "get_problem", description: "검색 결과의 problem_id로 지난 시도, 상태, 멈춘 이유, 대상과 타 지역·국내외 선례를 확인합니다." },
  { name: "find_similar_attempts", description: "한 줄 아이디어를 분석해 유사한 지난 시도와 결과·이유·출처, 같은 니즈의 선례와 이어받기 링크를 찾습니다." },
  { name: "get_region_report", description: "장소별 시도 현황, 주요 문제, 멈춘 이유, 기록이 없는 니즈와 검증 중인 시도·신호를 조회합니다. place는 장소 키이며 생략하면 전체입니다." },
  { name: "list_precedents", description: "같은 니즈의 국내외 선례와 출처를 조회합니다. need는 니즈 키, country는 국가명 또는 국가 코드입니다." },
  { name: "list_vocabulary", description: "문제 검색과 지역 보고서에 사용할 니즈·장소의 키와 한국어 이름을 조회합니다." },
] as const;

export function listTools() {
  return toolCatalog.map(tool => ({
    ...tool,
    inputSchema: z.toJSONSchema(toolSchemas[tool.name]),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  }));
}
