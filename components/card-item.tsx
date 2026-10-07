import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CardSummary } from "@/lib/queries";
import { DECISION_LABELS, topicLabel, type Decision } from "@/lib/domain/types";
import { cardSurface } from "@/lib/surface";
import { StatusBadge } from "./ui";

export function CardItem({ s }: { s: CardSummary }) {
  const { card } = s;
  const archiveLabel = card.origin ? (s.latest ? (s.status === "go" ? "시행" : null) : "미확인") : null;
  return <Link href={`/cards/${card.id}`} className="group flex items-center gap-4 rounded-[18px] py-3 outline-offset-4">
    {card.media[0]?.kind === "IMAGE"
      ? <span aria-hidden="true" className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted"><Image src={`/media/${card.media[0].id}`} alt="" fill unoptimized sizes="64px" className="object-cover" /></span>
      : <span aria-hidden="true" className="flex size-16 shrink-0 items-end overflow-hidden rounded-2xl p-2 text-[22px] font-black leading-none text-white" style={{ background: cardSurface(card.id) }}>{card.title.replace(/^\[[^\]]*\]\s*/, "").slice(0, 1)}</span>}
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2">{card.succeededAt ? <span className="bg-brand shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">성사</span> : archiveLabel ? <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{archiveLabel}</span> : <StatusBadge status={s.status} />}{card.sourceYear && <span className="tnum shrink-0 text-xs font-bold text-foreground">{card.sourceYear}</span>}<span className="truncate text-xs text-muted-foreground">{[topicLabel(card.topic), card.place || "월계1동"].filter(Boolean).join(" · ")}</span></span>
      <span className="mt-1 block truncate text-[15px] font-bold group-hover:text-primary">{card.title}</span>
      <span className="mt-0.5 block truncate text-xs text-[var(--text-4)]">{s.latest ? `${DECISION_LABELS[s.latest.decision as Decision]} · ${s.latest.reasonTags.join(" · ") || s.latest.reason}` : card.pledges || card.succeededAt ? `${card.pledges}/${card.goal}명 함께` : `반응 ${s.reactionCount} · 의견 ${s.opinionCount}`}</span>
    </span>
    <ChevronRight className="size-5 shrink-0 text-[var(--text-4)]" />
  </Link>;
}
