import Link from "next/link";
import { knowledgeGraph } from "@/lib/queries";
import { ProblemRow } from "@/components/ProblemRow";
import { buildProblems, needsOf, placesOf, searchProblems } from "@/lib/domain/problems";
import { cn } from "@/lib/utils";

export const metadata = { title: "문제 · 동네서랍" };

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<{ q?: string; need?: string; place?: string }> }) {
  const [graph, sp] = await Promise.all([knowledgeGraph(), searchParams]);
  const all = buildProblems(graph);
  const list = searchProblems(all, { text: sp.q, need: sp.need, place: sp.place });
  const needs = needsOf(graph).filter((n) => all.some((p) => p.need.key === n.key));
  const places = placesOf(graph).filter((n) => all.some((p) => p.place.key === n.key));
  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    const s = q.toString();
    return s ? `/problems?${s}` : "/problems";
  };
  const chip = (on: boolean) => cn("rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors", on ? "bg-foreground text-background" : "bg-muted hover:bg-[var(--muted-hover)]");

  return <div className="mx-auto w-full max-w-[1200px] px-8 pt-8">
    <h1 className="text-[34px] font-black tracking-[-0.04em]">문제</h1>
    <p className="mt-2 text-[17px] font-medium text-muted-foreground">니즈와 장소가 만나 하나의 문제가 됩니다. 같은 니즈는 장소가 달라도 서로 참고할 수 있어요.</p>

    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-6 lg:sticky lg:top-24">
        <form action="/problems" className="flex gap-2">
          {sp.need && <input type="hidden" name="need" value={sp.need} />}
          {sp.place && <input type="hidden" name="place" value={sp.place} />}
          <input name="q" defaultValue={sp.q ?? ""} placeholder="문제·시도 검색" className="h-10 min-w-0 flex-1 rounded-full bg-muted px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </form>
        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">니즈</p>
          <div className="flex flex-wrap gap-1.5">
            <Link href={href({ need: undefined })} className={chip(!sp.need)}>전체</Link>
            {needs.map((n) => <Link key={n.key} href={href({ need: n.key })} className={chip(sp.need === n.key)}>{n.label}</Link>)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">장소</p>
          <div className="flex flex-wrap gap-1.5">
            <Link href={href({ place: undefined })} className={chip(!sp.place)}>전체</Link>
            {places.map((n) => <Link key={n.key} href={href({ place: n.key })} className={chip(sp.place === n.key)}>{n.label}</Link>)}
          </div>
        </div>
      </aside>

      <section>
        <p className="mb-1 text-sm font-bold text-muted-foreground tnum">{list.length}개 문제</p>
        {list.length
          ? <div className="divide-y divide-border">{list.map((p) => <ProblemRow key={p.id} p={p} />)}</div>
          : <div className="rounded-[18px] border border-dashed border-border p-10 text-center">
            <p className="font-bold">조건에 맞는 문제가 없어요</p>
            <Link href="/new" className="bg-brand mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white">이 문제로 첫 아이디어 등록</Link>
          </div>}
      </section>
    </div>
  </div>;
}
