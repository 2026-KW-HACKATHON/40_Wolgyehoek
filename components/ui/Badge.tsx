// Adapted from Jangkki src/components/ui/Badge.tsx (see docs/UI-PORT.md).
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
const badgeVariants = cva("inline-flex items-center rounded-full font-medium", {
  variants: {
    variant: {
      default: "bg-[var(--muted)] text-[var(--muted-foreground)]",
      info: "bg-[var(--info)] text-[var(--info-foreground)]",
      destructive:
        "bg-[var(--destructive-surface)] text-[var(--destructive-foreground)]",
      success: "bg-[var(--success)] text-[var(--success-foreground)]",
      warning: "bg-[var(--warning)] text-[var(--warning-foreground)]",
      outline: "border border-[var(--border)] text-[var(--foreground)] bg-[var(--background)]",
      brand: "bg-[var(--primary)] text-[var(--primary-foreground)]",
      brandSoft:
        "border border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]",

    },
    size: {
      default: "px-2.5 py-0.5 text-sm",
      sm: "h-5 px-1.5 py-0 text-[10px] leading-none",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, size, className })} {...props}>
      {children}
    </div>
  );
}

export { badgeVariants };
