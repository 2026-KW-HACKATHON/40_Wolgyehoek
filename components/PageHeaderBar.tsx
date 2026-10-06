// Adapted from Jangkki PageHeaderBar: fixed 64px header, 32px controls, separate filters.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function PageHeaderBar({ title, count, meta, action, children, className }: {
  title: string; count?: number; meta?: ReactNode; action?: ReactNode; children?: ReactNode; className?: string;
}) {
  return <div className={cn("shrink-0", className)}>
    <div className="flex h-16 items-center gap-2 border-b border-border px-4 sm:px-8">
      <h1 className="truncate text-base font-semibold">{title}</h1>
      {count !== undefined && <span className="text-xs tabular-nums text-muted-foreground">{count}건</span>}
      {meta && <span className="hidden truncate text-xs text-muted-foreground sm:block">{meta}</span>}
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
    {children && <div className="flex min-h-11 flex-wrap items-center gap-2 border-b border-border px-4 py-1.5 sm:px-6">{children}</div>}
  </div>;
}
