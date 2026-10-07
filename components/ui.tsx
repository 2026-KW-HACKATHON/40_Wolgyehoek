import Link from "next/link";
import { Button } from "./ui/Button";
import { Badge, type BadgeProps } from "./ui/Badge";
import { DISCLAIMER, STATUS_LABELS, type CardStatus } from "@/lib/domain/types";

const STATUS_VARIANT: Record<CardStatus, BadgeProps["variant"]> = {
  open: "info", closed: "outline", go: "success", hold: "warning", stop: "destructive", stale: "default",
};
export function StatusBadge({ status }: { status: CardStatus }) {
  return <Badge variant={STATUS_VARIANT[status]} className="shrink-0 px-2 py-0.5 text-[11px] font-bold">{STATUS_LABELS[status]}</Badge>;
}
export function Pill({ children }: { children: React.ReactNode }) { return <Badge className="px-2 py-0.5 text-[11px] font-bold">{children}</Badge>; }

export function Disclaimer({ total }: { total?: number }) {
  return (
    <p className="text-xs leading-5 text-ink-3">
      {typeof total === "number" && <span className="tnum mr-2 text-ink">참여 {total}명</span>}
      {DISCLAIMER}
    </p>
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  return <Button asChild variant={variant === "primary" ? "default" : "soft"} className="h-12 px-6 text-[15px]"><Link href={href}>{children}</Link></Button>;
}
export const btnPrimary = "h-12 px-6 text-[15px] font-bold";
export const btnSecondary = "h-12 bg-none bg-muted px-6 text-[15px] text-foreground hover:bg-[#e9ebee]";
export const inputCls = "w-full min-h-12 rounded-2xl border-0 bg-muted px-4 py-3 text-base text-foreground placeholder:text-[var(--text-4)] focus-visible:ring-2 focus-visible:ring-primary";

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
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-[-0.02em]">{children}</h2>
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
