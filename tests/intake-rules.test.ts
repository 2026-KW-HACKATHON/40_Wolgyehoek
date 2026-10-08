import { describe, expect, it } from "vitest";
import { researchMemo, researchQuestions, takeoverCandidates } from "@/components/intake/rules";
import type { IdeaCheck, IdeaRelated } from "@/lib/domain/ideas";

const memory = { team: "광운대 3조", place: "월계1동", topic: "CARE" };
const text = "월계1동 홀몸 어르신 안부를 매일 확인하는 서비스를 수업 과제로 만들고 싶어요";
const check: IdeaCheck = {
  concepts: [{ key: "CARE", label: "어르신 돌봄" }], zone: { key: "WIDE", label: "동 전역" }, topic: "CARE",
  related: [], outcome: { attempts: 6, going: 5, stopped: 0, open: 1, reasons: [{ tag: "운영 주체 없음", count: 1 }], since: 2020 },
};

describe("조사 질문 규칙", () => {
  it("동일 입력과 근거는 동일한 최대 세 질문을 만든다", () => {
    const questions = researchQuestions(text, check, memory);
    expect(questions).toEqual(researchQuestions(text, check, memory));
    expect(questions.map((q) => q.key)).toEqual(["scale", "existing", "operator"]);
    expect(questions.every((q) => q.options.length > 0)).toBe(true);
    expect(questions[2].options.some((option) => option.includes(memory.team))).toBe(true);
  });
  it("이미 적힌 조사 항목은 다시 묻지 않는다", () => {
    expect(researchQuestions(`${text} 대상 30가구. 기존 사업 확인 후 차이 조사. 운영 주체: 주민센터`, check, memory)).toEqual([]);
  });
  it("운영 주체 없음과 미정은 빈칸으로 취급한다", () => {
    for (const value of ["없음", "미정", "미확인", "모름"]) {
      expect(researchQuestions(`${text} 운영 주체: ${value}`, check, memory).some((q) => q.key === "operator")).toBe(true);
    }
  });
  it("선례 조회 실패도 조사 질문을 막지 않는다", () => {
    expect(researchQuestions(text, null, memory).map((q) => q.key)).toEqual(["scale", "existing", "operator"]);
  });
  it("선택을 확인한 답만 조사 메모에 저장한다", () => {
    const questions = researchQuestions(text, check, memory);
    expect(researchMemo(questions, {})).toBe("");
    const memo = researchMemo(questions, { scale: "10가구", operator: "주민센터" });
    expect(memo).toContain("대상 규모: 10가구");
    expect(memo).toContain("운영 주체: 주민센터");
    expect(memo).not.toContain("기존 제도");
  });
  it("중단·미확인 시도만 이어받기를 제안한다", () => {
    const related = ["STOPPED", "UNKNOWN", "GOING", "LIVE"].map((status, i) => ({ id: String(i), status, statusLabel: "", canTakeOver: false } as IdeaRelated));
    expect(takeoverCandidates(related).map((r) => r.status)).toEqual(["STOPPED", "UNKNOWN"]);
  });
});
