import type { RespondentType, Stance } from "./types";

export const MIN_FOR_RATIO = 5;

export interface ReactionLike {
  step: number;
  price: number | null;
  respondentType: RespondentType;
  geoInside: boolean | null;
}
export interface OpinionLike {
  stance: Stance;
  hidden: boolean;
}

export interface Report {
  total: number;
  showRatio: boolean;
  steps: { step: number; count: number; ratio: number | null }[];
  atLeast: { step: number; count: number }[];
  price: { count: number; median: number | null; min: number | null; max: number | null };
  respondents: Record<RespondentType, number>;
  geoInside: number;
  opinions: Record<Stance, number>;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function aggregateReport(reactions: ReactionLike[], opinions: OpinionLike[]): Report {
  const total = reactions.length;
  const showRatio = total >= MIN_FOR_RATIO;
  const steps = [1, 2, 3, 4].map((step) => {
    const count = reactions.filter((r) => r.step === step).length;
    return { step, count, ratio: showRatio && total > 0 ? count / total : null };
  });
  const atLeast = [1, 2, 3, 4].map((step) => ({ step, count: reactions.filter((r) => r.step >= step).length }));
  const prices = reactions.filter((r) => r.step === 3 && r.price !== null).map((r) => r.price as number);
  const respondents: Record<RespondentType, number> = { resident: 0, work_study: 0, visitor: 0 };
  for (const r of reactions) respondents[r.respondentType] += 1;
  const visible = opinions.filter((o) => !o.hidden);
  return {
    total,
    showRatio,
    steps,
    atLeast,
    price: {
      count: prices.length,
      median: median(prices),
      min: prices.length ? Math.min(...prices) : null,
      max: prices.length ? Math.max(...prices) : null,
    },
    respondents,
    geoInside: reactions.filter((r) => r.geoInside === true).length,
    opinions: {
      pro: visible.filter((o) => o.stance === "pro").length,
      con: visible.filter((o) => o.stance === "con").length,
      conditional: visible.filter((o) => o.stance === "conditional").length,
    },
  };
}
