import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CardSummary } from "@/lib/queries";
import { DECISION_LABELS, topicLabel, type Decision } from "@/lib/domain/types";
import { cardSurface } from "@/lib/surface";
import { StatusBadge } from "./ui";

export async function CardItem({ s }: { s: CardSummary }) {
  const { t, locale } = await getT();
  const num = (n: number) => n.toLocaleString(locale, { useGrouping: locale !== "ko" });
  const { card } = s;
  const archiveLabel = card.origin ? (s.latest ? (s.status === "go" ? t.explore.going : null) : t.explore.unknown) : null;
  return <Link href={`/cards/${card.id}`} className="group flex items-center gap-4 rounded-[18px] py-3 outline-offset-4">
    {card.media[0]?.kind === "IMAGE"
      ? <span aria-hidden="true" className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted"><Image src={`/media/${card.media[0].id}`} alt="" fill unoptimized sizes="64px" className="object-cover" /></span>
      : <span aria-hidden="true" className="flex size-16 shrink-0 items-end overflow-hidden rounded-2xl p-2 text-[22px] font-black leading-none text-white" style={{ background: cardSurface(card.id) }}>{card.title.replace(/^\[[^\]]*\]\s*/, "").slice(0, 1)}</span>}
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2">{card.succeededAt ? <span className="bg-brand shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">{t.explore.succeeded}</span> : archiveLabel ? <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{archiveLabel}</span> : <StatusBadge status={s.status} />}{card.sourceYear && <span className="tnum shrink-0 text-xs font-bold text-foreground">{card.sourceYear}</span>}<span className="truncate text-xs text-muted-foreground">{[pick(t.common.topics, card.topic, topicLabel(card.topic)), card.place || t.explore.wolgye].filter(Boolean).join(" · ")}</span></span>
      <span className="mt-1 block truncate text-[15px] font-bold group-hover:text-primary">{card.title}</span>
      <span className="mt-0.5 block truncate text-xs text-[var(--text-4)]">{s.latest ? `${pick(t.common.decisions, s.latest.decision, DECISION_LABELS[s.latest.decision as Decision])} · ${s.latest.reasonTags.map((tag) => pick(t.common.barriers, tag, tag)).join(" · ") || s.latest.reason}` : card.pledges || card.succeededAt ? t.explore.together(num(card.pledges), num(card.goal)) : t.explore.activity(num(s.reactionCount), num(s.opinionCount))}</span>
    </span>
    <ChevronRight className="size-5 shrink-0 text-[var(--text-4)]" />
  </Link>;
}
