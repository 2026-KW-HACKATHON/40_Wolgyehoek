import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { analyzeIntake, publishIntake } from "@/app/intake-actions";
import { publishCard } from "@/app/actions";
import { api } from "@/lib/api";
import { knowledgeGraph } from "@/lib/queries";
import type { IdeaCheck } from "@/lib/domain/ideas";

vi.mock("node:dns/promises", () => ({ lookup: vi.fn() }));
vi.mock("@/app/actions", () => ({ publishCard: vi.fn(async () => ({ ok: true })) }));
vi.mock("@/lib/api", () => ({ api: vi.fn(), ApiError: class extends Error {} }));
vi.mock("@/lib/queries", () => ({ knowledgeGraph: vi.fn() }));

const lookupAll = vi.mocked(lookup as (hostname: string, options: { all: true }) => Promise<LookupAddress[]>);
const idea = "월계1동 홀몸 어르신 안부를 매일 확인하는 서비스";
const check: IdeaCheck = {
  concepts: [{ key: "ELDER_CARE", label: "어르신 돌봄" }],
  zone: { key: "WIDE", label: "동 전역" }, topic: "CARE", related: [],
  outcome: { attempts: 6, going: 5, stopped: 0, open: 1, reasons: [], since: 2020 },
};

beforeEach(() => {
  lookupAll.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  vi.mocked(api).mockImplementation(async (path) => path === "/api/assist/draft"
    ? { title: idea, target: "어르신", place: "월계1동", effect: "고립 감소", source: "RULE" } : check);
  vi.mocked(knowledgeGraph).mockResolvedValue({ nodes: [], links: [], signals: [], types: { IDEA: "", NEED: "", PLACE: "", ACTOR: "", BENEFICIARY: "", BARRIER: "", SOURCE: "" }, ideas: 0 });
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("등록 서버 액션", () => {
  it("텍스트 입력은 기존 초안·중복 API를 호출한다", async () => {
    const result = await analyzeIntake({ mode: "text", text: idea, source: "", place: "" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.check?.outcome.attempts).toBe(6);
    expect(result.draft.source).toBe("rule");
    expect(vi.mocked(api).mock.calls.map(([path]) => path)).toEqual(["/api/assist/draft", "/api/ideas/check"]);
  });
  it("초안 API 실패 시 규칙 초안과 중복 조회를 계속 제공한다", async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error("draft unavailable"));
    const result = await analyzeIntake({ mode: "text", text: idea, source: "", place: "" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.draft.source).toBe("rule");
    expect(result.check).toEqual(check);
    expect(result.warning).not.toBeNull();
  });
  it("URL 본문은 공개 주소에서 추출하고 원 URL을 출처로 유지한다", async () => {
    const fetchMock = vi.fn(async () => new Response(`<title>지역 돌봄</title><p>${idea}</p>`, { headers: { "content-type": "text/html; charset=utf-8" } }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await analyzeIntake({ mode: "url", text: "https://example.org/article", source: "", place: "" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.source).toBe("https://example.org/article");
    expect(result.text).toContain(idea);
    expect(fetchMock.mock.calls).toHaveLength(1);
  });
  it("사설 주소와 사설 주소로의 리다이렉트는 가져오지 않는다", async () => {
    lookupAll.mockResolvedValueOnce([{ address: "127.0.0.1", family: 4 }]);
    const fetchMock = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private" } }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await analyzeIntake({ mode: "url", text: "http://localhost/private", source: "", place: "" })).ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    lookupAll.mockResolvedValueOnce([{ address: "93.184.216.34", family: 4 }])
      .mockResolvedValueOnce([{ address: "127.0.0.1", family: 4 }]);
    expect((await analyzeIntake({ mode: "url", text: "https://example.org/article", source: "", place: "" })).ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("파일 출처를 보존하고 긴 문서는 기존 초안 API 상한을 지킨다", async () => {
    const result = await analyzeIntake({ mode: "file", text: idea.repeat(300).slice(0, 6000), source: "기획서.pdf", place: "" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.source).toBe("기획서.pdf");
    expect(result.text).toHaveLength(6000);
    const draftRequest = vi.mocked(api).mock.calls[0][1]?.body as { text: string };
    expect(draftRequest.text).toHaveLength(2000);
  });
  it("등록 본문에 출처를 한 번만 붙이고 기존 게시 액션에 전달한다", async () => {
    const form = new FormData();
    form.set("body", idea);
    form.set("intakeSource", "https://example.org/article");
    await publishIntake({ ok: true }, form);
    expect(form.get("body")).toBe(`${idea}\n\n출처: https://example.org/article`);
    await publishIntake({ ok: true }, form);
    expect(String(form.get("body")).match(/출처:/g)).toHaveLength(1);
    expect(publishCard).toHaveBeenCalledTimes(2);
  });
  it("출처 포함 2000자를 넘으면 게시를 호출하지 않는다", async () => {
    const form = new FormData();
    form.set("body", "가".repeat(1990));
    form.set("intakeSource", "https://example.org/article");
    expect((await publishIntake({ ok: true }, form)).ok).toBe(false);
    expect(publishCard).not.toHaveBeenCalled();
  });
});
