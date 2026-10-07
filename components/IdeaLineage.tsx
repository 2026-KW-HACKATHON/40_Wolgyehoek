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
  if (!o.reasons.length) return null;
  return <div className="flex flex-wrap gap-1.5">{o.reasons.map(r => <span key={r.tag} className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{r.tag}<span className="ml-1 text-primary">{r.count}</span></span>)}</div>;
}

function RelatedRow({ r }: { r: IdeaRelated }) {
  const why = r.decision ? [r.reasonTags.join(" · "), r.reason].filter(Boolean).join(" — ") : "";
  return <li className="py-3">
    <div className="flex items-center gap-2 text-xs text-[var(--text-4)]">
      <span className="tnum font-bold text-foreground">{r.year}</span><span>{r.originLabel}</span><span>·</span><span className="truncate">{r.zone}</span>
      <span className="ml-auto shrink-0">{r.succeeded ? <span className="bg-brand rounded-full px-2 py-0.5 text-[11px] font-bold text-white">성사</span> : r.origin ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{r.statusLabel}</span> : <StatusBadge status={r.status.toLowerCase() as CardStatus} />}</span>
    </div>
    <Link href={`/cards/${r.id}`} className="mt-1 flex items-center gap-1 text-[15px] font-bold hover:text-primary"><span className="min-w-0 truncate">{r.title}</span><ChevronRight className="size-4 shrink-0 text-[var(--text-4)]" /></Link>
    {why && <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{why}</p>}
    {(r.canTakeOver || r.sourceUrl) && <div className="mt-2 flex items-center gap-3">
      {r.canTakeOver && <Link href={`/cards/${r.id}/takeover`} className="rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-white">이어받기</Link>}
      {r.sourceUrl && <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-xs text-[var(--text-4)] hover:text-foreground">출처<ArrowUpRight className="size-3" /></a>}
    </div>}
  </li>;
}

export function IdeaLineage({ check, mode }: { check: IdeaCheck; mode: "draft" | "detail" }) {
  const o = check.outcome;
  const tags = [...check.concepts.map(c => `#${c.label}`), check.zone.label];
  if (!check.related.length) {
    if (mode === "detail") return null;
    return <section className="rounded-[20px] bg-[var(--brand-soft)] p-5">
      <p className="text-lg font-extrabold tracking-tight">처음 보는 조합이에요</p>
      <p className="mt-2 text-xs text-muted-foreground">{tags.join(" ")}</p>
    </section>;
  }
  return <section className={cn(mode === "draft" && "rounded-[20px] bg-[var(--brand-soft)] p-5")}>
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-tight">{mode === "draft" ? <>이미 <span className="text-primary">{o.attempts}번</span> 나온 아이디어</> : "같은 묶음"}</h2>
      <span className="tnum shrink-0 text-xs text-[var(--text-4)]">{o.since ? `${o.since}년부터 · ` : ""}멈춤 {o.stopped} · 진행 {o.going}</span>
    </div>
    <p className="mt-1 text-xs text-muted-foreground">{tags.join(" ")}</p>
    <OutcomeBar o={o} className="mt-3" />
    {o.reasons.length > 0 && <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-muted-foreground">멈춘 이유</p><ReasonChips o={o} /></div>}
    <ul className="mt-2 divide-y divide-border">{check.related.map(r => <RelatedRow key={r.id} r={r} />)}</ul>
  </section>;
}
