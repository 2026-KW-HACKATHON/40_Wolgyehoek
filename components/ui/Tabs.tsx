// Adapted from Jangkki src/components/ui/Tabs.tsx (see docs/UI-PORT.md).
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";



type TabsVariant = "pill" | "underline";

type TabsTone = "default" | "primary";

const TabsVariantContext = React.createContext<TabsVariant>("pill");
const TabsToneContext = React.createContext<TabsTone>("default");
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function Tabs({
  variant = "pill",
  tone = "default",
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  variant?: TabsVariant;
  tone?: TabsTone;
}) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsToneContext.Provider value={tone}>
        <TabsPrimitive.Root {...props} />
      </TabsToneContext.Provider>
    </TabsVariantContext.Provider>
  );
}

const listVariants: Record<TabsVariant, string> = {
  pill: "inline-flex items-center justify-center rounded-md bg-[var(--muted)] p-1",
  underline: "relative flex w-full items-center justify-start gap-1 border-b",
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>((props, ref) => {
  const variant = React.useContext(TabsVariantContext);
  if (variant === "underline") {
    return <UnderlineTabsList ref={ref} {...props} />;
  }
  const { className, ...rest } = props;
  return (
    <TabsPrimitive.List
      ref={ref}
      className={`${listVariants.pill} ${className ?? ""}`}
      {...rest}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;


const UnderlineTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, forwardedRef) => {
  const tone = React.useContext(TabsToneContext);
  const reducedMotion = useReducedMotion();
  const borderCls =
    tone === "primary" ? "border-white/15" : "border-[var(--border)]";
  const indicatorCls =
    tone === "primary"
      ? "bg-[var(--primary-foreground)]"
      : "bg-[var(--primary)]";
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = (): void => {
      const active = list.querySelector<HTMLElement>(
        '[role="tab"][data-state="active"]',
      );
      if (!active) return;
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };

    update();
    const mo = new MutationObserver(update);
    mo.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    ro?.observe(list);

    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  }, []);

  const setRefs = (node: HTMLDivElement | null): void => {
    listRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
    }
  };

  return (
    <TabsPrimitive.List
      ref={setRefs}
      className={cn(listVariants.underline, borderCls, className)}
      {...props}
    >
      {children}
      <motion.span
        key="tabs-underline-indicator"
        aria-hidden
        className={`pointer-events-none absolute -bottom-px left-0 h-0.5 ${indicatorCls}`}
        initial={false}
        animate={{ x: indicator.left, width: indicator.width }}
        transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
      />
    </TabsPrimitive.List>
  );
});
UnderlineTabsList.displayName = "UnderlineTabsList";

const triggerVariants: Record<TabsVariant, string> = {
  pill: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm",
  underline:
    "inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:font-bold",
};


const underlineTriggerTone: Record<TabsTone, string> = {
  default:
    "text-[var(--muted-foreground)] hover:text-[var(--foreground)] data-[state=active]:text-[var(--primary)]",
  primary:
    "text-white/60 hover:text-[var(--primary-foreground)] data-[state=active]:text-[var(--primary-foreground)]",
};

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  const tone = React.useContext(TabsToneContext);
  const toneCls =
    variant === "underline" ? ` ${underlineTriggerTone[tone]}` : "";
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={`${triggerVariants[variant]}${toneCls} ${className ?? ""}`}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
