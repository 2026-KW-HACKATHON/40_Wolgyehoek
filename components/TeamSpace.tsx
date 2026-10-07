"use client";
import Link from "next/link";
import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {ChevronRight,Heart,Plus,X} from "lucide-react";
import type {Team} from "@/lib/credits";
import {endIdea,fundIdea,topupCredits} from "@/app/credit-actions";
import {Button} from "./ui/Button";
import {Input} from "./ui/Input";
export function TeamSpace({initial}:{initial:Team}){
 const [pending,start]=useTransition();const [error,setError]=useState("");const [notice,setNotice]=useState("");const [ending,setEnding]=useState<string|null>(null);const [amounts,setAmounts]=useState<Record<string,string>>({});const router=useRouter();
 function topup(amount:number){setError("");start(async()=>{const r=await topupCredits(amount);if(!r.ok){setError(r.error);return;}setNotice(`+${amount.toLocaleString()}C 충전`);router.refresh();});}
 function end(id:string){setError("");start(async()=>{const r=await endIdea(id);if(!r.ok){setError(r.error);return;}setEnding(null);setNotice(`마감 · ${r.data.returned}C 반환`);router.refresh();});}
 function fund(id:string){setError("");start(async()=>{const r=await fundIdea(id,Number(amounts[id]??"300"));if(!r.ok){setError(r.error);return;}setNotice("배정 완료");router.refresh();});}
 return <div className="space-y-8 px-4 pb-8 pt-2">
  <section className="rounded-[22px] bg-foreground p-6 text-white shadow-float">
   <p className="text-sm font-semibold text-white/60">팀 예산</p>
   <p className="mt-1 flex items-baseline gap-1.5 text-[46px] font-black leading-tight tracking-[-0.04em] tnum">{initial.balance.toLocaleString()}<span className="text-xl font-bold">C</span></p>
   <div className="mt-4 grid grid-cols-2 gap-2"><Button disabled={pending||!initial.enabled} onClick={()=>topup(500)}>+500C</Button><Button disabled={pending||!initial.enabled} onClick={()=>topup(1000)} className="bg-none bg-white/15 hover:bg-white/25">+1,000C</Button></div>
  </section>
  <Button asChild size="lg" className="w-full"><Link href="/new"><Plus/>새 아이디어</Link></Button>
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-sm font-bold text-primary">{notice}</p>}
  <section className="space-y-3">
   <h2 className="text-lg font-extrabold tracking-tight">우리 아이디어</h2>
   {initial.campaigns.length?initial.campaigns.map(c=>{const open=c.open;const live=open&&c.remaining>=30;const reasons=c.responses.filter(r=>r.reason);return <article key={c.id} className="rounded-[22px] border border-border p-5">
    <div className="flex items-start gap-3">
     <div className="min-w-0 flex-1"><span className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${c.hidden?"bg-muted text-muted-foreground":live?"bg-[var(--like)]/12 text-[var(--like)]":open?"bg-[var(--warning)] text-[var(--warning-foreground)]":"bg-muted text-muted-foreground"}`}>{live&&<span className="size-1.5 rounded-full bg-current"/>}{c.hidden?"숨김":live?"공개 중":open?"예산 필요":"종료"}</span><h3 className="text-[17px] font-extrabold leading-snug tracking-tight">{c.title}</h3></div>
     {!c.hidden&&<Link href={`/cards/${c.id}`} aria-label={`${c.title} 관리`} className="-mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--text-4)] hover:bg-muted"><ChevronRight className="size-5"/></Link>}
    </div>
    <dl className="mt-4 grid grid-cols-3 divide-x divide-border text-center">
     <div><dt className="text-[11px] text-muted-foreground">남은 예산</dt><dd className="mt-0.5 text-xl font-extrabold tnum">{c.remaining}<span className="text-sm">C</span></dd></div>
     <div><dt className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground"><Heart className="size-3 fill-[var(--like)] text-[var(--like)]"/>관심</dt><dd className="mt-0.5 text-xl font-extrabold tnum">{c.likes}</dd></div>
     <div><dt className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground"><X className="size-3 text-[var(--nope)]" strokeWidth={3}/>패스</dt><dd className="mt-0.5 text-xl font-extrabold tnum">{c.passes}</dd></div>
    </dl>
    <p className="mt-3 text-center text-[11px] text-[var(--text-4)] tnum">배정 {c.funded}C · 지급 {c.funded-c.remaining-c.returned}C · 반환 {c.returned}C</p>
    {open&&<div className="mt-4 flex gap-2"><label htmlFor={`fund-${c.id}`} className="sr-only">예산 추가</label><Input id={`fund-${c.id}`} variant="soft" type="number" min={30} max={10000} step={10} value={amounts[c.id]??"300"} onChange={e=>setAmounts(a=>({...a,[c.id]:e.target.value}))} className="h-11 min-w-0 flex-1 rounded-full tnum"/><Button disabled={pending} onClick={()=>fund(c.id)}>배정</Button></div>}
    {(open||c.remaining>0)&&<div className="mt-2">{ending===c.id?<div className="grid grid-cols-2 gap-2"><Button variant="soft" disabled={pending} onClick={()=>setEnding(null)}>취소</Button><Button disabled={pending} onClick={()=>end(c.id)} className="bg-none bg-foreground">{c.remaining}C 반환·마감</Button></div>:<Button variant="ghost" disabled={pending} onClick={()=>setEnding(c.id)} className="w-full text-sm text-muted-foreground">{open?"마감하기":"남은 예산 반환"}</Button>}</div>}
    {reasons.length>0&&<details className="mt-3 border-t border-border pt-3"><summary className="cursor-pointer text-sm font-bold">이유 {reasons.length}</summary><ul className="mt-3 space-y-2">{reasons.map((r,i)=><li key={i} className="flex gap-2.5 rounded-2xl bg-muted p-3">{r.direction==="RIGHT"?<Heart aria-label="관심" className="mt-0.5 size-4 shrink-0 fill-[var(--like)] text-[var(--like)]"/>:<X aria-label="패스" className="mt-0.5 size-4 shrink-0 text-[var(--nope)]" strokeWidth={3}/>}<p className="text-sm leading-6">{r.reason}</p></li>)}</ul></details>}
   </article>;}):<p className="py-8 text-center text-sm text-[var(--text-4)]">아직 아이디어가 없어요</p>}
  </section>
  {!!initial.ledger?.length&&<section><h2 className="mb-1 text-lg font-extrabold tracking-tight">예산 기록</h2><ul className="divide-y divide-border">{initial.ledger.map((r,i)=><li key={`${r.createdAt}-${i}`} className="flex items-center justify-between gap-3 py-3"><p className="min-w-0 truncate text-sm">{r.description}</p><span className="shrink-0 text-[15px] font-bold text-primary tnum">{r.amount>0?"+":""}{r.amount}C</span></li>)}</ul></section>}
  <div className="flex items-center justify-between text-[11px] text-[var(--text-4)]"><span>시연용 예산 · 실제 결제 없음</span><Link href="/admin" className="inline-flex min-h-10 items-center">운영자</Link></div>
 </div>;
}
