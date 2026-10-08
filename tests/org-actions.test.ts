import { beforeEach, describe, expect, it, vi } from "vitest";
import { enterInstitution, createInstitution, saveInstitutionResponse } from "@/app/org-actions";
import { api, ApiError, PUBLIC_DATA_TAG } from "@/lib/api";
import { revalidatePath, updateTag } from "next/cache";

vi.mock("@/lib/api", () => ({
  api: vi.fn(), PUBLIC_DATA_TAG: "public-data",
  ApiError: class extends Error { constructor(public status: number, message: string) { super(message); } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));
vi.mock("@/lib/i18n/server", async () => {
  const { messages } = await import("@/lib/i18n/messages");
  return { getT: async () => ({ locale: "en", t: messages.en }) };
});
beforeEach(() => vi.clearAllMocks());
const form = (values: Record<string, string>) => {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
};

describe("기관 서버 액션", () => {
  it("기관 코드를 정리해 기기를 연결하고 캐시를 갱신한다", async () => {
    vi.mocked(api).mockResolvedValueOnce({ name: "Institution" });
    expect((await enterInstitution(" ABCDE23456 ")).ok).toBe(true);
    expect(api).toHaveBeenCalledWith("/api/institutions/enter", { method: "POST", body: { code: "ABCDE23456" } });
    expect(updateTag).toHaveBeenCalledWith(PUBLIC_DATA_TAG);
    expect(revalidatePath).toHaveBeenCalledWith("/org");
  });
  it("빈 코드와 잘못된 응답은 API를 호출하지 않는다", async () => {
    expect((await enterInstitution(" ")).ok).toBe(false);
    expect((await saveInstitutionResponse("card", form({ stance: "other", comment: "응답" }))).ok).toBe(false);
    expect((await saveInstitutionResponse("card", form({ stance: "EMPATHY", comment: "x" }))).ok).toBe(false);
    expect((await saveInstitutionResponse("card", form({ stance: "SUPPORT", comment: "가".repeat(501) }))).ok).toBe(false);
    expect(api).not.toHaveBeenCalled();
  });
  it("응답 저장은 카드와 문제 상세를 모두 갱신한다", async () => {
    vi.mocked(api).mockResolvedValueOnce(undefined);
    expect((await saveInstitutionResponse("card/id", form({ stance: "PARTNER", comment: " 협력 검토 " }))).ok).toBe(true);
    expect(api).toHaveBeenCalledWith("/api/cards/card%2Fid/institution-response", { method: "PUT", body: { stance: "PARTNER", comment: "협력 검토" } });
    expect(revalidatePath).toHaveBeenCalledWith("/problems/[id]", "page");
    expect(updateTag).toHaveBeenCalledWith(PUBLIC_DATA_TAG);
  });
  it("기관 생성 응답에서만 코드를 전달한다", async () => {
    vi.mocked(api).mockResolvedValueOnce({ id: "org", name: "기관", code: "ABCDE23456" });
    const result = await createInstitution(form({ name: " 기관 " }));
    expect(result).toMatchObject({ ok: true, name: "기관", code: "ABCDE23456" });
    expect(api).toHaveBeenCalledWith("/api/operator/institutions", { method: "POST", body: { name: "기관" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });
  it("인증 실패는 성공이나 캐시 갱신으로 처리하지 않는다", async () => {
    vi.mocked(api).mockRejectedValueOnce(new ApiError(403, "기관 코드가 맞지 않아요."));
    expect((await enterInstitution("WRONG")).ok).toBe(false);
    expect(updateTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
