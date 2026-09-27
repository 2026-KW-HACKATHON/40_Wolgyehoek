export const SIMILAR_THRESHOLD = 0.2;

export function bigrams(text: string): Set<string> {
  const s = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

export interface Candidate {
  id: string;
  title: string;
  body: string;
  hidden: boolean;
}

export function similarCards<T extends Candidate>(draft: { title: string; body: string }, cards: T[], limit = 3) {
  const d = bigrams(`${draft.title} ${draft.body}`);
  return cards
    .filter((c) => !c.hidden)
    .map((c) => ({ card: c, score: jaccard(d, bigrams(`${c.title} ${c.body}`)) }))
    .filter((x) => x.score >= SIMILAR_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
