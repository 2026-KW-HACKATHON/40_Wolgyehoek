import Link from "next/link";
import { knowledgeGraph } from "@/lib/queries";
import { ProblemRow } from "@/components/ProblemRow";
import { SIGNAL_COLORS, STATE_LABELS } from "@/lib/domain/graph";
import { placesOf, precedentsFor, regionReport } from "@/lib/domain/problems";
import { cn } from "@/lib/utils";

export const metadata = { title: "지역 리포트 · 동네서랍" };

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const [graph, sp] = await Promise.all([knowledgeGraph(), searchParams]);
  const places = placesOf(graph);
  const r = regionReport(graph, sp.place);
  const scope = r.place?.label ?? "월계1동 전체";
  const barrierMax = Math.max(1, ...r.barriers.map((b) => b.count));
  const withPrecedents = r.problems.filter((p) => precedentsFor([p.need.key]).length > 0);
  const totals: [string, number][] = [["시도", r.totals.total], ["시행", r.totals.going], ["검증 중", r.totals.live], ["결과 미확인", r.totals.unknown], ["멈춤", r.totals.stopped]];
  const chip = (on: boolean) => cn("rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors", on ? "bg-foreground text-background" : "bg-muted hover:bg-[var(--muted-hover)]");

  return <div className="mx-auto w-full max-w-[1200px] px-8 pt-8">
    <p className="text-sm font-bold text-primary">지자체·의원실용</p>
    <h1 className="mt-1 text-[34px] font-black tracking-[-0.04em]">{scope} 지역 문제 리포트</h1>
    <p className="mt-2 text-[17px] font-medium text-muted-foreground">이 지역에서 반복되는 문제, 멈춘 이유, 아무도 손대지 않은 빈칸을 한 번에 봅니다.</p>

    <div className="mt-6 flex flex-wrap gap-1.5">
      <Link href="/report" className={chip(!sp.place)}>전체</Link>
      {places.map((p) => <Link key={p.key} href={`/report?place=${p.key}`} className={chip(sp.place === p.key)}>{p.label}</Link>)}
    </div>

    <dl className="mt-8 grid grid-cols-5 gap-3">
      {totals.map(([k, v]) => <div key={k} className="rounded-2xl bg-muted px-5 py-4"><dd className="tnum text-[32px] font-black leading-none">{v}</dd><dt className="mt-2 text-sm font-semibold text-muted-foreground">{k}</dt></div>)}
    </dl>

    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-10">
        <section>
          <h2 className="mb-1 text-xl font-extrabold tracking-tight">반복되는 문제</h2>
          {r.problems.length
            ? <div className="divide-y divide-border">{r.problems.map((p) => <ProblemRow key={p.id} p={p} />)}</div>
            : <p className="py-4 text-sm text-muted-foreground">이 지역에 기록된 시도가 없어요</p>}
        </section>

        <section>
          <h2 className="mb-3 text-xl font-extrabold tracking-tight">멈춘 이유</h2>
          {r.barriers.length
            ? <ul className="space-y-2.5">{r.barriers.map((b) => <li key={b.label} className="grid grid-cols-[160px_1fr_40px] items-center gap-3 text-sm">
              <span className="truncate font-bold">{b.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-foreground" style={{ width: `${(b.count / barrierMax) * 100}%` }} /></span>
              <span className="tnum text-right font-bold">{b.count}</span>
            </li>)}</ul>
            : <p className="text-sm text-muted-foreground">멈춘 이유가 기록된 시도가 없어요. 공개 기록에는 결과와 이유가 거의 남지 않습니다.</p>}
        </section>

        {r.live.length > 0 && <section>
          <h2 className="mb-1 text-xl font-extrabold tracking-tight">지금 진행 중인 청년 시도</h2>
          <ul className="divide-y divide-border">{r.live.map((a) => <li key={a.id}>
            <Link href={a.href ?? "#"} className="flex items-center justify-between gap-3 py-3 hover:text-primary">
              <span className="min-w-0 truncate text-[15px] font-bold">{a.title}</span>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">{a.place.label} · {STATE_LABELS[a.state]}</span>
            </Link>
          </li>)}</ul>
        </section>}
      </div>

      <aside className="space-y-8 lg:sticky lg:top-24">
        <section>
          <h2 className="mb-1 text-lg font-extrabold tracking-tight">기회 신호</h2>
          {r.signals.length
            ? <ul className="divide-y divide-border">{r.signals.slice(0, 8).map((s, i) => <li key={i} className="flex items-start gap-3 py-2.5">
              <span className="mt-0.5 w-[72px] shrink-0 rounded-full px-2 py-1 text-center text-[11px] font-extrabold text-white" style={{ background: SIGNAL_COLORS[s.kind] }}>{s.label}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-bold">{s.title}</span><span className="block truncate text-xs text-muted-foreground">{s.detail}</span></span>
            </li>)}</ul>
            : <p className="text-sm text-muted-foreground">신호가 없어요</p>}
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold tracking-tight">아무도 손대지 않은 빈칸</h2>
          {r.whitespace.length
            ? <div className="flex flex-wrap gap-1.5">{r.whitespace.map((w) => <Link key={w.key} href="/new" className="rounded-full border border-dashed border-border px-3 py-1.5 text-[13px] font-bold hover:bg-muted">{w.label}</Link>)}</div>
            : <p className="text-sm text-muted-foreground">모든 니즈에 시도가 있어요</p>}
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold tracking-tight">다른 지역 해법이 있는 문제</h2>
          {withPrecedents.length
            ? <ul className="space-y-2">{withPrecedents.map((p) => <li key={p.id}>
              <Link href={`/problems/${p.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-muted p-3.5 hover:bg-[var(--muted-hover)]">
                <span className="min-w-0 truncate text-sm font-extrabold">{p.need.label} · {p.place.label}</span>
                <span className="tnum shrink-0 text-xs font-bold text-primary">선례 {precedentsFor([p.need.key]).length}</span>
              </Link>
            </li>)}</ul>
            : <p className="text-sm text-muted-foreground">아직 연결된 다른 지역 사례가 없어요</p>}
        </section>

        <p className="text-xs leading-relaxed text-[var(--text-4)]">공개 기록과 동네서랍 시도로 계산했습니다. 결과를 모르는 기록은 실패로 세지 않습니다.</p>
      </aside>
    </div>
  </div>;
}
