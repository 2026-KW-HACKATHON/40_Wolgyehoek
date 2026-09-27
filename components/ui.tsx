import Link from "next/link";
import { DISCLAIMER, STATUS_LABELS, type CardStatus } from "@/lib/domain/types";

const STATUS_STYLE: Record<CardStatus, string> = {
  open: "bg-[var(--badge-bg)] text-[var(--badge-fg)]",
  closed: "bg-subtle text-ink-2 ring-line",
  go: "bg-[var(--go-bg)] text-[var(--go-fg)]",
  hold: "bg-[var(--hold-bg)] text-[var(--hold-fg)]",
  stop: "bg-[var(--stop-bg)] text-[var(--stop-fg)]",
  stale: "bg-subtle text-ink-3 ring-line",
};

export function StatusBadge({ status }: { status: CardStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-subtle px-2.5 py-0.5 text-xs font-medium text-ink-2 ring-line">{children}</span>;
}

export function Disclaimer({ total }: { total?: number }) {
  return (
    <p className="rounded-md bg-subtle px-3 py-2 font-mono text-[12px] leading-5 text-ink-3 ring-line">
      {typeof total === "number" && <span className="tnum mr-2 text-ink">참여 {total}명</span>}
      {DISCLAIMER}
    </p>
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const cls =
    variant === "primary"
      ? "bg-primary text-white hover:bg-[var(--primary-hover)]"
      : "bg-white text-ink ring-line hover:bg-subtle";
  return (
    <Link href={href} className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors ${cls}`}>
      {children}
    </Link>
  );
}

export const btnPrimary =
  "inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:bg-divider disabled:text-ink-4";
export const btnSecondary =
  "inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-ink ring-line transition-colors hover:bg-subtle disabled:text-ink-4";
export const inputCls =
  "w-full rounded-md bg-white px-3 py-2.5 text-[15px] text-ink ring-line placeholder:text-ink-4 focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--focus)]";

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
