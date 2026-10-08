import { describe, expect, it } from "vitest";
import { contacts, nextSteps } from "@/lib/domain/next-steps";
import type { IdeaRelated } from "@/lib/domain/ideas";

const rec = (over: Partial<IdeaRelated>): IdeaRelated => ({
  id: "x", title: "시도", status: "UNKNOWN", statusLabel: "", year: 2024, origin: "POLICY", originLabel: "", sourceTitle: "", sourceUrl: "",
  zone: "", shared: [], decision: null, reasonTags: [], reason: "", succeeded: false, canTakeOver: false, score: 1, ...over,
});

describe("nextSteps", () => {
  it("멈춘 이유를 할 일로 바꾸고, 주민 반대는 이유 문장에서 찾는다", () => {
    const steps = nextSteps([
      rec({ title: "청년상가 지원", status: "STOP", decision: "STOP", reasonTags: ["예산·공간 부족"] }),
      rec({ title: "반려동물 쉼터", status: "STOP", decision: "STOP", reasonTags: ["기타"], reason: "주민 반대서명 때문에 설치하지 못했다" }),
    ]);
    expect(steps.map((s) => s.key)).toEqual(["FUNDING", "CONSENT"]);
    expect(steps[0].ref).toBe("청년상가 지원");
  });

  it("같은 할 일은 한 번만, 최대 세 개까지 낸다", () => {
    const steps = nextSteps([
      rec({ decision: "STOP", reasonTags: ["예산·공간 부족", "수요 부족"] }),
      rec({ decision: "HOLD", reasonTags: ["예산·공간 부족", "운영 주체 없음"] }),
      rec({ status: "GO" }),
    ]);
    expect(steps.map((s) => s.key)).toEqual(["FUNDING", "DEMAND", "OPERATOR"]);
  });

  it("멈춘 기록이 없으면 시행 중인 사업과의 차이와 결과 확인을 권한다", () => {
    expect(nextSteps([rec({ title: "AI 안부전화", status: "GO" }), rec({ title: "이팔청춘" })]).map((s) => s.key)).toEqual(["DIFFERENCE", "ASK_RESULT"]);
  });
});

describe("contacts", () => {
  it("담당 부서·기관만 모으고 막연한 구청 이름은 뺀다", () => {
    const list = contacts([rec({ by: "노원구 청년정책과" }), rec({ by: "노원구 청년정책과" }), rec({ by: "노원구" }), rec({ by: "월계1동주민센터" })]);
    expect(list).toEqual([{ name: "노원구 청년정책과", count: 2 }, { name: "월계1동주민센터", count: 1 }]);
  });
});
