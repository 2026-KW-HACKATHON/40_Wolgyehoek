export type GraphNodeType = "IDEA" | "NEED" | "PLACE" | "ACTOR" | "BENEFICIARY" | "BARRIER" | "SOURCE";
export type IdeaState = "GOING" | "STOPPED" | "LIVE" | "UNKNOWN";
export type SignalKind = "DEMAND" | "STALLED" | "SPREAD" | "UNVERIFIED" | "CROWDED" | "WHITESPACE";

export interface GraphStats {
  attempts: number; going: number; stopped: number; live: number; unknown: number; demand: number;
  since: number | null; until: number | null; reasons: { tag: string; count: number }[];
}
export interface GraphNode {
  id: string; type: GraphNodeType; label: string; sub: string; state: IdeaState | null; year: number;
  href: string | null; sourceUrl: string; stats: GraphStats | null;
}
export interface GraphLink { source: string; target: string; type: string }
export interface Signal { kind: SignalKind; label: string; title: string; detail: string; score: number; focus: string[] }
export interface KnowledgeGraph { nodes: GraphNode[]; links: GraphLink[]; signals: Signal[]; types: Record<GraphNodeType, string>; ideas: number }

export const NODE_COLORS: Record<GraphNodeType, string> = {
  IDEA: "#d9dbe0", NEED: "#ff6f0f", PLACE: "#ffb38a", ACTOR: "#4cb3ff", BENEFICIARY: "#3ddc97", BARRIER: "#ff4d4f", SOURCE: "#8a8f99",
};
export const STATE_COLORS: Record<IdeaState, string> = { GOING: "#ffd9bf", STOPPED: "#5c6068", LIVE: "#ffffff", UNKNOWN: "#a3a7b0" };
export const STATE_LABELS: Record<IdeaState, string> = { GOING: "시행", STOPPED: "멈춤", LIVE: "검증 중", UNKNOWN: "결과 미확인" };
export const SIGNAL_COLORS: Record<SignalKind, string> = {
  DEMAND: "#ff6f0f", STALLED: "#fa2314", SPREAD: "#1aa174", UNVERIFIED: "#009ceb", CROWDED: "#868b94", WHITESPACE: "#868b94",
};

export const nodeColor = (n: Pick<GraphNode, "type" | "state">) => (n.type === "IDEA" && n.state ? STATE_COLORS[n.state] : NODE_COLORS[n.type]);

export function nodeSize(n: GraphNode) {
  if (n.type === "IDEA") return 1.4;
  const a = n.stats?.attempts ?? 1;
  return n.type === "NEED" ? 3 + a * 1.2 : n.type === "SOURCE" ? 1.6 + a * 0.2 : 2.5 + a * 0.6;
}
