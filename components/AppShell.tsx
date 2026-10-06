"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ArrowUpRight, Bell, CirclePlus, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "기록 탐색", icon: Archive },
  { href: "/new", label: "아이디어 올리기", icon: CirclePlus },
  { href: "/me", label: "내 참여", icon: Bell },
  { href: "/admin", label: "운영", icon: ShieldCheck },
];
export function AppShell({ children, unread, nickname, operator }: { children: React.ReactNode; unread: number; nickname?: string; operator: boolean }) {
  const path = usePathname();
  const active = (href: string) => href === "/" ? path === "/" || path.startsWith("/cards") : path.startsWith(href);
  return <div className="min-h-dvh">
    <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3">본문으로 건너뛰기</a>
    <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-border bg-[var(--shell-frame-bg)] md:flex">
      <Link href="/" className="flex h-20 items-center gap-3 px-6"><Archive className="size-7 text-primary" /><span className="text-lg font-bold tracking-tight">동네서랍</span></Link>
      <div className="mx-4 mb-5 flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2.5 text-xs text-muted-foreground"><MapPin className="size-3.5" /> 월계1동 · 청년과 지역</div>
      <nav aria-label="주 메뉴" className="space-y-1 px-3">
        {items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={cn("flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-background/70", active(href) ? "bg-background text-primary" : "text-muted-foreground")}><Icon className="size-4" />{label}{href === "/me" && unread > 0 && <Badge size="sm" variant="brand" className="ml-auto" aria-label={`읽지 않은 알림 ${unread}개`}>{unread}</Badge>}</Link>)}
      </nav>
      <div className="mt-auto space-y-3 border-t border-border p-5"><p className="text-xs text-muted-foreground">{nickname ?? "로그인 없이 함께하는 지역 기록"}</p>{operator && <Badge variant="brandSoft" size="sm">운영자 모드</Badge>}<p className="text-[11px] leading-5 text-muted-foreground">2026 KW해커톤<br />40조 월계획</p></div>
    </aside>
    <div className="md:ml-56 md:p-3 md:pl-0">
      <div className="min-h-dvh overflow-hidden bg-background md:min-h-[calc(100dvh-24px)] md:rounded-xl md:border md:border-border">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden"><Link href="/" className="flex items-center gap-2 font-bold"><Archive className="size-5 text-primary" />동네서랍</Link><Button asChild size="sm" variant="outline"><Link href="/new">아이디어 올리기<ArrowUpRight /></Link></Button></header>
        <main id="content" className="pb-24 md:pb-12">{children}</main>
        <footer className="border-t border-border px-6 py-5 text-xs leading-5 text-muted-foreground">반응과 리포트는 비공식 의견 조사이며, 공식 결정이나 대표성을 보장하지 않습니다.</footer>
      </div>
    </div>
    <nav aria-label="모바일 주 메뉴" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={cn("relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium", active(href) ? "text-primary" : "text-muted-foreground")}><Icon className="size-5" />{label}{href === "/me" && unread > 0 && <span className="absolute right-5 top-2 size-2 rounded-full bg-primary" aria-label={`읽지 않은 알림 ${unread}개`} />}</Link>)}</nav>
  </div>;
}
