import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, RotateCcw } from "lucide-react";
import { Card } from "./ui/Card";
import type { CardSummary } from "@/lib/queries";
import { DECISION_LABELS, type Decision } from "@/lib/domain/types";
import { StatusBadge, fmtDate } from "./ui";

export function CardItem({ s }: { s: CardSummary }) {
  const { card } = s;
  const isOpen = s.status === "open";
  return <Link href={`/cards/${card.id}`} className="group block h-full rounded-2xl outline-offset-4">
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border/80 transition-colors group-hover:border-primary/50">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-[var(--brand-soft)] px-5 py-3.5"><span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0 text-primary/70" /><span className="truncate">{card.place || "월계1동"}</span></span><StatusBadge status={s.status} /></div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex min-h-4 flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">{card.isSeed ? <span>예시 아이디어</span> : <span>{card.proposerName}의 제안</span>}{card.parentId && <span className="flex items-center gap-1 text-primary"><RotateCcw className="size-3" />이어받은 시도</span>}</div>
        <h3 className="line-clamp-2 text-[19px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">{card.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{card.body}</p>
        {s.latest && <div className="mt-4 rounded-lg bg-muted/70 px-3 py-2.5"><p className="line-clamp-1 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">{DECISION_LABELS[s.latest.decision as Decision]}</span><span className="mx-1.5 text-border">/</span>{s.latest.reasonTags.length ? s.latest.reasonTags.join(" · ") : s.latest.reason || "결론을 기록했어요."}</p></div>}
        <div className="mt-auto flex items-center gap-3 pt-5 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><MessageCircle className="size-3.5" />반응 <strong className="tnum font-medium text-foreground">{s.reactionCount}</strong></span><span>의견 <strong className="tnum font-medium text-foreground">{s.opinionCount}</strong></span><span className="ml-auto whitespace-nowrap">{isOpen ? `~${fmtDate(card.endsAt)}` : fmtDate(card.endsAt)}</span></div>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3.5 text-xs font-semibold text-primary"><span>{isOpen ? "생각 보태기" : "결과와 이야기 보기"}</span><ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" /></div>
    </Card>
  </Link>;
}
