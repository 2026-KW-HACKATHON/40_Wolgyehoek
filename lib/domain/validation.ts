import { z } from "zod";
import { REASON_TAGS } from "./types";

export const PRICE_MAX = 1_000_000;

export function validatePrice(raw: unknown): { ok: true; value: number } | { ok: false; error: string } {
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(/[,\s원]/g, ""));
  if (!Number.isInteger(n) || n < 0 || n > PRICE_MAX) {
    return { ok: false, error: "가격은 0원부터 1,000,000원 사이의 숫자로 입력해 주세요." };
  }
  return { ok: true, value: n };
}

export const cardInput = z.object({
  title: z.string().trim().min(2, "제목은 2자 이상이어야 해요.").max(60, "제목은 60자 이하로 적어 주세요."),
  body: z.string().trim().min(10, "아이디어를 10자 이상 적어 주세요.").max(2000),
  target: z.string().trim().max(100).default(""),
  place: z.string().trim().max(100).default(""),
  effect: z.string().trim().max(200).default(""),
  weeks: z.coerce.number().int().min(1).max(8).default(2),
});

export const conclusionInput = z
  .object({
    decision: z.enum(["go", "hold", "stop"]),
    reasonTags: z.array(z.enum(REASON_TAGS)).default([]),
    reason: z.string().trim().max(500).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.decision !== "go" && (v.reasonTags.length === 0 || v.reason.length === 0)) {
      ctx.addIssue({ code: "custom", message: "보류·중단은 사유 태그와 사유를 모두 적어야 저장돼요." });
    }
  });

export const opinionInput = z
  .object({
    stance: z.enum(["pro", "con", "conditional"]),
    body: z.string().trim().min(2, "의견을 적어 주세요.").max(500),
    condition: z.string().trim().max(200).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.stance === "conditional" && v.condition.length === 0) {
      ctx.addIssue({ code: "custom", message: "조건부 찬성은 어떤 조건이면 찬성하는지 적어 주세요." });
    }
  });
