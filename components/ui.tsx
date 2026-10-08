import Link from "next/link";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
export { StatusBadge, Disclaimer } from "./ui/Localized";

export function Pill({ children }: { children: React.ReactNode }) { return <Badge className="px-2 py-0.5 text-[11px] font-bold">{children}</Badge>; }

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  return <Button asChild variant={variant === "primary" ? "default" : "soft"} className="h-12 px-6 text-[15px]"><Link href={href}>{children}</Link></Button>;
}
export const btnPrimary = "h-12 px-6 text-[15px] font-bold";
export const btnSecondary = "h-12 bg-none bg-muted px-6 text-[15px] text-foreground hover:bg-[var(--muted-hover)]";
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

export function fmtWon(n: number, locale: Locale = "ko") {
  return messages[locale].system.won(n);
}
