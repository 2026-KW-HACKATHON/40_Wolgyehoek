import { Fragment } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ideaMap, listCards } from "@/lib/queries";
import { CardItem } from "@/components/card-item";
import { OutcomeBar, ReasonChips } from "@/components/IdeaLineage";
import { SectionTitle } from "@/components/ui";
import { canTakeOver } from "@/lib/domain/status";
import { TOPICS, type Topic } from "@/lib/domain/types";
import { TOPIC_SHORT, ZONE_SHORT, type IdeaCluster } from "@/lib/domain/ideas";
import { cn } from "@/lib/utils";

export default async function DrawerPage({ searchParams }: { searchParams: Promise<{ zone?: string; topic?: string }> }) {
  const [cards, map, sp] = await Promise.all([listCards({ tab: "all" }), ideaMap(), searchParams]);
  const topics = Object.keys(TOPICS) as Topic[];
  const cellOf = (zone: string, topic: string) => map.cells.find((c) => c.zone === zone && c.topic === topic);
  const picked = sp.zone && sp.topic ? { zone: sp.zone, topic: sp.topic, ids: cellOf(sp.zone, sp.topic)?.ids ?? [] } : null;
  const max = Math.max(1, ...map.cells.map((c) => c.count));
  const succeeded = cards.filter((s) => s.card.succeededAt);
  const shelved = cards.filter((s) => !s.card.succeededAt && s.status !== "open" && canTakeOver(s.status));

  return <div className="space-y-9 px-4 pb-8 pt-2">
    <div className="flex items-baseline justify-between">
      <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">서랍</h1>
      <span className="tnum text-sm text-[var(--text-4)]">{map.total}개</span>
    </div>

    <section aria-label="아이디어 지도">
      <div className="grid grid-cols-[64px_repeat(6,minmax(0,1fr))] gap-1 text-center">
        <span />
        {topics.map((t) => <span key={t} className="pb-1 text-[11px] font-bold text-muted-foreground">{TOPIC_SHORT[t]}</span>)}
        {map.zones.map((z) => <Fragment key={z.key}>
          <span className="flex items-center text-left text-[11px] font-bold leading-tight text-muted-foreground">{ZONE_SHORT[z.key] ?? z.label}</span>
          {topics.map((t) => {
            const cell = cellOf(z.key, t);
            const on = picked?.zone === z.key && picked.topic === t;
            const level = cell ? 18 + Math.round((cell.count / max) * 82) : 0;
            return <Link key={t} href={on ? "/drawer" : `/drawer?zone=${z.key}&topic=${t}`} scroll={false}
              aria-label={`${z.label} ${TOPICS[t]} ${cell?.count ?? 0}건`}
              className={cn("tnum flex aspect-square items-center justify-center rounded-lg text-[13px] font-extrabold transition-transform active:scale-95",
                cell ? (level > 55 ? "text-white" : "text-foreground") : "border border-dashed border-border text-transparent",
                on && "ring-2 ring-foreground ring-offset-1")}
              style={cell ? { background: `color-mix(in oklab, var(--primary) ${level}%, var(--background))` } : undefined}>{cell?.count ?? "·"}</Link>;
          })}
        </Fragment>)}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text-4)]"><span className="inline-block size-3 rounded-[3px] border border-dashed border-[var(--text-4)]" />빈칸</p>
    </section>

    {picked && <section>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-tight">{ZONE_SHORT[picked.zone] ?? picked.zone} · {TOPICS[picked.topic as Topic]}</h2>
        <Link href="/drawer" scroll={false} aria-label="닫기" className="flex size-9 items-center justify-center rounded-full bg-muted"><X className="size-4" /></Link>
      </div>
      {picked.ids.length
        ? <div className="divide-y divide-border">{cards.filter((s) => picked.ids.includes(s.card.id)).map((s) => <CardItem key={s.card.id} s={s} />)}</div>
        : <div className="rounded-[18px] border border-dashed border-border p-6 text-center">
          <p className="font-bold">아직 아무도 시도하지 않았어요</p>
          <Link href="/new" className="bg-brand mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white">첫 아이디어 올리기</Link>
        </div>}
    </section>}

    {map.clusters.length > 0 && <section>
      <SectionTitle sub={map.clusters.length}>반복되는 아이디어</SectionTitle>
      <div className="space-y-2">{map.clusters.map((c) => <ClusterCard key={`${c.concept}-${c.zone}`} c={c} />)}</div>
    </section>}

    {succeeded.length > 0 && <section>
      <SectionTitle sub={succeeded.length}>성사된 아이디어</SectionTitle>
      <div className="divide-y divide-border">{succeeded.map((s) => <CardItem key={s.card.id} s={s} />)}</div>
    </section>}

    {shelved.length > 0 && <section>
      <SectionTitle sub={shelved.length}>다시 꺼낼 아이디어</SectionTitle>
      <div className="divide-y divide-border">{shelved.map((s) => <div key={s.card.id} className="flex items-center gap-2">
        <div className="min-w-0 flex-1"><CardItem s={s} /></div>
        <Link href={`/cards/${s.card.id}/takeover`} className="bg-brand shrink-0 rounded-full px-4 py-2 text-sm font-bold text-white">꺼내기</Link>
      </div>)}</div>
    </section>}
  </div>;
}

function ClusterCard({ c }: { c: IdeaCluster }) {
  const years = c.ideas.map((i) => i.year);
  const from = Math.min(...years), to = Math.max(...years);
  const o = c.outcome;
  return <details className="group rounded-[18px] bg-muted p-4 open:bg-[var(--brand-soft)]">
    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[15px] font-extrabold">{c.conceptLabel}<span className="ml-1.5 text-sm font-semibold text-muted-foreground">{c.zoneLabel}</span></p>
        <span className="tnum shrink-0 text-lg font-black text-primary">{o.attempts}번</span>
      </div>
      <p className="tnum mt-0.5 text-xs text-[var(--text-4)]">{from === to ? from : `${from}–${to}`} · 진행 {o.going} · 멈춤 {o.stopped} · 미확인 {o.open}</p>
      <OutcomeBar o={o} className="mt-2.5" />
      {o.reasons.length > 0 && <div className="mt-2.5"><ReasonChips o={o} /></div>}
    </summary>
    <ul className="mt-3 divide-y divide-border border-t border-border">
      {c.ideas.map((i) => <li key={i.id}>
        <Link href={`/cards/${i.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:text-primary">
          <span className="tnum w-9 shrink-0 text-xs font-bold text-[var(--text-4)]">{i.year}</span>
          <span className="min-w-0 flex-1 truncate font-semibold">{i.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{i.succeeded ? "성사" : i.statusLabel}</span>
        </Link>
      </li>)}
    </ul>
  </details>;
}
