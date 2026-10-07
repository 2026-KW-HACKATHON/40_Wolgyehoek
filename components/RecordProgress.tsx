import { Check, FileCheck2, Lightbulb, MessageCircle, NotebookPen } from "lucide-react";
import type { CardStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function RecordProgress({ status, reactions, published, concluded }: { status: CardStatus; reactions: number; published: boolean; concluded: boolean }) {
  const steps = [
    { label: "아이디어 제안", detail: "등록 완료", done: true, active: false, icon: Lightbulb },
    { label: "이웃의 반응", detail: `${reactions}건의 반응`, done: reactions > 0, active: status === "open", icon: MessageCircle },
    { label: "검증 리포트", detail: published ? "공개됨" : "공개 전", done: published, active: status !== "open" && !published && !concluded, icon: FileCheck2 },
    { label: "결론과 기록", detail: concluded ? "결론 기록됨" : "기록 전", done: concluded, active: status !== "open" && published && !concluded, icon: NotebookPen },
  ];
  return <ol aria-label="이 아이디어의 기록 흐름" className="grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-[var(--brand-soft)] p-4   ">
    {steps.map(({ label, detail, done, active, icon: Icon }, i) => <li key={label} className="flex items-start gap-2.5"><span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", active ? "bg-primary text-white" : done ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground")} aria-hidden="true">{done && !active ? <Check className="size-4" /> : <Icon className="size-4" />}</span><div className="min-w-0"><p className={cn("text-xs font-semibold leading-5", active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground")}><span className="sr-only">{i + 1}. </span>{label}</p><p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{detail}</p></div></li>)}
  </ol>;
}
