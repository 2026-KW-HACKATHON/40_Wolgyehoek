import type { Stance } from "./types";

export const OPINION_KINDS: Record<Stance, { label: string; hint: string; tone: string }> = {
  pro: { label: "공감", hint: "우리 동네도 그래요, 필요해요", tone: "text-primary" },
  con: { label: "반론", hint: "이건 안 될 것 같아요, 이유가 있어요", tone: "text-foreground" },
  conditional: { label: "보완", hint: "이렇게 하면 될 것 같아요", tone: "text-[#1aa174]" },
};
