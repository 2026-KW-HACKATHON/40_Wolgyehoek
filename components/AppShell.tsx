"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { BrandLogo } from "./BrandMark";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "탐색" },
  { href: "/problems", label: "문제" },
  { href: "/report", label: "지역 리포트" },
  { href: "/me", label: "워크스페이스" },
  { href: "/connect", label: "AI 앱 연결" },
];

export function AppShell({ children, unread, nickname, operator }: { children: React.ReactNode; unread: number; nickname?: string; operator: boolean }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/cards") : path.startsWith(href));
  return <div className="min-h-dvh bg-background">
    <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:z-50 focus:bg-background focus:p-3">본문으로 건너뛰기</a>
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-4 md:gap-8 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[22px] font-black tracking-[-0.06em]"><BrandLogo className="size-7" /><span className="text-brand hidden sm:inline">동네서랍</span></Link>
        <nav aria-label="주 메뉴" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          {items.map(({ href, label }) => {
            const on = active(href);
            return <Link key={href} href={href} aria-current={on ? "page" : undefined}
              className={cn("relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[15px] font-bold transition-colors", on ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {label}
              {href === "/me" && unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" aria-label={`읽지 않은 소식 ${unread}개`} />}
            </Link>;
          })}
        </nav>
        <Link href="/new" className="bg-brand flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[15px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"><Plus className="size-4" strokeWidth={2.6} /><span className="hidden sm:inline">아이디어 등록</span><span className="sr-only sm:hidden">아이디어 등록</span></Link>
      </div>
    </header>
    <main id="content" className="pb-20">{children}<span className="sr-only">{nickname}{operator && " 운영자"}</span></main>
  </div>;
}
