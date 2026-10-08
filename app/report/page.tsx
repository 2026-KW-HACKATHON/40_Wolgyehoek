import { needLabel, signalText } from "@/lib/i18n/messages/explore";
import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import Link from "next/link";
import { knowledgeGraph } from "@/lib/queries";
import { ProblemRow } from "@/components/ProblemRow";
import { SIGNAL_COLORS, STATE_LABELS } from "@/lib/domain/graph";
import { placesOf, precedentsFor, regionReport } from "@/lib/domain/problems";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.report.metadataTitle };
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const { t, locale } = await getT();
  const num = (n: number) => n.toLocaleString(locale, { useGrouping: locale !== "ko" });
  const [graph, sp] = await Promise.all([knowledgeGraph(), searchParams]);
  const places = placesOf(graph);
  const r = regionReport(graph, sp.place);
  const scope = r.place ? pick(t.common.places, r.place.key, r.place.label) : t.report.wholeArea;
  const barrierMax = Math.max(1, ...r.barriers.map((b) => b.count));
  const withPrecedents = r.problems.filter((p) => precedentsFor([p.need.key]).length > 0);
  const totals: [string, number][] = [[t.report.attempts, r.totals.total], [t.report.going, r.totals.going], [t.report.testing, r.totals.live], [t.report.unknown, r.totals.unknown], [t.report.stopped, r.totals.stopped]];
  const chip = (on: boolean) => cn("rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors", on ? "bg-foreground text-background" : "bg-muted hover:bg-[var(--muted-hover)]");

  return <div className="mx-auto w-full max-w-[1200px] px-8 pt-8">
    <p className="text-sm font-bold text-primary">{t.report.audience}</p>
    <h1 className="mt-1 text-[34px] font-black tracking-[-0.04em]">{t.report.title(scope)}</h1>
    <p className="mt-2 text-[17px] font-medium text-muted-foreground">{t.report.intro}</p>

    <div className="mt-6 flex flex-wrap gap-1.5">
      <Link href="/report" className={chip(!sp.place)}>{t.report.all}</Link>
      {places.map((p) => <Link key={p.key} href={`/report?place=${p.key}`} className={chip(sp.place === p.key)}>{pick(t.common.places, p.key, p.label)}</Link>)}
    </div>

    <dl className="mt-8 grid grid-cols-5 gap-3">
      {totals.map(([k, v]) => <div key={k} className="rounded-2xl bg-muted px-5 py-4"><dd className={cn("tnum text-[32px] font-black leading-none", locale === "en" && "whitespace-nowrap")}>{num(v)}</dd><dt title={k} className={cn("mt-2 text-sm font-semibold text-muted-foreground", locale === "en" && "truncate")}>{k}</dt></div>)}
    </dl>

    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className={cn("space-y-10", locale === "en" && "min-w-0")}>
        <section>
          <h2 className="mb-1 text-xl font-extrabold tracking-tight">{t.report.repeated}</h2>
          {r.problems.length
            ? <div className="divide-y divide-border">{r.problems.map((p) => <ProblemRow key={p.id} p={p} />)}</div>
            : <p className="py-4 text-sm text-muted-foreground">{t.report.noAttempts}</p>}
        </section>

        <section>
          <h2 className="mb-3 text-xl font-extrabold tracking-tight">{t.report.stopReasons}</h2>
          {r.barriers.length
            ? <ul className="space-y-2.5">{r.barriers.map((b) => <li key={b.label} className="grid grid-cols-[160px_1fr_40px] items-center gap-3 text-sm">
              <span className="truncate font-bold">{pick(t.common.barriers, b.label, b.label)}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-foreground" style={{ width: `${(b.count / barrierMax) * 100}%` }} /></span>
              <span className="tnum text-right font-bold">{b.count}</span>
            </li>)}</ul>
            : <p className="text-sm text-muted-foreground">{t.report.noReasons}</p>}
        </section>

        {r.live.length > 0 && <section>
          <h2 className="mb-1 text-xl font-extrabold tracking-tight">{t.report.live}</h2>
          <ul className="divide-y divide-border">{r.live.map((a) => <li key={a.id}>
            <Link href={a.href ?? "#"} className="flex items-center justify-between gap-3 py-3 hover:text-primary">
              <span className="min-w-0 truncate text-[15px] font-bold">{a.title}</span>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">{pick(t.common.places, a.place.key, a.place.label)} · {pick(t.common.ideaStates, a.state, STATE_LABELS[a.state])}</span>
            </Link>
          </li>)}</ul>
        </section>}
      </div>

      <aside className={cn("space-y-8 lg:sticky lg:top-24", locale === "en" && "min-w-0")}>
        <section>
          <h2 className="mb-1 text-lg font-extrabold tracking-tight">{t.report.signals}</h2>
          {r.signals.length
            ? <ul className="divide-y divide-border">{r.signals.slice(0, 8).map((s, i) => <li key={i} className="flex items-start gap-3 py-2.5">
              <span title={pick(t.common.signals, s.kind, s.label)} className={cn("mt-0.5 w-[72px] shrink-0 rounded-full px-2 py-1 text-center text-[11px] font-extrabold text-white", locale === "en" && "truncate")} style={{ background: SIGNAL_COLORS[s.kind] }}>{pick(t.common.signals, s.kind, s.label)}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-bold">{signalText(s, locale, t.common).title}</span><span className="block truncate text-xs text-muted-foreground">{signalText(s, locale, t.common).detail}</span></span>
            </li>)}</ul>
            : <p className="text-sm text-muted-foreground">{t.report.noSignals}</p>}
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold tracking-tight">{t.report.whitespace}</h2>
          {r.whitespace.length
            ? <div className="flex flex-wrap gap-1.5">{r.whitespace.map((w) => <Link key={w.key} href="/new" className="rounded-full border border-dashed border-border px-3 py-1.5 text-[13px] font-bold hover:bg-muted">{pick(t.common.needs, w.key, needLabel(w.label, t.common))}</Link>)}</div>
            : <p className="text-sm text-muted-foreground">{t.report.noWhitespace}</p>}
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold tracking-tight">{t.report.precedents}</h2>
          {withPrecedents.length
            ? <ul className="space-y-2">{withPrecedents.map((p) => <li key={p.id}>
              <Link href={`/problems/${p.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-muted p-3.5 hover:bg-[var(--muted-hover)]">
                <span className="min-w-0 truncate text-sm font-extrabold">{pick(t.common.needs, p.need.key, p.need.label)} · {pick(t.common.places, p.place.key, p.place.label)}</span>
                <span className="tnum shrink-0 text-xs font-bold text-primary">{t.report.precedentCount(num(precedentsFor([p.need.key]).length))}</span>
              </Link>
            </li>)}</ul>
            : <p className="text-sm text-muted-foreground">{t.report.noPrecedents}</p>}
        </section>

        <p className="text-xs leading-relaxed text-[var(--text-4)]">{t.report.hint}</p>
      </aside>
    </div>
  </div>;
}
