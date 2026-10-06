import { describe, expect, it } from "vitest";
import { canConclude, canTakeOver, cardStatus, periodEnd, STALE_DAYS } from "@/lib/domain/status";
import { aggregateReport, median } from "@/lib/domain/report";
import { bigrams, jaccard, similarCards } from "@/lib/domain/similarity";
import { isInsideWolgye1 } from "@/lib/domain/geo";
import { cardInput, conclusionInput, opinionInput, validatePrice } from "@/lib/domain/validation";
import { draftFromText, toTitle } from "@/lib/domain/draft";

const DAY = 86_400_000;
const now = new Date("2026-09-27T12:00:00+09:00");

describe("cardStatus", () => {
  it("기간 중이면 open", () => expect(cardStatus(new Date(now.getTime() + DAY), null, now)).toBe("open"));
  it("기간이 끝나고 결론이 없으면 closed", () => expect(cardStatus(new Date(now.getTime() - DAY), null, now)).toBe("closed"));
  it("결론이 있으면 결론을 따른다", () => expect(cardStatus(new Date(now.getTime() - DAY), "hold", now)).toBe("hold"));
  it(`종료 후 ${STALE_DAYS}일간 결론이 없으면 stale`, () =>
    expect(cardStatus(new Date(now.getTime() - (STALE_DAYS + 1) * DAY), null, now)).toBe("stale"));
  it("이어받기는 hold/stop/stale만", () => {
    expect(canTakeOver("hold")).toBe(true);
    expect(canTakeOver("stale")).toBe(true);
    expect(canTakeOver("open")).toBe(false);
    expect(canTakeOver("go")).toBe(false);
  });
  it("결론은 검증 종료 뒤에만", () => {
    expect(canConclude("open")).toBe(false);
    expect(canConclude("closed")).toBe(true);
  });
  it("periodEnd는 주 단위로 더한다", () => expect(periodEnd(now, 2).getTime() - now.getTime()).toBe(14 * DAY));
});

describe("aggregateReport", () => {
  const r = (step: number, price: number | null = null) => ({ step, price, respondentType: "resident" as const, geoInside: null });
  it("5명 미만이면 비율을 숨긴다", () => {
    const rep = aggregateReport([r(1), r(2), r(3, 5000)], []);
    expect(rep.showRatio).toBe(false);
    expect(rep.steps.every((s) => s.ratio === null)).toBe(true);
  });
  it("5명 이상이면 비율과 가격 중앙값", () => {
    const rep = aggregateReport([r(1), r(2), r(3, 3000), r(3, 5000), r(3, 10000), r(4)], [{ stance: "pro", hidden: false }, { stance: "con", hidden: true }]);
    expect(rep.showRatio).toBe(true);
    expect(rep.steps[2].ratio).toBeCloseTo(0.5);
    expect(rep.price.median).toBe(5000);
    expect(rep.opinions).toEqual({ pro: 1, con: 0, conditional: 0 });
    expect(rep.atLeast[2].count).toBe(4);
  });
  it("median 짝수 개", () => expect(median([1000, 3000])).toBe(2000));
});

describe("similarity", () => {
  it("비슷한 제목을 찾는다", () => {
    expect(jaccard(bigrams("주말 플리마켓"), bigrams("광운로 주말 플리마켓"))).toBeGreaterThan(0.2);
    const res = similarCards({ title: "광운로 주말 플리마켓 열기", body: "" }, [
      { id: "a", title: "광운로 주말 플리마켓", body: "", hidden: false },
      { id: "b", title: "석계역 벤치", body: "", hidden: false },
      { id: "c", title: "광운로 주말 플리마켓", body: "", hidden: true },
    ]);
    expect(res.map((x) => x.card.id)).toEqual(["a"]);
  });
});

describe("geo", () => {
  it("광운대 정문 인근은 월계1동 안", () => expect(isInsideWolgye1(37.6195, 127.0588)).toBe(true));
  it("서울시청은 밖", () => expect(isInsideWolgye1(37.5663, 126.9779)).toBe(false));
});

describe("validation", () => {
  it("가격 범위", () => {
    expect(validatePrice("").ok).toBe(false);
    expect(validatePrice(null).ok).toBe(false);
    expect(validatePrice(0)).toEqual({ ok: true, value: 0 });
    expect(validatePrice("5000")).toEqual({ ok: true, value: 5000 });
    expect(validatePrice("-1").ok).toBe(false);
    expect(validatePrice("1000001").ok).toBe(false);
  });
  it("보류/중단은 사유 태그와 사유가 필수", () => {
    expect(conclusionInput.safeParse({ decision: "hold", reasonTags: [], reason: "" }).success).toBe(false);
    expect(conclusionInput.safeParse({ decision: "hold", reasonTags: ["운영 주체 없음"], reason: "운영할 사람이 없음" }).success).toBe(true);
    expect(conclusionInput.safeParse({ decision: "go", reasonTags: [], reason: "" }).success).toBe(true);
  });
  it("조건부 찬성은 조건 필수", () => {
    expect(opinionInput.safeParse({ stance: "conditional", body: "좋아요", condition: "" }).success).toBe(false);
  });
  it("카드 기본 기간은 2주", () => {
    const p = cardInput.parse({ title: "야간 조명", body: "경춘선숲길 밤길이 어두워요 조명이 필요해요", target: "", place: "", effect: "" });
    expect(p.weeks).toBe(2);
  });
});

describe("draftFromText", () => {
  it("장소와 대상을 뽑는다", () => {
    const d = draftFromText("광운대 학생들이랑 경춘선숲길에서 밤에 산책할 때 너무 어두워요");
    expect(d.source).toBe("rule");
    expect(d.title.length).toBeGreaterThan(1);
    expect(d.place).toContain("경춘선숲길");
  });
  it("요청 어미를 떼고 단어 중간에서 자르지 않는다", () => {
    const d = draftFromText("광운로 공터에서 주말마다 주민 플리마켓을 열면 좋겠어요. 광운대 학생 셀러도 참여하고 어르신들도 구경 오시게요.");
    expect(d.title).toBe("광운로 공터에서 주말마다 주민 플리마켓");
    expect(d.target).toBe("어르신, 학생");
    expect(toTitle("석계역 앞에 쉴 수 있는 벤치가 필요해요")).toBe("석계역 앞에 쉴 수 있는 벤치");
  });
});
