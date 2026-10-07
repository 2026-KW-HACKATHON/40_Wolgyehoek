import Link from "next/link";
import { Button } from "./ui/Button";
import { Badge, type BadgeProps } from "./ui/Badge";
import { DISCLAIMER, STATUS_LABELS, type CardStatus } from "@/lib/domain/types";

const STATUS_VARIANT: Record<CardStatus, BadgeProps["variant"]> = {
  open: "info", closed: "outline", go: "success", hold: "warning", stop: "destructive", stale: "default",
};
export function StatusBadge({ status }: { status: CardStatus }) {
  return <Badge variant={STATUS_VARIANT[status]} className="text-xs">{STATUS_LABELS[status]}</Badge>;
}
export function Pill({ children }: { children: React.ReactNode }) { return <Badge className="text-xs">{children}</Badge>; }

export function Disclaimer({ total }: { total?: number }) {
  return (
    <p className="rounded-md bg-subtle px-3 py-2 font-mono text-[12px] leading-5 text-ink-3 ring-line">
      {typeof total === "number" && <span className="tnum mr-2 text-ink">참여 {total}명</span>}
      {DISCLAIMER}
    </p>
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  return <Button asChild variant={variant === "primary" ? "default" : "outline"} size="lg" className="h-11 rounded-xl px-4 text-sm"><Link href={href}>{children}</Link></Button>;
}
export const btnPrimary = "h-11 rounded-xl px-4 text-sm";
export const btnSecondary = "h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground hover:bg-accent";
export const inputCls = "w-full min-h-11 rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring";

export function FormMessage({ state }: { state: { ok: boolean; error?: string; message?: string } | null }) {
  if (!state || (!state.error && !state.message)) return null;
  return (
    <p role="status" className={`text-sm ${state.ok ? "text-ink" : "text-[var(--stop-fg)]"}`}>
      {state.ok ? state.message : state.error}
    </p>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-xl font-semibold tracking-[-0.02em]">{children}</h2>
      {sub && <div className="text-sm text-ink-3">{sub}</div>}
    </div>
  );
}

const kstParts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" });

export function fmtDate(d: Date) {
  const p = Object.fromEntries(kstParts.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.month}.${p.day}`;
}

export function fmtWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}
