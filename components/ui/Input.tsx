// Adapted from Jangkki src/components/ui/Input.tsx (see docs/UI-PORT.md).
"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"


export const softInputSurfaceClass =
  "rounded-xl border-0 bg-[var(--field-bg)] shadow-none placeholder:text-sm placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset";

const inputVariants = cva(
  "min-h-11 flex w-full text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-input bg-transparent shadow-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring",
        soft: softInputSurfaceClass,
      },
      size: {
        default: "h-10 px-3 py-2 text-base md:text-base",
        sm: "h-8 px-3 py-1.5 text-sm",
        lg: "h-12 px-4 py-2 text-base",
      },
    },
    compoundVariants: [
      { variant: "soft", size: "default", class: "px-4 text-sm md:text-sm" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
