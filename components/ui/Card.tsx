// Adapted from Jangkki src/components/ui/Card.tsx (see docs/UI-PORT.md).
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";


const cardVariants = cva("rounded-lg border bg-card text-card-foreground border-border");

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn(cardVariants(), className)} {...props} />;
});
Card.displayName = "Card";


const CARD_HEADER_CLASS = "p-4 pb-0";
const CARD_CONTENT_CLASS = "p-4";
const CARD_FOOTER_CLASS = "border-t border-border px-4 py-3";

export type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(CARD_HEADER_CLASS, className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(CARD_CONTENT_CLASS, className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(CARD_FOOTER_CLASS, className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
