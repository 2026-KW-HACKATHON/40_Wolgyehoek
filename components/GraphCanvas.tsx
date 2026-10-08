"use client";
import { useI18n } from "@/lib/i18n/client";
import { graphNodeLabel } from "@/lib/i18n/messages/explore";
import { useEffect, useMemo, useRef } from "react";
import ForceGraph3D, { type ForceGraphMethods, type LinkObject, type NodeObject } from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import type { GraphLink, GraphNode, GraphNodeType } from "@/lib/domain/graph";
import { nodeColor, nodeSize } from "@/lib/domain/graph";

type N = NodeObject<GraphNode>;
type L = LinkObject<GraphNode, GraphLink>;
const LABELED: GraphNodeType[] = ["NEED", "PLACE"];
const LABEL_SIZE: Partial<Record<GraphNodeType, number>> = { NEED: 9, PLACE: 7, ACTOR: 6.5, BENEFICIARY: 6.5, BARRIER: 6.5, IDEA: 5.5, SOURCE: 5.5 };
const DIM = "#2e3036";
const endId = (end: L["source"]) => (typeof end === "object" && end ? String((end as N).id) : String(end));

export default function GraphCanvas({ nodes, links, width, height, focus, highlight, visible, onSelect }: {
  nodes: GraphNode[]; links: GraphLink[]; width: number; height: number;
  focus: string | null; highlight: Set<string>; visible: Set<GraphNodeType>; onSelect: (id: string | null) => void;
}) {
  const { t } = useI18n();
  const fg = useRef<ForceGraphMethods<N, L> | undefined>(undefined);
  const fitted = useRef(false);
  const data = useMemo(() => ({ nodes: nodes.map((n) => ({ ...n })), links: links.map((l) => ({ ...l })) }), [nodes, links]);
  const on = (id: string) => highlight.size === 0 || highlight.has(id);

  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    (g.d3Force("charge") as unknown as { strength: (v: number) => void } | undefined)?.strength(-70);
    (g.d3Force("link") as unknown as { distance: (v: number) => void } | undefined)?.distance(28);
    const frame = requestAnimationFrame(() => g.zoomToFit(0, 8));
    return () => cancelAnimationFrame(frame);
  }, [data]);

  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    const controls = g.controls() as { autoRotate?: boolean; autoRotateSpeed?: number };
    controls.autoRotate = !focus;
    controls.autoRotateSpeed = 0.7;
    if (!focus) { g.zoomToFit(900, 8); return; }
    g.zoomToFit(900, 48, (n) => highlight.has(String(n.id)));
  }, [focus, highlight, data]);

  return <ForceGraph3D<GraphNode, GraphLink>
    ref={fg}
    graphData={data}
    width={width}
    height={height}
    backgroundColor="#141416"
    controlType="orbit"
    showNavInfo={false}
    warmupTicks={160}
    cooldownTicks={60}
    nodeRelSize={3}
    nodeOpacity={0.95}
    nodeResolution={12}
    nodeVal={(n) => nodeSize(n as GraphNode)}
    nodeColor={(n) => (on(String(n.id)) ? nodeColor(n as GraphNode) : DIM)}
    nodeLabel={(n) => graphNodeLabel(n as GraphNode, t.common)}
    nodeVisibility={(n) => visible.has((n as GraphNode).type)}
    nodeThreeObjectExtend
    nodeThreeObject={(n) => {
      const node = n as N;
      const id = String(node.id);
      const lit = highlight.size > 0 && highlight.has(id) && (node.type !== "IDEA" || id === focus);
      if (highlight.size > 0 ? !lit : !LABELED.includes(node.type)) return null as never;
      const sprite = new SpriteText(graphNodeLabel(node, t.common), LABEL_SIZE[node.type] ?? 6, "#ffffff");
      sprite.fontFace = "-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
      sprite.fontWeight = node.type === "NEED" ? "800" : "600";
      sprite.center.set(0.5, -0.9);
      return sprite;
    }}
    linkVisibility={(l) => {
      const s = data.nodes.find((x) => x.id === endId(l.source));
      const t = data.nodes.find((x) => x.id === endId(l.target));
      return !!s && !!t && visible.has(s.type) && visible.has(t.type);
    }}
    linkColor={(l) => (!highlight.size ? "#ffffff" : highlight.has(endId(l.source)) && highlight.has(endId(l.target)) ? "#ff9e66" : "#26282d")}
    linkOpacity={0.18}
    linkWidth={(l) => (highlight.size && highlight.has(endId(l.source)) && highlight.has(endId(l.target)) ? 0.9 : 0)}
    linkDirectionalParticles={(l) => (highlight.size && highlight.has(endId(l.source)) && highlight.has(endId(l.target)) ? 2 : 0)}
    linkDirectionalParticleWidth={1.6}
    linkDirectionalParticleSpeed={0.006}
    linkDirectionalParticleColor={() => "#ff6f0f"}
    onNodeClick={(n) => onSelect(String(n.id))}
    onBackgroundClick={() => onSelect(null)}
    onEngineStop={() => {
      if (fitted.current) return;
      fitted.current = true;
      fg.current?.zoomToFit(600, 8);
    }}
  />;
}
