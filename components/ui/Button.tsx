// Adapted from Jangkki src/components/ui/Button.tsx (see docs/UI-PORT.md).
"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"


const buttonVariants = cva(
  "min-h-11 inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-[color,background-color,border-color,box-shadow,transform] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[image:var(--brand-gradient)] text-primary-foreground hover:brightness-105",
        destructive:
          "bg-destructive text-[var(--destructive-on-solid)] hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        soft: "bg-muted text-foreground hover:bg-[#e9ebee]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-[17px] font-bold [&_svg]:size-5",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "ghost",
        active: true,
        class: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      {
        variant: "outline",
        active: true,
        class: "border-primary bg-primary/10 font-medium text-primary",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  
  loading?: boolean
  
  active?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, active, asChild = false, loading = false, disabled, type, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const resolvedType = asChild ? type : (type ?? "button")
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, active, className }))}
        ref={ref}
        type={resolvedType}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        aria-pressed={active}
        {...props}
      >
        {loading && !asChild ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
