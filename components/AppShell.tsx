"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Archive,GalleryVerticalEnd,Plus,UserRound,Sparkles} from "lucide-react";
import {BrandLogo} from "./BrandMark";
import {cn} from "@/lib/utils";
const items=[{href:"/",label:"서랍",icon:Archive},{href:"/discover",label:"발견",icon:GalleryVerticalEnd},{href:"/me",label:"나",icon:UserRound}];
const NO_FAB=["/new","/cards","/admin","/discover"];
export function AppShell({children,unread,nickname,operator,balance=0,points=false}:{children:React.ReactNode;unread:number;nickname?:string;operator:boolean;balance?:number;points?:boolean}){
 const path=usePathname();const active=(href:string)=>href==="/"?path==="/":href==="/discover"?path.startsWith("/discover")||path.startsWith("/cards"):path.startsWith(href);
 return <div className="mobile-app relative mx-auto min-h-dvh max-w-[480px] bg-background">
  <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:z-50 focus:bg-background focus:p-3">본문으로 건너뛰기</a>
  <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-background px-4">
   <Link href="/" className="flex items-center gap-1.5 text-[22px] font-black tracking-[-0.06em]"><BrandLogo className="size-7"/><span className="text-brand">동네서랍</span></Link>
   {points&&<Link href="/me" aria-label={`기록 포인트 ${balance}P`} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-bold"><Sparkles className="size-4 text-primary"/><span className="tnum">{balance.toLocaleString()}P</span></Link>}
  </header>
  <main id="content" className="pb-24">{children}<span className="sr-only">{nickname}{operator&&" 운영자"}</span></main>
  {!NO_FAB.some(p=>path.startsWith(p))&&<div className="pointer-events-none fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-1/2 z-30 flex w-full max-w-[480px] -translate-x-1/2 justify-end px-4"><Link href="/new" aria-label="아이디어 올리기" className="bg-brand pointer-events-auto flex size-14 items-center justify-center rounded-full text-white shadow-float transition-transform hover:scale-105 active:scale-95"><Plus className="size-7" strokeWidth={2.6}/></Link></div>}
  <nav aria-label="주 메뉴" className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-3 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">{items.map(({href,label,icon:Icon})=>{const on=active(href);return <Link key={href} href={href} aria-current={on?"page":undefined} className={cn("relative flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors",on?"text-primary":"text-[var(--text-4)] hover:text-foreground")}><Icon className="size-6" strokeWidth={on?2.4:2}/>{label}{href==="/me"&&unread>0&&<span className="absolute left-1/2 top-3 ml-2 size-2.5 rounded-full border-2 border-background bg-primary" aria-label={`읽지 않은 소식 ${unread}개`}/>}</Link>;})}</nav>
 </div>;
}
