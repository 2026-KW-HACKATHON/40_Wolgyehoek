"use client";
import { useI18n } from "@/lib/i18n/client";
import type { CardStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function RecordProgress({ status, reactions, published, concluded }: { status: CardStatus; reactions: number; published: boolean; concluded: boolean }) {
  const { t } = useI18n();
  const steps = [
    { label: t.card.proposal, done: true, active: false },
    { label: t.card.reactionCount(reactions), done: reactions > 0, active: status === "open" },
    { label: t.card.report, done: published, active: status !== "open" && !published && !concluded },
    { label: t.card.conclusion, done: concluded, active: status !== "open" && published && !concluded },
  ];
  return <ol aria-label={t.card.progress} className="grid grid-cols-4">
    {steps.map(({ label, done, active }, i) => <li key={i} aria-current={active ? "step" : undefined} className="relative flex flex-col items-center gap-2 text-center">
      {i > 0 && <span aria-hidden="true" className={cn("absolute right-1/2 top-[7px] h-0.5 w-full", done || active ? "bg-primary" : "bg-border")} />}
      <span aria-hidden="true" className={cn("relative size-4 rounded-full border-[3px]", active ? "border-primary bg-background" : done ? "border-primary bg-primary" : "border-border bg-background")} />
      <span className={cn("text-xs font-bold tnum", active ? "text-primary" : done ? "text-foreground" : "text-[var(--text-4)]")}>{label}</span>
    </li>)}
  </ol>;
}
