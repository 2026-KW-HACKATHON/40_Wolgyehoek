"use client";
import { useI18n } from "@/lib/i18n/client";
import { pick } from "@/lib/i18n/messages/common";
import { placeLabel } from "@/lib/i18n/messages/explore";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { IdeaCheck, IdeaOutcome, IdeaRelated } from "@/lib/domain/ideas";
import type { CardStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./ui";

export function OutcomeBar({ o, className }: { o: IdeaOutcome; className?: string }) {
  if (!o.attempts) return null;
  const pct = (n: number) => `${(n / o.attempts) * 100}%`;
  return <div aria-hidden="true" className={cn("flex h-1.5 overflow-hidden rounded-full bg-muted", className)}>
    <span className="bg-primary" style={{ width: pct(o.going) }} />
    <span className="bg-[#ffd0b0]" style={{ width: pct(o.open) }} />
    <span className="bg-[var(--text-4)]" style={{ width: pct(o.stopped) }} />
  </div>;
}

export function ReasonChips({ o }: { o: IdeaOutcome }) {
  const { t } = useI18n();
  if (!o.reasons.length) return null;
  return <div className="flex flex-wrap gap-1.5">{o.reasons.map(r => <span key={r.tag} className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{pick(t.common.barriers, r.tag, r.tag)}<span className="ml-1 text-primary">{r.count}</span></span>)}</div>;
}

function RelatedRow({ r }: { r: IdeaRelated }) {
  const { t } = useI18n();
  const why = r.decision ? [r.reasonTags.map((tag) => pick(t.common.barriers, tag, tag)).join(" · "), r.reason].filter(Boolean).join(" — ") : "";
  return <li className="py-3">
    <div className="flex items-center gap-2 text-xs text-[var(--text-4)]">
      <span className="tnum font-bold text-foreground">{r.year}</span><span>{pick(t.common.origins, r.origin, r.origin ? r.originLabel : t.explore.brand)}</span><span>·</span><span className="truncate">{placeLabel(r.zone, t.common)}</span>
      <span className="ml-auto shrink-0">{r.succeeded ? <span className="bg-brand rounded-full px-2 py-0.5 text-[11px] font-bold text-white">{t.explore.succeeded}</span> : r.origin ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{r.status === "UNKNOWN" ? t.common.ideaStates.UNKNOWN : r.status === "GO" ? t.common.ideaStates.GOING : pick(t.common.cardStatus, r.status.toLowerCase(), r.statusLabel)}</span> : <StatusBadge status={r.status.toLowerCase() as CardStatus} />}</span>
    </div>
    <Link href={`/cards/${r.id}`} className="mt-1 flex items-center gap-1 text-[15px] font-bold hover:text-primary"><span className="min-w-0 truncate">{r.title}</span><ChevronRight className="size-4 shrink-0 text-[var(--text-4)]" /></Link>
    {why && <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{why}</p>}
    {(r.canTakeOver || r.sourceUrl) && <div className="mt-2 flex items-center gap-3">
      {r.canTakeOver && <Link href={`/cards/${r.id}/takeover`} className="rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-white">{t.common.takeover}</Link>}
      {r.sourceUrl && <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-xs text-[var(--text-4)] hover:text-foreground">{t.common.source}<ArrowUpRight className="size-3" /></a>}
    </div>}
  </li>;
}

export function IdeaLineage({ check, mode }: { check: IdeaCheck; mode: "draft" | "detail" }) {
  const { t, locale } = useI18n();
  const num = (n: number) => n.toLocaleString(locale, { useGrouping: locale !== "ko" });
  const o = check.outcome;
  const tags = [...check.concepts.map(c => `#${pick(t.common.needs, c.key, c.label)}`), pick(t.common.places, check.zone.key, check.zone.label)];
  if (!check.related.length) {
    if (mode === "detail") return null;
    return <section className="rounded-[20px] bg-[var(--brand-soft)] p-5">
      <p className="text-lg font-extrabold tracking-tight">{t.explore.newCombination}</p>
      <p className="mt-2 text-xs text-muted-foreground">{tags.join(" ")}</p>
    </section>;
  }
  return <section className={cn(mode === "draft" && "rounded-[20px] bg-[var(--brand-soft)] p-5")}>
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-tight">{mode === "draft" ? <>{t.explore.already}<span className="text-primary">{t.problems.times(num(o.attempts))}</span>{t.explore.repeatedIdea}</> : t.explore.sameGroup}</h2>
      <span className="tnum shrink-0 text-xs text-[var(--text-4)]">{o.since ? t.explore.since(o.since) : ""}{t.explore.lineageCounts(num(o.stopped), num(o.going))}</span>
    </div>
    <p className="mt-1 text-xs text-muted-foreground">{tags.join(" ")}</p>
    <OutcomeBar o={o} className="mt-3" />
    {o.reasons.length > 0 && <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-muted-foreground">{t.explore.stopReasons}</p><ReasonChips o={o} /></div>}
    <ul className="mt-2 divide-y divide-border">{check.related.map(r => <RelatedRow key={r.id} r={r} />)}</ul>
  </section>;
}
