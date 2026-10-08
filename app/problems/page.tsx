import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import Link from "next/link";
import { knowledgeGraph } from "@/lib/queries";
import { ProblemRow } from "@/components/ProblemRow";
import { buildProblems, needsOf, placesOf, precedentsFor, searchProblems, type Problem } from "@/lib/domain/problems";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.problems.metadataTitle };
}

const FILTERS: Record<string, (p: Problem) => boolean> = {
  repeat: (p) => p.counts.total >= 2,
  stopped: (p) => p.counts.stopped > 0,
  precedent: (p) => precedentsFor([p.need.key]).length > 0,
};

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<{ q?: string; need?: string; place?: string; filter?: string }> }) {
  const { t, locale } = await getT();
  const [graph, sp] = await Promise.all([knowledgeGraph(), searchParams]);
  const all = buildProblems(graph);
  const filter = sp.filter && FILTERS[sp.filter] ? sp.filter : undefined;
  const list = searchProblems(all, { text: sp.q, need: sp.need, place: sp.place }).filter((p) => !filter || FILTERS[filter](p));
  const needs = needsOf(graph).filter((n) => all.some((p) => p.need.key === n.key));
  const places = placesOf(graph).filter((n) => all.some((p) => p.place.key === n.key));
  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    const s = q.toString();
    return s ? `/problems?${s}` : "/problems";
  };
  const chip = (on: boolean) => cn("rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors", on ? "bg-foreground text-background" : "bg-muted hover:bg-[var(--muted-hover)]");

  return <div className="mx-auto w-full max-w-[1200px] px-8 pt-8">
    <h1 className="text-[34px] font-black tracking-[-0.04em]">{t.problems.title}</h1>
    <p className="mt-2 text-[17px] font-medium text-muted-foreground">{t.problems.intro}</p>

    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-6 lg:sticky lg:top-24">
        <form action="/problems" className="flex gap-2">
          {sp.need && <input type="hidden" name="need" value={sp.need} />}
          {sp.place && <input type="hidden" name="place" value={sp.place} />}
          {filter && <input type="hidden" name="filter" value={filter} />}
          <input name="q" defaultValue={sp.q ?? ""} placeholder={t.problems.searchPlaceholder} className="h-10 min-w-0 flex-1 rounded-full bg-muted px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </form>
        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">{t.problems.view}</p>
          <div className="flex flex-wrap gap-1.5">
            <Link href={href({ filter: undefined })} className={chip(!filter)}>{t.problems.all}</Link>
            {Object.keys(FILTERS).map((k) => <Link key={k} href={href({ filter: k })} className={chip(filter === k)}>{t.problems.filters[k]}</Link>)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">{t.problems.need}</p>
          <div className="flex flex-wrap gap-1.5">
            <Link href={href({ need: undefined })} className={chip(!sp.need)}>{t.problems.all}</Link>
            {needs.map((n) => <Link key={n.key} href={href({ need: n.key })} className={chip(sp.need === n.key)}>{pick(t.common.needs, n.key, n.label)}</Link>)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">{t.problems.place}</p>
          <div className="flex flex-wrap gap-1.5">
            <Link href={href({ place: undefined })} className={chip(!sp.place)}>{t.problems.all}</Link>
            {places.map((n) => <Link key={n.key} href={href({ place: n.key })} className={chip(sp.place === n.key)}>{pick(t.common.places, n.key, n.label)}</Link>)}
          </div>
        </div>
      </aside>

      <section className={locale === "en" ? "min-w-0" : undefined}>
        <p className="mb-1 text-sm font-bold text-muted-foreground tnum">{t.problems.count(list.length.toLocaleString(locale, { useGrouping: locale !== "ko" }))}</p>
        {list.length
          ? <div className="divide-y divide-border">{list.map((p) => <ProblemRow key={p.id} p={p} />)}</div>
          : <div className="rounded-[18px] border border-dashed border-border p-10 text-center">
            <p className="font-bold">{t.problems.noMatches}</p>
            <Link href="/new" className="bg-brand mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white">{t.problems.firstIdea}</Link>
          </div>}
      </section>
    </div>
  </div>;
}
