"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { BrandLogo } from "./BrandMark";
import { ConnectorModal } from "./ConnectorModal";
import { LanguageToggle } from "./LanguageToggle";
import { McpIcon } from "./McpIcon";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", key: "explore" },
  { href: "/problems", key: "problems" },
  { href: "/report", key: "report" },
  { href: "/me", key: "me" },
] as const;

export function AppShell({ children, unread, nickname, operator, tools }: { children: React.ReactNode; unread: number; nickname?: string; operator: boolean; tools: string[] }) {
  const { t } = useI18n();
  const path = usePathname();
  const [connector, setConnector] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/cards") : path.startsWith(href));
  const navItem = "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[15px] font-bold transition-colors";
  return <div className="min-h-dvh bg-background">
    <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:z-50 focus:bg-background focus:p-3">{t.shell.skip}</a>
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-4 md:gap-8 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[22px] font-black tracking-[-0.06em]"><BrandLogo className="size-7" /><span className="text-brand hidden whitespace-nowrap sm:inline">{t.shell.brand}</span></Link>
        <nav aria-label={t.shell.mainMenu} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          {items.map(({ href, key }) => {
            const on = active(href);
            return <Link key={href} href={href} aria-current={on ? "page" : undefined}
              className={cn(navItem, on ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t.shell.nav[key]}
              {href === "/me" && unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" aria-label={t.shell.unread(unread)} />}
            </Link>;
          })}
          <button type="button" onClick={() => setConnector(true)} aria-haspopup="dialog"
            className={cn(navItem, connector ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <McpIcon className="size-4" />{t.shell.connector}
          </button>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <Link href="/new" className="bg-brand flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[15px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"><Plus className="size-4" strokeWidth={2.6} /><span className="hidden whitespace-nowrap sm:inline">{t.shell.newIdea}</span><span className="sr-only sm:hidden">{t.shell.newIdea}</span></Link>
        </div>
      </div>
    </header>
    <main id="content" className="pb-20">{children}<span className="sr-only">{nickname}{operator && ` ${t.shell.operator}`}</span></main>
    <ConnectorModal open={connector} onClose={() => setConnector(false)} tools={tools} />
  </div>;
}
