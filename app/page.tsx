import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { ideaMap, knowledgeGraph, listCards } from "@/lib/queries";
import { KnowledgeExplorer } from "@/components/KnowledgeExplorer";
import { CardItem } from "@/components/card-item";
import { ProblemRow } from "@/components/ProblemRow";
import { TOPICS, type Topic } from "@/lib/domain/types";
import { TOPIC_SHORT, ZONE_SHORT } from "@/lib/domain/ideas";
import { PRECEDENTS, buildProblems } from "@/lib/domain/problems";
import { cn } from "@/lib/utils";

export default async function Home({ searchParams }: { searchParams: Promise<{ zone?: string; topic?: string }> }) {
  const { t, locale } = await getT();
  const [cards, map, graph, sp] = await Promise.all([listCards({ tab: "all" }), ideaMap(), knowledgeGraph(), searchParams]);
  const problems = buildProblems(graph);
  const repeated = problems.filter((p) => p.counts.total >= 2);
  const topics = Object.keys(TOPICS) as Topic[];
  const cellOf = (zone: string, topic: string) => map.cells.find((c) => c.zone === zone && c.topic === topic);
  const picked = sp.zone && sp.topic ? { zone: sp.zone, topic: sp.topic, ids: cellOf(sp.zone, sp.topic)?.ids ?? [] } : null;
  const max = Math.max(1, ...map.cells.map((c) => c.count));
  const stats: [string, number][] = [
    [t.explore.attempts, map.total],
    [t.explore.problems, problems.length],
    [t.explore.repeated, repeated.length],
    [t.explore.stoppedAttempts, map.cells.reduce((n, c) => n + c.stopped, 0)],
    [t.explore.precedents, PRECEDENTS.length],
  ];

  return <div className="mx-auto w-full max-w-[1200px] space-y-10 px-8 pt-8">
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <h1 className="text-[34px] font-black tracking-[-0.04em]">{t.explore.heading}</h1>
        <p className="mt-2 text-[17px] font-medium text-muted-foreground">{t.explore.intro}</p>
      </div>
      <dl className="flex gap-2">
        {stats.map(([k, v]) => <div key={k} className="min-w-[104px] rounded-2xl bg-muted px-4 py-3"><dd className="text-[26px] font-black leading-none tracking-tight tnum">{v.toLocaleString(locale, { useGrouping: locale !== "ko" })}</dd><dt className="mt-1.5 text-xs font-semibold text-muted-foreground">{k}</dt></div>)}
      </dl>
    </header>

    <KnowledgeExplorer graph={graph} />

    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold tracking-tight">{t.explore.repeated} <span className="text-muted-foreground tnum">{repeated.length}</span></h2>
          <Link href="/problems" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground">{t.explore.allProblems}<ChevronRight className="size-4" /></Link>
        </div>
        <div className="divide-y divide-border">{repeated.slice(0, 8).map((p) => <ProblemRow key={p.id} p={p} />)}</div>
      </section>

      <section aria-label={t.explore.placeTopic}>
        <h2 className="mb-3 text-xl font-extrabold tracking-tight">{t.explore.placeTopic}</h2>
        <div className="grid grid-cols-[76px_repeat(6,minmax(0,1fr))] gap-1 text-center">
          <span />
          {topics.map((topic) => <span key={topic} className="pb-1 text-xs font-bold text-muted-foreground">{pick(t.common.topicShort, topic, TOPIC_SHORT[topic])}</span>)}
          {map.zones.map((z) => <Fragment key={z.key}>
            <Link href={`/report?place=${z.key}`} className="flex items-center text-left text-xs font-bold leading-tight text-muted-foreground hover:text-foreground">{pick(t.common.placeShort, z.key, ZONE_SHORT[z.key] ?? z.label)}</Link>
            {topics.map((topic) => {
              const cell = cellOf(z.key, topic);
              const on = picked?.zone === z.key && picked.topic === topic;
              const level = cell ? 18 + Math.round((cell.count / max) * 82) : 0;
              return <Link key={topic} href={on ? "/" : `/?zone=${z.key}&topic=${topic}`} scroll={false}
                aria-label={t.explore.cellLabel(pick(t.common.places, z.key, z.label), pick(t.common.topics, topic, TOPICS[topic]), (cell?.count ?? 0).toLocaleString(locale, { useGrouping: locale !== "ko" }))}
                className={cn("tnum flex aspect-square items-center justify-center rounded-lg text-sm font-extrabold transition-transform active:scale-95",
                  cell ? (level > 55 ? "text-white" : "text-foreground") : "border border-dashed border-border text-transparent",
                  on && "ring-2 ring-foreground ring-offset-1")}
                style={cell ? { background: `color-mix(in oklab, var(--primary) ${level}%, var(--background))` } : undefined}>{cell?.count ?? "·"}</Link>;
            })}
          </Fragment>)}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-4)]"><span className="inline-block size-3 rounded-[3px] border border-dashed border-[var(--text-4)]" />{t.explore.mapHint}</p>

        {picked && <div className="mt-5 rounded-[18px] bg-muted p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-extrabold">{pick(t.common.placeShort, picked.zone, ZONE_SHORT[picked.zone] ?? picked.zone)} · {pick(t.common.topics, picked.topic, TOPICS[picked.topic as Topic])}</h3>
            <Link href="/" scroll={false} aria-label={t.common.close} className="flex size-8 items-center justify-center rounded-full bg-background"><X className="size-4" /></Link>
          </div>
          {picked.ids.length
            ? <div className="divide-y divide-border">{cards.filter((s) => picked.ids.includes(s.card.id)).map((s) => <CardItem key={s.card.id} s={s} />)}</div>
            : <div className="py-4 text-center">
              <p className="font-bold">{t.explore.noAttempts}</p>
              <Link href="/new" className="bg-brand mt-3 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white">{t.explore.firstIdea}</Link>
            </div>}
        </div>}
      </section>
    </div>
  </div>;
}
