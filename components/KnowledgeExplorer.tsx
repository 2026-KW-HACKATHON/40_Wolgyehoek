"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import type { GraphNode, GraphNodeType, KnowledgeGraph, Signal } from "@/lib/domain/graph";
import { NODE_COLORS, SIGNAL_COLORS, STATE_LABELS, nodeColor } from "@/lib/domain/graph";
import { cn } from "@/lib/utils";

const GraphCanvas = dynamic(() => import("./GraphCanvas"), { ssr: false, loading: () => <div className="size-full animate-pulse bg-[#141416]" /> });

const TYPE_ORDER: GraphNodeType[] = ["NEED", "PLACE", "ACTOR", "BENEFICIARY", "BARRIER", "IDEA", "SOURCE"];
const HEIGHT = 440;

export function KnowledgeExplorer({ graph }: { graph: KnowledgeGraph }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [focus, setFocus] = useState<string[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [visible, setVisible] = useState<Set<GraphNodeType>>(() => new Set(TYPE_ORDER.filter((t) => t !== "SOURCE")));

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);
  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of graph.links) {
      (m.get(l.source) ?? m.set(l.source, new Set()).get(l.source)!).add(l.target);
      (m.get(l.target) ?? m.set(l.target, new Set()).get(l.target)!).add(l.source);
    }
    return m;
  }, [graph]);

  const ideas = useMemo(() => {
    if (!focus.length) return [];
    if (focus.length === 1 && byId.get(focus[0])?.type === "IDEA") return [];
    const sets = focus.map((f) => [...(neighbors.get(f) ?? [])].filter((id) => byId.get(id)?.type === "IDEA"));
    return sets.reduce((a, b) => a.filter((x) => b.includes(x))).map((id) => byId.get(id)!).sort((a, b) => b.year - a.year);
  }, [focus, neighbors, byId]);

  const highlight = useMemo(() => {
    const s = new Set<string>(focus);
    if (focus.length === 1) neighbors.get(focus[0])?.forEach((id) => s.add(id));
    else ideas.forEach((i) => s.add(i.id));
    return s;
  }, [focus, ideas, neighbors]);

  const select = (ids: string[], label: string | null = null) => { setFocus(ids); setTitle(label); };
  const pickSignal = (s: Signal) => { select(s.focus, s.title); box.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const toggle = (t: GraphNodeType) => setVisible((v) => { const n = new Set(v); if (n.has(t)) n.delete(t); else n.add(t); return n; });

  const main = focus.length ? byId.get(focus[0]) : undefined;
  const ranked = graph.signals.filter((s) => s.kind !== "WHITESPACE").slice(0, 8);
  const blanks = graph.signals.filter((s) => s.kind === "WHITESPACE");

  return <div className="space-y-6">
    <div ref={box} className="relative -mx-1 scroll-mt-16 overflow-hidden rounded-[22px] bg-[#141416]" style={{ height: HEIGHT }}>
      {width > 0 && <GraphCanvas nodes={graph.nodes} links={graph.links} width={width} height={HEIGHT}
        focus={focus[0] ?? null} highlight={highlight} visible={visible} onSelect={(id) => select(id ? [id] : [])} />}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex gap-1.5 overflow-x-auto p-3 [scrollbar-width:none]">
        {TYPE_ORDER.map((t) => <button key={t} type="button" onClick={() => toggle(t)} aria-pressed={visible.has(t)}
          className={cn("pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur transition-opacity",
            visible.has(t) ? "bg-white/12 text-white" : "bg-white/5 text-white/35")}>
          <span className="size-2 rounded-full" style={{ background: NODE_COLORS[t] }} />{graph.types[t]}
        </button>)}
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-semibold text-white/45 tnum">{graph.ideas}개 시도 · {graph.links.length}개 연결</p>
      {focus.length > 0 && <button type="button" onClick={() => select([])} aria-label="선택 해제" className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"><X className="size-4" /></button>}
    </div>

    {main && <Insight node={main} title={title} pair={focus.length > 1 ? focus.map((f) => byId.get(f)!).filter(Boolean) : null}
      ideas={ideas} hubs={[...highlight].map((id) => byId.get(id)!).filter((n) => n && n.type !== "IDEA" && !focus.includes(n.id))}
      signals={graph.signals.filter((s) => focus.every((f) => s.focus.includes(f)) && s.focus.length > 0)} onPick={select} />}

    <section>
      <h2 className="mb-1 text-lg font-extrabold tracking-tight">기회</h2>
      <ul className="divide-y divide-border">{ranked.map((s, i) => <li key={i}>
        <button type="button" onClick={() => pickSignal(s)} className="flex w-full items-center gap-3 py-3 text-left">
          <span className="w-[68px] shrink-0 rounded-full px-2 py-1 text-center text-[11px] font-extrabold text-white" style={{ background: SIGNAL_COLORS[s.kind] }}>{s.label}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-bold">{s.title}</span><span className="block truncate text-xs text-muted-foreground">{s.detail}</span></span>
          <ChevronRight className="size-4 shrink-0 text-[var(--text-4)]" />
        </button>
      </li>)}</ul>
      {blanks.length > 0 && <div className="mt-3 rounded-2xl border border-dashed border-border p-4">
        <p className="text-xs font-bold text-muted-foreground">아직 아무도 시도하지 않은 문제</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{blanks.map((b) => <Link key={b.title} href="/new" className="rounded-full bg-muted px-3 py-1.5 text-[13px] font-bold hover:bg-[var(--muted-hover)]">{b.title}</Link>)}</div>
      </div>}
      <p className="mt-3 text-[11px] text-[var(--text-4)]">공개 기록과 동네서랍 반응으로 계산한 신호예요 · 시장 규모가 아니에요</p>
    </section>
  </div>;
}

function Insight({ node, title, pair, ideas, hubs, signals, onPick }: {
  node: GraphNode; title: string | null; pair: GraphNode[] | null; ideas: GraphNode[]; hubs: GraphNode[]; signals: Signal[];
  onPick: (ids: string[], label?: string | null) => void;
}) {
  const s = pair ? null : node.stats;
  const grouped = (["NEED", "PLACE", "ACTOR", "BENEFICIARY", "BARRIER", "SOURCE"] as GraphNodeType[])
    .map((t) => ({ t, list: hubs.filter((h) => h.type === t) })).filter((g) => g.list.length);
  const counts = s ? [["시도", s.attempts], ["시행", s.going], ["멈춤", s.stopped], ["검증 중", s.live], ["미확인", s.unknown], ["반응", s.demand]].filter(([, v], i) => i === 0 || Number(v) > 0) as [string, number][] : [];

  return <section className="rounded-[22px] bg-muted p-5">
    <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
      {pair ? pair.map((p) => <span key={p.id} className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: nodeColor(p) }} />{p.label}</span>)
        : <><span className="size-2 rounded-full" style={{ background: nodeColor(node) }} />{node.type === "IDEA" ? (node.state ? STATE_LABELS[node.state] : "") : node.sub || ""}</>}
    </p>
    <h3 className="mt-1 text-[20px] font-extrabold leading-snug tracking-tight">{title ?? node.label}</h3>
    {node.type === "IDEA" && !pair && <p className="mt-1 text-sm text-muted-foreground tnum">{node.year} · {node.sub}</p>}

    {counts.length > 0 && <div className="mt-4 flex gap-5">{counts.map(([k, v]) => <div key={k}><p className="text-[22px] font-black leading-none tnum">{v}</p><p className="mt-1 text-[11px] font-semibold text-muted-foreground">{k}</p></div>)}</div>}
    {s && s.attempts > 0 && <div aria-hidden="true" className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-background">
      <span className="bg-primary" style={{ width: `${(s.going / s.attempts) * 100}%` }} />
      <span className="bg-[#ffd0b0]" style={{ width: `${((s.live + s.unknown) / s.attempts) * 100}%` }} />
      <span className="bg-[var(--text-4)]" style={{ width: `${(s.stopped / s.attempts) * 100}%` }} />
    </div>}
    {s && s.reasons.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{s.reasons.map((r) => <span key={r.tag} className="rounded-full bg-background px-2.5 py-1 text-xs font-bold">{r.tag}<span className="ml-1 text-[var(--nope)]">{r.count}</span></span>)}</div>}

    {signals.length > 0 && <ul className="mt-4 space-y-1.5">{signals.slice(0, 3).map((g, i) => <li key={i} className="flex items-start gap-2 text-sm">
      <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: SIGNAL_COLORS[g.kind] }} /><span><b>{g.label}</b> · {g.detail}</span>
    </li>)}</ul>}

    {grouped.length > 0 && <div className="mt-4 space-y-2">{grouped.map(({ t, list }) => <div key={t} className="flex flex-wrap gap-1.5">
      {list.slice(0, 8).map((h) => <button key={h.id} type="button" onClick={() => onPick([h.id])} className="flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs font-bold hover:bg-[var(--muted-hover)]">
        <span className="size-2 rounded-full" style={{ background: nodeColor(h) }} />{h.label}
      </button>)}
    </div>)}</div>}

    {node.type === "IDEA" && !pair && <div className="mt-4 flex items-center gap-3">
      {node.href && <Link href={node.href} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">카드 보기</Link>}
      {node.sourceUrl && <a href={node.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">출처<ArrowUpRight className="size-3" /></a>}
    </div>}
    {node.type === "SOURCE" && node.sourceUrl && <a href={node.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-0.5 text-sm font-bold text-primary">원문 보기<ArrowUpRight className="size-3.5" /></a>}

    {ideas.length > 0 && <ul className="mt-4 divide-y divide-border border-t border-border">{ideas.slice(0, 8).map((i) => <li key={i.id}>
      <button type="button" onClick={() => onPick([i.id])} className="flex w-full items-center gap-3 py-2.5 text-left text-sm">
        <span className="w-9 shrink-0 text-xs font-bold text-[var(--text-4)] tnum">{i.year}</span>
        <span className="min-w-0 flex-1 truncate font-semibold">{i.label}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{i.state ? STATE_LABELS[i.state] : ""}</span>
      </button>
    </li>)}</ul>}
  </section>;
}
