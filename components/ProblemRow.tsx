import Link from "next/link";
import type { Problem } from "@/lib/domain/problems";
import { cn } from "@/lib/utils";

export function CountsBar({ c, className }: { c: Problem["counts"]; className?: string }) {
  if (!c.total) return null;
  const pct = (n: number) => `${(n / c.total) * 100}%`;
  return <div aria-hidden="true" className={cn("flex h-1.5 overflow-hidden rounded-full bg-muted", className)}>
    <span className="bg-primary" style={{ width: pct(c.going) }} />
    <span className="bg-[#ffd0b0]" style={{ width: pct(c.live + c.unknown) }} />
    <span className="bg-[var(--text-4)]" style={{ width: pct(c.stopped) }} />
  </div>;
}

export function ProblemRow({ p }: { p: Problem }) {
  const years = p.since && p.until ? (p.since === p.until ? `${p.since}` : `${p.since}–${p.until}`) : "";
  return <Link href={`/problems/${p.id}`} className="group flex items-center gap-5 py-3.5">
    <div className="min-w-0 flex-1">
      <p className="truncate text-[16px] font-extrabold group-hover:text-primary">{p.need.label}<span className="ml-2 text-sm font-semibold text-muted-foreground">{p.place.label}</span></p>
      <p className="tnum mt-0.5 truncate text-xs text-[var(--text-4)]">{years}{years && " · "}시행 {p.counts.going} · 멈춤 {p.counts.stopped} · 검증 중 {p.counts.live} · 미확인 {p.counts.unknown}{p.barriers[0] ? ` · ${p.barriers[0].label}` : ""}</p>
      <CountsBar c={p.counts} className="mt-2 max-w-[360px]" />
    </div>
    <span className="tnum shrink-0 text-xl font-black text-primary">{p.counts.total}번</span>
  </Link>;
}
