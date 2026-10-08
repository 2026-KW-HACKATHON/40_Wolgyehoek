import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { getCard, knowledgeGraph, listCards } from "@/lib/queries";
import { CountsBar } from "@/components/ProblemRow";
import { STATE_LABELS } from "@/lib/domain/graph";
import { buildProblems, elsewhere } from "@/lib/domain/problems";
import { OPINION_KINDS } from "@/lib/domain/opinions";
import { OpinionForm } from "@/app/cards/[id]/panels";
import { cn } from "@/lib/utils";
import { InstitutionResponses } from "@/app/org/responses";

const STATE_TONE: Record<string, string> = { GOING: "bg-[var(--brand-soft)] text-primary", STOPPED: "bg-foreground text-background", LIVE: "bg-muted text-foreground", UNKNOWN: "bg-muted text-muted-foreground" };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getT();
  const { id } = await params;
  const p = buildProblems(await knowledgeGraph()).find((x) => x.id === decodeURIComponent(id));
  return { title: p ? t.problems.detailTitle(pick(t.common.needs, p.need.key, p.need.label), pick(t.common.places, p.place.key, p.place.label)) : t.problems.metadataTitle };
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, locale } = await getT();
  const { id } = await params;
  const [graph, cards] = await Promise.all([knowledgeGraph(), listCards({ tab: "all" })]);
  const problems = buildProblems(graph);
  const p = problems.find((x) => x.id === decodeURIComponent(id));
  if (!p) notFound();
  const other = elsewhere(problems, p);
  const known = new Map(cards.map((s) => [s.card.id, s]));
  const withOpinions = p.attempts.filter((a) => (known.get(a.id)?.opinionCount ?? 0) > 0).slice(0, 6);
  const linkedAttempts = p.attempts.filter(a => a.href);
  const details = await Promise.all(linkedAttempts.map(a => getCard(a.id)));
  const detailById = new Map(linkedAttempts.map((a, i) => [a.id, details[i]]));
  const opinions = withOpinions.flatMap(a => (detailById.get(a.id)?.opinions ?? []).filter(o => !o.hidden).map(o => ({ ...o, attempt: a })));
  const institutionAttempts = linkedAttempts.filter(a => (detailById.get(a.id)?.institutionResponses.length ?? 0) > 0);
  const num = (n: number) => n.toLocaleString(locale, { useGrouping: locale !== "ko" });
  const years = p.since && p.until ? (p.since === p.until ? `${p.since}` : `${p.since}–${p.until}`) : "";

  return <div className="mx-auto w-full max-w-[1200px] px-8 pt-8">
    <nav className="text-sm font-semibold text-muted-foreground"><Link href="/problems" className="hover:text-foreground">{t.problems.title}</Link> <ChevronRight className="inline size-3.5" /> {pick(t.common.needs, p.need.key, p.need.label)}</nav>

    <header className="mt-3 flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-[34px] font-black leading-tight tracking-[-0.04em]">{pick(t.common.needs, p.need.key, p.need.label)}<span className="ml-3 text-[26px] font-extrabold text-muted-foreground">{pick(t.common.places, p.place.key, p.place.label)}</span></h1>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold">
          <Link href={`/problems?need=${p.need.key}`} className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-primary">{t.problems.need} · {pick(t.common.needs, p.need.key, p.need.label)}</Link>
          <Link href={`/report?place=${p.place.key}`} className="rounded-full bg-muted px-3 py-1">{t.problems.place} · {pick(t.common.places, p.place.key, p.place.label)}</Link>
          {p.beneficiaries.map((b) => <span key={b.key} className="rounded-full bg-muted px-3 py-1">{t.problems.target} · {pick(t.common.beneficiaries, b.key, b.label)}</span>)}
          {p.barriers.map((b) => <span key={b.label} className="rounded-full bg-foreground px-3 py-1 text-background">{t.problems.barrier} · {pick(t.common.barriers, b.label, b.label)} {num(b.count)}</span>)}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right"><p className="tnum text-[40px] font-black leading-none text-primary">{t.problems.times(num(p.counts.total))}</p><p className="mt-1 text-xs font-semibold text-muted-foreground tnum">{years} {t.problems.attempts}</p></div>
        <Link href="/new" className="bg-brand rounded-full px-5 py-3 text-[15px] font-bold text-white">{t.problems.addIdea}</Link>
      </div>
    </header>
    <div className="mt-4 flex items-center gap-4">
      <CountsBar c={p.counts} className="h-2 flex-1" />
      <p className="tnum shrink-0 text-sm font-semibold text-muted-foreground">{t.problems.going} {num(p.counts.going)} · {t.problems.testing} {num(p.counts.live)} · {t.problems.unknown} {num(p.counts.unknown)} · {t.problems.stopped} {num(p.counts.stopped)}</p>
    </div>

    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-10">
        <section>
          <h2 className="mb-3 text-xl font-extrabold tracking-tight">{t.problems.lineage}</h2>
          <ol className="relative space-y-3 border-l-2 border-border pl-6">
            {p.attempts.map((a) => <li key={a.id} className="relative">
              <span className={cn("absolute -left-[31px] top-5 size-3 rounded-full border-2 border-background", a.state === "STOPPED" ? "bg-foreground" : a.state === "GOING" ? "bg-primary" : "bg-[var(--text-4)]")} />
              <div className="rounded-[18px] bg-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="tnum text-xs font-bold text-muted-foreground">{a.year || ""}{a.actor ? ` · ${a.actor}` : ""}{a.place.key !== p.place.key ? ` · ${pick(t.common.places, a.place.key, a.place.label)}` : ""}</p>
                    {a.href ? <Link href={a.href} className="mt-0.5 block text-[16px] font-extrabold hover:text-primary">{a.title}</Link> : <p className="mt-0.5 text-[16px] font-extrabold">{a.title}</p>}
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", STATE_TONE[a.state])}>{pick(t.common.ideaStates, a.state, STATE_LABELS[a.state])}</span>
                </div>
                {(a.barriers.length > 0 || a.sourceUrl || (a.href && a.state !== "GOING")) && <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {a.barriers.map((b) => <span key={b} className="rounded-full bg-background px-2.5 py-1 text-xs font-bold">{t.problems.stopReason} · {pick(t.common.barriers, b, b)}</span>)}
                  {a.sourceUrl && <a href={a.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground">{t.common.source}<ArrowUpRight className="size-3" /></a>}
                  {a.href && (a.state === "STOPPED" || a.state === "UNKNOWN") && <Link href={`${a.href}/takeover`} className="bg-brand rounded-full px-3 py-1 text-xs font-bold text-white">{t.common.takeover}</Link>}
                </div>}
              </div>
            </li>)}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-extrabold tracking-tight">{t.org.title}</h2>
          {institutionAttempts.length ? <div className="space-y-4">{institutionAttempts.map(a => <div key={a.id}>
            {a.href && <Link href={a.href} className="mb-2 block text-sm font-bold hover:text-primary">{a.title}</Link>}
            <InstitutionResponses responses={detailById.get(a.id)?.institutionResponses ?? []} />
          </div>)}</div> : <p className="text-sm text-muted-foreground">{t.org.empty}</p>}
        </section>

        <section>
          <h2 className="mb-1 text-xl font-extrabold tracking-tight">{t.problems.opinions} <span className="text-muted-foreground tnum">{opinions.length}</span></h2>
          <p className="mb-3 text-sm text-muted-foreground">{t.problems.opinionsIntro}</p>
          {p.attempts.some((a) => a.href) && <div className="mb-5 rounded-[18px] bg-muted p-4"><OpinionForm cardId={p.attempts.find((a) => a.href)!.id} targets={p.attempts.filter((a) => a.href).map((a) => ({ id: a.id, label: `${a.year || ""} · ${a.title}` }))} /></div>}
          {opinions.length
            ? <ul className="space-y-2">{opinions.map((o) => <li key={o.id} className="rounded-[18px] border border-border p-4">
              <p className="text-xs font-bold"><span className={OPINION_KINDS[o.stance].tone}>{pick(t.common.stances, o.stance, OPINION_KINDS[o.stance].label)}</span><span className="ml-2 font-semibold text-muted-foreground">{o.authorName} · {o.attempt.title}</span></p>
              <p className="mt-1.5 text-[15px] leading-relaxed">{o.body}</p>
              {o.condition && <p className="mt-1 text-sm text-muted-foreground">{o.condition}</p>}
            </li>)}</ul>
            : <p className="rounded-[18px] border border-dashed border-border p-6 text-center text-sm font-semibold text-muted-foreground">{t.problems.noOpinions}</p>}
        </section>
      </div>

      <aside className="space-y-8 lg:sticky lg:top-24">
        <section>
          <h2 className="mb-1 text-lg font-extrabold tracking-tight">{t.problems.otherPlaces}</h2>
          {other.local.length
            ? <ul className="divide-y divide-border">{other.local.map((o) => <li key={o.id}>
              <Link href={`/problems/${o.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary">
                <span className="truncate font-bold">{pick(t.common.places, o.place.key, o.place.label)}</span><span className="tnum shrink-0 text-xs font-semibold text-muted-foreground">{t.problems.times(num(o.counts.total))} · {t.problems.stopped} {num(o.counts.stopped)}</span>
              </Link>
            </li>)}</ul>
            : <p className="py-2 text-sm text-muted-foreground">{t.problems.noOtherPlaces}</p>}
        </section>

        <section>
          <h2 className="mb-1 text-lg font-extrabold tracking-tight">{t.problems.otherSolutions} <span className="text-muted-foreground tnum">{other.precedents.length}</span></h2>
          <p className="mb-2 text-xs text-muted-foreground">{t.problems.solutionsIntro}</p>
          {other.precedents.length
            ? <ul className="space-y-2">{other.precedents.map((x) => <li key={x.id} className="rounded-[16px] bg-muted p-3.5">
              <p className="text-xs font-bold text-muted-foreground">{x.countryCode !== "KR" ? `${pick(t.common.countries, x.country, x.country)} · ` : ""}{x.region} · {x.year}</p>
              <p className="mt-0.5 text-[15px] font-extrabold">{x.title}</p>
              <p className="mt-1 text-sm leading-relaxed">{x.approach}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={cn("rounded-full px-2 py-0.5 font-bold", x.outcome === "GOING" ? "bg-[var(--brand-soft)] text-primary" : x.outcome === "STOPPED" ? "bg-foreground text-background" : "bg-background text-muted-foreground")}>{t.common.ideaStates[x.outcome]}</span>
                {x.reason && <span className="text-muted-foreground">{x.reason}</span>}
                <a href={x.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-muted-foreground hover:text-foreground">{x.sourceTitle}<ArrowUpRight className="size-3" /></a>
              </div>
            </li>)}</ul>
            : <p className="py-2 text-sm text-muted-foreground">{t.problems.noSolutions}</p>}
        </section>
      </aside>
    </div>
  </div>;
}
