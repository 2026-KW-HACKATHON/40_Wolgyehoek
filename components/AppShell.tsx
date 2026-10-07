"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Heart,Gift,Bell,Layers,Coins} from "lucide-react";
import {BrandMark} from "./BrandMark";
import {cn} from "@/lib/utils";
const items=[{href:"/",label:"발견",icon:Heart},{href:"/rewards",label:"동네 혜택",icon:Gift},{href:"/team",label:"팀 공간",icon:Layers},{href:"/me",label:"내 활동",icon:Bell}];
export function AppShell({children,unread,nickname,operator,balance=0}:{children:React.ReactNode;unread:number;nickname?:string;operator:boolean;balance?:number}){
 const path=usePathname();const active=(href:string)=>href==="/"?path==="/"||path.startsWith("/cards"):path.startsWith(href);
 return <div className="mobile-app relative mx-auto min-h-dvh max-w-[480px] bg-background">
  <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:z-50 focus:bg-background focus:p-3">본문으로 건너뛰기</a>
  <header className="flex h-16 items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><BrandMark className="size-7 text-primary"/>동네서랍<span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary">DEMO</span></Link><Link href="/rewards" aria-label={`내 크레딧 ${balance}C, 동네 혜택 보기`} className="flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-3 py-2 text-xs font-bold text-primary"><Coins className="size-4"/>{balance.toLocaleString()} C</Link></header>
  <main id="content" className="pb-24">{children}</main>
  <footer className="px-5 pb-24 text-[10px] leading-5 text-muted-foreground">시연용 크레딧 · 실제 결제와 매장 사용은 지원하지 않아요.<br/>비공식 의견 조사이며 주민 신원이나 대표성을 보장하지 않습니다.<span className="sr-only">{nickname}{operator&&"운영자"}</span></footer>
  <nav aria-label="주 메뉴" className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-4 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={active(href)?"page":undefined} className={cn("relative flex min-h-[70px] flex-col items-center justify-center gap-1 text-[10px] font-semibold",active(href)?"text-primary":"text-muted-foreground")}><Icon className="size-[21px]"/>{label}{href==="/me"&&unread>0&&<span className="absolute right-8 top-3 size-2 rounded-full bg-primary" aria-label={`읽지 않은 소식 ${unread}개`}/>}</Link>)}</nav>
 </div>;
}
