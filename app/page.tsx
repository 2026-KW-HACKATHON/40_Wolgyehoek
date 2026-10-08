import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { knowledgeGraph } from "@/lib/queries";
import { KnowledgeExplorer } from "@/components/KnowledgeExplorer";
import { ProblemRow } from "@/components/ProblemRow";
import { PRECEDENTS, buildProblems } from "@/lib/domain/problems";
import { inputCls } from "@/components/ui";

export default async function Home() {
  const { t, locale } = await getT();
  const graph = await knowledgeGraph();
  const repeated = buildProblems(graph).filter((p) => p.counts.total >= 2);

  return <div className="mx-auto w-full max-w-[1200px] space-y-8 px-8 pt-8">
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-[34px] font-black tracking-[-0.04em]">{t.explore.heading}</h1>
        <form action="/new" className="mt-5 flex w-full max-w-[640px] gap-2">
          <input name="q" required maxLength={500} aria-label={t.explore.ask} placeholder={t.explore.askPlaceholder} className={`${inputCls} flex-1`} />
          <button type="submit" className="bg-brand min-h-12 shrink-0 rounded-2xl px-5 text-[15px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95">{t.explore.askSubmit}</button>
        </form>
      </div>
      <p className="text-right">
        <span className="tnum block text-[56px] font-black leading-none tracking-[-0.04em] text-primary">{graph.links.length.toLocaleString(locale, { useGrouping: locale !== "ko" })}</span>
        <span className="mt-2 block text-sm font-bold text-muted-foreground">{t.explore.linksLabel}</span>
        {graph.kinds && <span className="tnum mt-1 block text-xs font-semibold text-[var(--text-4)]">{t.explore.kinds(graph.kinds.POLICY, graph.kinds.ADMIN, graph.kinds.ATTEMPT, PRECEDENTS.length)}</span>}
      </p>
    </header>

    <KnowledgeExplorer graph={graph} side={<section>
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-lg font-extrabold tracking-tight">{t.explore.repeated} <span className="tnum text-muted-foreground">{repeated.length}</span></h2>
        <Link href="/problems" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground">{t.explore.allProblems}<ChevronRight className="size-4" /></Link>
      </div>
      <div className="divide-y divide-border">{repeated.slice(0, 8).map((p) => <ProblemRow key={p.id} p={p} />)}</div>
    </section>} />
  </div>;
}
