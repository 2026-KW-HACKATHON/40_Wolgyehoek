import type { GraphNode, IdeaState, KnowledgeGraph, Signal } from "./graph";
import precedentData from "./precedents.json";

// 다른 지역·해외의 공개 선례. lib/domain/precedents.json 에 출처와 함께 쌓는다.
export interface Precedent {
  id: string;
  title: string;
  year: number;
  country: string;
  countryCode: string;
  region: string;
  need: string;
  beneficiary: string;
  by: string;
  approach: string;
  outcome: "GOING" | "STOPPED" | "UNKNOWN";
  reason: string;
  sourceTitle: string;
  sourceUrl: string;
}

export const PRECEDENTS = precedentData as Precedent[];

export interface Label { key: string; label: string }
export interface ProblemAttempt {
  id: string; title: string; year: number; state: IdeaState; href: string | null; sourceUrl: string;
  place: Label; actor: string | null; barriers: string[];
}
export interface ProblemCounts { total: number; going: number; stopped: number; live: number; unknown: number }
export interface Problem {
  id: string;
  need: Label;
  place: Label;
  beneficiaries: (Label & { count: number })[];
  barriers: { label: string; count: number }[];
  attempts: ProblemAttempt[];
  counts: ProblemCounts;
  since: number | null;
  until: number | null;
}

export const problemId = (need: string, place: string) => `${need}.${place}`;
const keyOf = (id: string) => id.slice(id.indexOf(":") + 1);

interface Index {
  nodes: Map<string, GraphNode>;
  out: Map<string, { target: string; type: string }[]>;
}

function indexGraph(g: KnowledgeGraph): Index {
  const nodes = new Map(g.nodes.map((n) => [n.id, n]));
  const out = new Map<string, { target: string; type: string }[]>();
  for (const l of g.links) {
    const list = out.get(l.source) ?? [];
    list.push({ target: l.target, type: l.type });
    out.set(l.source, list);
  }
  return { nodes, out };
}

function attemptOf(ix: Index, idea: GraphNode): ProblemAttempt & { needs: string[]; bens: string[] } {
  const links = ix.out.get(idea.id) ?? [];
  const pick = (type: string) => links.filter((l) => l.type === type).map((l) => l.target);
  const placeId = pick("LOCATED_IN")[0] ?? "place:WIDE";
  const actorId = pick("LED_BY")[0];
  return {
    id: idea.id,
    title: idea.label,
    year: idea.year,
    state: idea.state ?? "UNKNOWN",
    href: idea.href,
    sourceUrl: idea.sourceUrl,
    place: { key: keyOf(placeId), label: ix.nodes.get(placeId)?.label ?? idea.sub },
    actor: actorId ? ix.nodes.get(actorId)?.label ?? keyOf(actorId) : null,
    barriers: pick("BLOCKED_BY").map((b) => ix.nodes.get(b)?.label ?? keyOf(b)),
    needs: pick("ADDRESSES"),
    bens: pick("SERVES"),
  };
}

const toAttempt = (a: ReturnType<typeof attemptOf>): ProblemAttempt => ({
  id: a.id, title: a.title, year: a.year, state: a.state, href: a.href, sourceUrl: a.sourceUrl,
  place: a.place, actor: a.actor, barriers: a.barriers,
});

function countsOf(list: ProblemAttempt[]): ProblemCounts {
  const by = (s: IdeaState) => list.filter((a) => a.state === s).length;
  return { total: list.length, going: by("GOING"), stopped: by("STOPPED"), live: by("LIVE"), unknown: by("UNKNOWN") };
}

