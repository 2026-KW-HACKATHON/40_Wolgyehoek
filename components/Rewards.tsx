"use client";
import Link from "next/link";
import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {ChevronRight,Coffee,Gift,UtensilsCrossed,Check} from "lucide-react";
import type {Wallet,Product} from "@/lib/credits";
import {buyVoucher,redeemVoucher} from "@/app/credit-actions";
import {Button} from "./ui/Button";
export function Rewards({wallet,products}:{wallet:Wallet;products:Product[]}){
 const [selection,setSelection]=useState<Product|null>(null);const [useId,setUseId]=useState<string|null>(null);const [request,setRequest]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");const [pending,start]=useTransition();const router=useRouter();
 function buy(){if(!selection)return;setError("");start(async()=>{const r=await buyVoucher(selection.id,request);if(!r.ok){setError(r.error);return;}setSelection(null);setNotice("교환 완료");router.refresh();});}
 function use(){if(!useId)return;setError("");start(async()=>{const r=await redeemVoucher(useId);if(!r.ok){setError(r.error);return;}setUseId(null);setNotice("사용 완료");router.refresh();});}
 const unused=wallet.vouchers.filter(v=>!v.usedAt).length;
 return <div className="space-y-8 px-4 pb-8 pt-2">
  <section className="bg-brand relative overflow-hidden rounded-[22px] p-6 text-white shadow-float">
   <p className="text-sm font-semibold text-white/80">내 크레딧</p>
   <p className="mt-1 flex items-baseline gap-1.5 text-[46px] font-black leading-tight tracking-[-0.04em] tnum">{wallet.balance.toLocaleString()}<span className="text-xl font-bold">C</span></p>
   <Link href="/" className="mt-4 inline-flex h-10 items-center gap-1 rounded-full bg-white/20 pl-4 pr-3 text-sm font-bold backdrop-blur hover:bg-white/30">더 모으기<ChevronRight className="size-4"/></Link>
  </section>
  {notice&&<p role="status" className="rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-sm font-bold text-primary">{notice}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  <section>
   <h2 className="mb-2 text-lg font-extrabold tracking-tight">교환하기</h2>
   <ul className="divide-y divide-border">{products.map(p=>{const short=wallet.balance<p.cost;return <li key={p.id} className="flex items-center gap-4 py-3.5">
    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">{p.id==="coffee"?<Coffee className="size-6"/>:p.id==="meal"?<UtensilsCrossed className="size-6"/>:<Gift className="size-6"/>}</span>
    <div className="min-w-0 flex-1"><h3 className="truncate text-[15px] font-bold">{p.title}</h3><p className="mt-0.5 truncate text-xs text-muted-foreground">{p.shop}</p></div>
    <Button size="sm" variant={short?"soft":"default"} aria-label={`${p.title} ${p.cost}C로 교환`} disabled={!wallet.enabled||short||pending} onClick={()=>{setSelection(p);setRequest(crypto.randomUUID());setError("");}} className="tnum min-w-[72px]">{p.cost}C</Button>
   </li>;})}</ul>
   {selection&&<div aria-labelledby="purchase-title" role="group" className="mt-3 rounded-[22px] bg-muted p-5"><h3 id="purchase-title" className="text-[17px] font-extrabold">{selection.title}</h3><p className="mt-1 text-sm text-muted-foreground tnum">{wallet.balance}C → {wallet.balance-selection.cost}C</p><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" disabled={pending} onClick={()=>setSelection(null)}>취소</Button><Button disabled={pending} onClick={buy}>{pending?"교환 중…":"교환"}</Button></div></div>}
  </section>
  <section>
   <h2 className="mb-3 text-lg font-extrabold tracking-tight">내 이용권 {unused>0&&<span className="text-primary">{unused}</span>}</h2>
   {wallet.vouchers.length?<div className="space-y-3">{wallet.vouchers.map(v=><article key={v.id} className={`flex overflow-hidden rounded-[18px] border border-border ${v.usedAt?"opacity-60":""}`}>
    <span aria-hidden="true" className={`w-2 shrink-0 ${v.usedAt?"bg-border":"bg-brand"}`}/>
    <div className="flex flex-1 items-center gap-3 p-4">
     <div className="min-w-0 flex-1"><h3 className="truncate text-[15px] font-bold">{v.title}</h3><p className="mt-0.5 font-mono text-[11px] text-[var(--text-4)]">DEMO {v.id.toUpperCase()}</p></div>
     {v.usedAt?<span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Check className="size-4"/>사용 완료</span>:useId===v.id?<div className="flex gap-1.5"><Button size="sm" variant="soft" disabled={pending} onClick={()=>setUseId(null)}>취소</Button><Button size="sm" disabled={pending} onClick={use}>확인</Button></div>:<Button variant="outline" size="sm" disabled={pending} onClick={()=>setUseId(v.id)}>사용</Button>}
    </div>
   </article>)}</div>:<p className="py-6 text-center text-sm text-[var(--text-4)]">아직 없어요</p>}
  </section>
  <section>
   <h2 className="mb-1 text-lg font-extrabold tracking-tight">기록</h2>
   {wallet.ledger.length?<ul className="divide-y divide-border">{wallet.ledger.map((r,i)=><li key={`${r.createdAt}-${i}`} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm">{r.description}</p><time className="text-xs text-[var(--text-4)]">{new Date(r.createdAt).toLocaleDateString("ko-KR",{timeZone:"Asia/Seoul"})}</time></div><span className={`shrink-0 text-[15px] font-bold tnum ${r.amount>0?"text-primary":"text-muted-foreground"}`}>{r.amount>0?"+":""}{r.amount}C</span></li>)}</ul>:<p className="py-6 text-center text-sm text-[var(--text-4)]">아직 없어요</p>}
  </section>
  <p className="text-center text-[11px] text-[var(--text-4)]">시연용 크레딧 · 실제 결제·매장 사용 불가</p>
 </div>;
}
