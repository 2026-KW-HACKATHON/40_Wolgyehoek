"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {GalleryVerticalEnd,Gift,Users,UserRound,Coins} from "lucide-react";
import {BrandMark} from "./BrandMark";
import {cn} from "@/lib/utils";
const items=[{href:"/",label:"발견",icon:GalleryVerticalEnd},{href:"/rewards",label:"동네 혜택",icon:Gift},{href:"/team",label:"팀 공간",icon:Users},{href:"/me",label:"내 활동",icon:UserRound}];
export function AppShell({children,unread,nickname,operator,balance=0}:{children:React.ReactNode;unread:number;nickname?:string;operator:boolean;balance?:number}){
 const path=usePathname();const active=(href:string)=>href==="/"?path==="/"||path.startsWith("/cards"):path.startsWith(href);
 return <div className="mobile-app relative mx-auto min-h-dvh max-w-[480px] bg-background">
  <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:z-50 focus:bg-background focus:p-3">본문으로 건너뛰기</a>
  <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-background px-4">
   <Link href="/" className="flex items-center gap-1.5 text-[22px] font-black tracking-[-0.06em]"><BrandMark className="size-6 text-primary"/><span className="text-brand">동네서랍</span></Link>
   <Link href="/rewards" aria-label={`내 크레딧 ${balance}C`} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-bold"><Coins className="size-4 text-primary"/><span className="tnum">{balance.toLocaleString()}</span></Link>
  </header>
  <main id="content" className="pb-24">{children}<span className="sr-only">{nickname}{operator&&" 운영자"}</span></main>
  <nav aria-label="주 메뉴" className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-4 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">{items.map(({href,label,icon:Icon})=>{const on=active(href);return <Link key={href} href={href} aria-label={label} aria-current={on?"page":undefined} className={cn("relative flex h-16 items-center justify-center transition-colors",on?"text-primary":"text-[var(--text-4)] hover:text-foreground")}><Icon className="size-[26px]" strokeWidth={on?2.4:2}/>{href==="/me"&&unread>0&&<span className="absolute left-1/2 top-4 ml-2 size-2.5 rounded-full border-2 border-background bg-primary" aria-label={`읽지 않은 소식 ${unread}개`}/>}</Link>;})}</nav>
 </div>;
}
