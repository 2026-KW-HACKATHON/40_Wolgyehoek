import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
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

export async function ProblemRow({ p }: { p: Problem }) {
  const { t, locale } = await getT();
  const num = (n: number) => n.toLocaleString(locale, { useGrouping: locale !== "ko" });
  const years = p.since && p.until ? (p.since === p.until ? `${p.since}` : `${p.since}–${p.until}`) : "";
  return <Link href={`/problems/${p.id}`} className="group flex items-center gap-5 py-3.5">
    <div className="min-w-0 flex-1">
      <p className="truncate text-[16px] font-extrabold group-hover:text-primary">{pick(t.common.needs, p.need.key, p.need.label)}<span className="ml-2 text-sm font-semibold text-muted-foreground">{pick(t.common.places, p.place.key, p.place.label)}</span></p>
      <p className="tnum mt-0.5 truncate text-xs text-[var(--text-4)]">{years}{years && " · "}{t.problems.going} {num(p.counts.going)} · {t.problems.stopped} {num(p.counts.stopped)} · {t.problems.testing} {num(p.counts.live)} · {t.problems.unknown} {num(p.counts.unknown)}{p.barriers[0] ? ` · ${pick(t.common.barriers, p.barriers[0].label, p.barriers[0].label)}` : ""}</p>
      <CountsBar c={p.counts} className="mt-2 max-w-[360px]" />
    </div>
    <span className="tnum shrink-0 text-xl font-black text-primary">{t.problems.times(num(p.counts.total))}</span>
  </Link>;
}
