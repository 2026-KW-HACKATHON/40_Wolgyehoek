"use client";
import Link from "next/link";
import {useEffect,useRef,useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {ArrowRight,Check,Heart,MapPin,MessageCircle,RotateCcw,Sparkles,X,Coins} from "lucide-react";
import type {Deck} from "@/lib/credits";
import {prepareSamples,swipeIdea} from "@/app/credit-actions";
import {Button} from "./ui/Button";
import {Textarea} from "./ui/Textarea";

export function SwipeDeck({initial}:{initial:Deck}){
 const [cards,setCards]=useState(initial.cards);const [balance,setBalance]=useState(initial.balance);const [choice,setChoice]=useState<"RIGHT"|"LEFT"|null>(null);
 const [reason,setReason]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");const [dx,setDx]=useState(0);const [pending,start]=useTransition();
 const pointer=useRef<{id:number;x:number;y:number}|null>(null);const dialog=useRef<HTMLDialogElement>(null);const router=useRouter();const card=cards[0];
 useEffect(()=>{if(choice&&!dialog.current?.open)dialog.current?.showModal();else if(!choice&&dialog.current?.open)dialog.current.close();},[choice]);
 function choose(direction:"RIGHT"|"LEFT"){if(!card||pending)return;setDx(0);setChoice(direction);setReason("");setError("");}
 function submit(withReason:boolean){if(!card||!choice)return;setError("");start(async()=>{const r=await swipeIdea(card.id,choice,withReason?reason:"");if(!r.ok){setError(r.error);return;}setCards(c=>c.filter(x=>x.id!==card.id));setBalance(r.data.balance);setNotice(r.data.duplicate?"이미 저장된 반응이에요. 보상은 한 번만 지급돼요.":`생각을 남겼어요. +${r.data.reward}C를 받았어요!`);setChoice(null);router.refresh();});}
 function samples(){setError("");start(async()=>{const r=await prepareSamples();if(!r.ok){setError(r.error);return;}setCards(r.data.cards);setBalance(r.data.balance);router.refresh();});}
 const valid=reason.replace(/\s/g,"").length>=10&&reason.length<=500;
 return <div className="px-5 pb-4">
  <div className="mb-4"><p className="mb-1 text-[9px] font-semibold tracking-wide text-primary">YOUR THOUGHTS, OUR NEIGHBORHOOD</p><div className="flex items-start justify-between"><h1 className="text-[24px] font-bold leading-[1.3] tracking-tight">동네의 다음 아이디어</h1><span className="mt-1 rounded-full bg-muted px-2.5 py-1.5 text-[11px] text-muted-foreground">월계1동</span></div><p className="mt-2 text-[11px] leading-5 text-muted-foreground">가볍게 넘기고, 생각을 더하고, 동네 혜택을 모아요.</p></div>
  <div className="mb-4 flex items-center justify-between rounded-xl bg-[var(--brand-soft)] px-3 py-3 text-[11px]"><span className="flex items-center gap-1.5 font-semibold text-primary"><Coins className="size-4"/>반응 10C · 이유까지 30C</span><span className="text-muted-foreground">긍정·부정 보상 동일</span></div>
  <div role="status" aria-live="polite" className={notice?"mb-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary":"sr-only"}>{notice||`내 잔액 ${balance}C`}</div>
  {!initial.enabled?<div className="rounded-3xl border border-border p-8 text-center"><h2 className="font-semibold">크레딧 체험 준비 중</h2><p className="mt-3 text-sm text-muted-foreground">시연 모드가 활성화되면 아이디어를 넘겨볼 수 있어요.</p></div>:card?<>
   <div className="relative mb-5 pt-1"><div className="pointer-events-none absolute inset-x-3 bottom-[-7px] top-3 rounded-[28px] border border-[var(--brand-paper-border)] bg-[var(--brand-paper)]"/>
    <article tabIndex={0} aria-label={`${card.title}, 왼쪽은 패스, 오른쪽은 관심`} className="swipe-card relative touch-pan-y rounded-[28px] border border-[var(--brand-paper-border)] bg-[var(--brand-paper)] p-6 outline-offset-4" style={{transform:`translateX(${dx}px) rotate(${dx/22}deg)`}} onKeyDown={e=>{if(e.key==="ArrowLeft"){e.preventDefault();choose("LEFT");}if(e.key==="ArrowRight"){e.preventDefault();choose("RIGHT");}}}
     onPointerDown={e=>{if((e.target as HTMLElement).closest("a,button")||pending||choice)return;pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}}
     onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const delta=e.clientX-p.x;if(Math.abs(e.clientY-p.y)>Math.abs(delta)+15){pointer.current=null;setDx(0);return;}setDx(Math.max(-150,Math.min(150,delta)));}}
     onPointerUp={e=>{const p=pointer.current;pointer.current=null;setDx(0);if(p&&Math.abs(e.clientX-p.x)>75&&Math.abs(e.clientX-p.x)>Math.abs(e.clientY-p.y))choose(e.clientX>p.x?"RIGHT":"LEFT");}} onPointerCancel={()=>{pointer.current=null;setDx(0);}}>
     {Math.abs(dx)>25&&<span className={`absolute right-5 top-20 z-10 -rotate-12 rounded-lg border-2 bg-background px-4 py-2 text-xl font-black ${dx>0?"border-primary text-primary":"border-muted-foreground text-muted-foreground"}`}>{dx>0?"관심 있어요":"이번엔 패스"}</span>}
     <div className="flex items-center justify-between"><span className="flex items-center gap-1 text-xs font-medium text-primary"><MapPin className="size-3.5"/>{card.place||"월계1동"}</span><span className="rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">{card.isSeed?"시연 아이디어":"주민 제안"}</span></div>
     <div className="my-4 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="size-5"/></div>
     <h2 className="mb-4 text-[26px] font-bold leading-[1.25] tracking-tight">{card.title}</h2><p className="text-[14px] leading-7 text-foreground/80">{card.body}</p>
     <div className="mt-6 border-t border-[var(--brand-paper-border)] pt-4"><p className="mb-1 text-[10px] font-bold text-primary">이런 이웃과 함께하고 싶어요</p><p className="text-xs leading-5 text-muted-foreground">{card.target||"아이디어에 생각을 보태고 싶은 이웃"}</p>{card.effect&&<p className="mt-3 text-xs leading-5">{card.effect}</p>}</div>
     <div className="mt-5 flex items-center justify-between text-[10px] text-muted-foreground"><span>{card.proposerName}</span><Link href={`/cards/${card.id}`} className="inline-flex min-h-10 items-center gap-1 font-semibold text-primary">자세히 보기<ArrowRight className="size-3"/></Link></div>
    </article>
   </div>
   <div className="flex items-center justify-center gap-10"><div className="text-center"><button disabled={pending} onClick={()=>choose("LEFT")} aria-label="이번엔 패스, 이유 선택하기" className="mx-auto flex size-[62px] items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-transform active:scale-95"><X className="size-7"/></button><p className="mt-2 text-[11px] text-muted-foreground">이번엔 패스</p></div><div className="text-center"><button disabled={pending} onClick={()=>choose("RIGHT")} aria-label="관심 있어요, 이유 선택하기" className="mx-auto flex size-[72px] items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_20px_-8px_rgba(181,75,37,0.5)] transition-transform active:scale-95"><Heart className="size-7"/></button><p className="mt-2 text-[11px] font-semibold text-primary">관심 있어요</p></div></div>
   <p className="mt-5 text-center text-[10px] text-muted-foreground">← 패스 · 관심 → <span className="mx-2">/</span>남은 아이디어 {cards.length}개</p>
  </>:<div className="rounded-[28px] border border-[var(--brand-paper-border)] bg-[var(--brand-paper)] px-6 py-10 text-center"><div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="size-8"/></div><h2 className="text-xl font-bold">오늘의 생각을 다 남겼어요</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">새 아이디어는 참여 예산이 준비되면 나타나요.<br/>모은 크레딧으로 동네 혜택을 만나보세요.</p><Button asChild className="mt-6 w-full"><Link href="/rewards">동네 혜택 보러 가기<ArrowRight/></Link></Button><Button variant="outline" className="mt-3 w-full" disabled={pending} onClick={samples}><RotateCcw className="size-4"/>시연 아이디어 준비</Button><p className="mt-3 text-[10px] leading-5 text-muted-foreground">가상 카드 3개를 준비합니다. 이미 참여한 카드는 다시 보상하지 않아요.</p></div>}
  {error&&!choice&&<p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
  <dialog ref={dialog} className="credit-sheet w-[calc(100%-24px)] max-w-[456px] rounded-t-[28px] rounded-b-xl bg-background p-5 text-foreground" onCancel={e=>{if(pending)e.preventDefault();else setChoice(null);}} aria-labelledby="reason-title">
   <div className="mb-5 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-primary">{choice==="RIGHT"?<Heart className="size-4"/>:<X className="size-4"/>}{choice==="RIGHT"?"관심 있어요":"이번엔 패스"}</span><button onClick={()=>setChoice(null)} disabled={pending} aria-label="선택 취소" className="flex size-11 items-center justify-center rounded-full bg-muted"><X className="size-4"/></button></div>
   <h2 id="reason-title" className="text-xl font-bold">이유를 더해주실래요?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">이유는 선택이에요. 구체적인 생각을 남기면<br/><strong className="text-primary">20C를 더 받아 총 30C</strong>를 모을 수 있어요.</p>
   <label htmlFor="swipe-reason" className="mb-2 mt-5 block text-xs font-semibold">{choice==="RIGHT"?"어떤 점이 마음에 들었나요?":"어떤 점이 아쉬웠나요?"}</label><Textarea id="swipe-reason" value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} disabled={pending} rows={4} placeholder={choice==="RIGHT"?"이용하고 싶은 이유나 기대하는 점을 적어 주세요.":"이용하기 어려운 이유나 바뀌었으면 하는 점을 적어 주세요."}/><p className="mt-2 text-[10px] text-muted-foreground">공백 제외 10자 이상 · {reason.length}/500 · 개인정보는 적지 마세요.</p>
   {error&&<div className="mt-3"><p role="alert" className="text-xs text-destructive">{error}</p><button className="mt-2 min-h-10 text-xs font-semibold text-primary" disabled={pending} onClick={()=>{setCards(c=>c.filter(x=>x.id!==card?.id));setChoice(null);setError("");}}>이 카드는 건너뛰기 · 보상 없음</button></div>}
   <Button disabled={!valid||pending} onClick={()=>submit(true)} className="mt-5 w-full"><MessageCircle className="size-4"/>{pending?"저장 중…":"이유와 함께 남기기 · +30C"}</Button><Button disabled={pending} variant="ghost" onClick={()=>submit(false)} className="mt-2 w-full">이유 없이 남기기 · +10C</Button>
  </dialog>
 </div>;
}