function tally(values: string[]) {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

// 문제 = 니즈(작은 개념) × 장소. 같은 니즈와 장소를 다룬 시도들이 한 문제 아래 모인다.
export function buildProblems(g: KnowledgeGraph): Problem[] {
  const ix = indexGraph(g);
  const groups = new Map<string, { need: string; place: Label; items: ReturnType<typeof attemptOf>[] }>();
  for (const idea of g.nodes.filter((n) => n.type === "IDEA")) {
    const a = attemptOf(ix, idea);
    for (const needId of a.needs) {
      const id = problemId(keyOf(needId), a.place.key);
      const grp = groups.get(id) ?? { need: needId, place: a.place, items: [] };
      grp.items.push(a);
      groups.set(id, grp);
    }
  }
  return [...groups].map(([id, grp]) => {
    const attempts = grp.items
      .map(toAttempt)
      .sort((a, b) => b.year - a.year);
    const years = attempts.map((a) => a.year).filter((y) => y > 0);
    const bens = tally(grp.items.flatMap((i) => i.bens)).map((b) => ({
      key: keyOf(b.label), label: ix.nodes.get(b.label)?.label ?? keyOf(b.label), count: b.count,
    }));
    return {
      id,
      need: { key: keyOf(grp.need), label: ix.nodes.get(grp.need)?.label ?? keyOf(grp.need) },
      place: grp.place,
      beneficiaries: bens,
      barriers: tally(attempts.flatMap((a) => a.barriers)),
      attempts,
      counts: countsOf(attempts),
      since: years.length ? Math.min(...years) : null,
      until: years.length ? Math.max(...years) : null,
    };
  }).sort((a, b) => b.counts.total - a.counts.total || b.counts.stopped - a.counts.stopped);
}

export const precedentsFor = (needs: string[]) => PRECEDENTS.filter((p) => needs.includes(p.need));

// 같은 성질(니즈)의 문제를 다른 장소에서 다룬 시도와 국내외 선례.
export function elsewhere(problems: Problem[], p: Pick<Problem, "need" | "place">) {
  return {
    local: problems.filter((o) => o.need.key === p.need.key && o.place.key !== p.place.key),
    precedents: precedentsFor([p.need.key]),
  };
}

export function needsOf(g: KnowledgeGraph): Label[] {
  return g.nodes.filter((n) => n.type === "NEED").map((n) => ({ key: keyOf(n.id), label: n.label }));
}
export function placesOf(g: KnowledgeGraph): Label[] {
  return g.nodes.filter((n) => n.type === "PLACE").map((n) => ({ key: keyOf(n.id), label: n.label }));
}

export function searchProblems(problems: Problem[], q: { text?: string; need?: string; place?: string }) {
  const text = q.text?.trim().toLowerCase();
  return problems.filter((p) =>
    (!q.need || p.need.key === q.need) &&
    (!q.place || p.place.key === q.place) &&
    (!text || [p.need.label, p.place.label, ...p.attempts.map((a) => a.title), ...p.barriers.map((b) => b.label)]
      .some((s) => s.toLowerCase().includes(text))));
}

export interface RegionReport {
  place: Label | null;
  totals: ProblemCounts;
  problems: Problem[];
  barriers: { label: string; count: number }[];
  whitespace: Label[];
  live: ProblemAttempt[];
  signals: Signal[];
}

// 지자체·의원실용 지역 리포트. place 를 비우면 전체를 본다.
export function regionReport(g: KnowledgeGraph, placeKey?: string): RegionReport {
  const all = buildProblems(g);
  const problems = placeKey ? all.filter((p) => p.place.key === placeKey) : all;
  const seen = new Map<string, ProblemAttempt>();
  for (const p of problems) for (const a of p.attempts) seen.set(a.id, a);
  const attempts = [...seen.values()];
  const touched = new Set(problems.map((p) => p.need.key));
  const place = placeKey ? placesOf(g).find((p) => p.key === placeKey) ?? null : null;
  return {
    place,
    totals: countsOf(attempts),
    problems: [...problems].sort((a, b) => b.counts.total - a.counts.total).slice(0, 10),
    barriers: tally(attempts.flatMap((a) => a.barriers)),
    whitespace: [
      ...needsOf(g).filter((n) => !touched.has(n.key)),
      ...g.signals.filter((s) => s.kind === "WHITESPACE" && !touched.has(keyOf(s.focus[0] ?? "")))
        .map((s) => ({ key: keyOf(s.focus[0] ?? s.title), label: s.title })),
    ].filter((n, i, all) => all.findIndex((m) => m.key === n.key) === i),
    live: attempts.filter((a) => a.state === "LIVE"),
    signals: g.signals.filter((s) => !placeKey || s.focus.includes(`place:${placeKey}`)),
  };
}
