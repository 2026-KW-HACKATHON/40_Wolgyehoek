"use client";
import Link from "next/link";
import {useEffect,useRef,useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {ChevronRight,Heart,Info,MapPin,PartyPopper,RotateCcw,X} from "lucide-react";
import type {Deck,SwipeCard} from "@/lib/credits";
import {prepareSamples,swipeIdea} from "@/app/credit-actions";
import {Button} from "./ui/Button";
import {Textarea} from "./ui/Textarea";
import {BrandMark} from "./BrandMark";
import {CardBackdrop} from "./CardMedia";
import {cn} from "@/lib/utils";
import {cardSurface} from "@/lib/surface";
import {TOPICS,topicLabel,type Topic} from "@/lib/domain/types";

function Progress({card}:{card:SwipeCard}){
 if(card.succeededAt) return <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-extrabold text-primary"><PartyPopper className="size-4"/>성사 · {card.pledges}명 함께</p>;
 const pct=Math.min(100,Math.round(card.pledges/Math.max(1,card.goal)*100));
 return <div className="mb-3">
  <div className="flex items-baseline justify-between text-[13px] font-bold"><span>성사까지 {Math.max(0,card.goal-card.pledges)}명</span><span className="tnum text-white/70">{card.pledges}/{card.goal}</span></div>
  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white transition-[width] duration-500" style={{width:`${pct}%`}}/></div>
 </div>;
}

function CardFront({card,index=0,onPick,playing=true}:{card:SwipeCard;index?:number;onPick?:(i:number)=>void;playing?:boolean}){
 const media=card.media??[];
 return <>
  <CardBackdrop cardId={card.id} media={media[index]} playing={playing}/>
  {media.length>0&&<div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[rgb(74_24_4/.35)] to-transparent"/>}
  {media.length>1&&<div className="absolute inset-x-3 top-1 z-10 flex gap-1">{media.map((m,i)=><button key={m.id} type="button" tabIndex={onPick?0:-1} aria-label={`${i+1}번째 사진·영상`} aria-pressed={i===index} onClick={()=>onPick?.(i)} className="flex-1 py-2"><span className={cn("block h-1 rounded-full transition-colors",i===index?"bg-white":"bg-white/40")}/></button>)}</div>}
  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 card-scrim"/>
  <div className="absolute inset-x-0 bottom-0 p-6 pr-16 text-white">
   <Progress card={card}/>
   <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-white/90">{topicLabel(card.topic)&&<span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur">{topicLabel(card.topic)}</span>}<span className="flex items-center gap-1"><MapPin className="size-4"/>{card.place||"월계1동"}</span></p>
   {card.problem&&<p className="mb-2 text-[16px] font-semibold leading-snug text-white/90 [text-wrap:balance]">“{card.problem}”</p>}
   <h2 className="text-[30px] font-extrabold leading-[1.18] tracking-[-0.04em] [text-wrap:balance]">{card.problem&&<span aria-hidden="true" className="mr-1.5 text-white/60">→</span>}{card.title}</h2>
   {!card.problem&&<p className="mt-2.5 line-clamp-2 text-[15px] leading-6 text-white/85">{card.body}</p>}
  </div>
 </>;
}

function CardBack({card,onFlip}:{card:SwipeCard;onFlip:()=>void}){
 const rows=[["문제",card.problem],["분야",topicLabel(card.topic)],["목표",card.succeededAt?`성사 · ${card.pledges}명 함께`:`${card.goal}명 중 ${card.pledges}명 모임`],["대상",card.target],["장소",card.place],["기대 효과",card.effect],["제안",card.proposerName]].filter(([,v])=>v);
 return <div className="absolute inset-0 flex flex-col bg-[var(--card-back)] text-white">
  <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 opacity-60" style={{background:cardSurface(card.id),maskImage:"linear-gradient(to bottom,black,transparent)"}}/>
  <div className="relative flex min-h-0 flex-1 flex-col p-6">
   <div className="flex items-start gap-3"><h2 className="flex-1 text-[24px] font-extrabold leading-[1.25] tracking-[-0.04em]">{card.title}</h2><button type="button" onClick={onFlip} aria-label="앞면 보기" className="-mr-2 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"><RotateCcw className="size-[18px]"/></button></div>
   <p className="mt-4 min-h-0 flex-1 overflow-y-auto whitespace-pre-line text-[15px] leading-7 text-white/85">{card.body}</p>
   <dl className="mt-4 divide-y divide-white/10 border-t border-white/10 text-sm">{rows.map(([k,v])=><div key={k} className="flex gap-4 py-2.5"><dt className="w-16 shrink-0 text-white/50">{k}</dt><dd className="min-w-0 flex-1 font-medium">{v}</dd></div>)}</dl>
   <Link href={`/cards/${card.id}`} className="mt-4 flex h-12 items-center justify-center gap-1 rounded-full bg-white text-[15px] font-bold text-foreground">자세히 보기<ChevronRight className="size-4"/></Link>
  </div>
 </div>;
}

export function SwipeDeck({initial,requestedUnavailable=false}:{initial:Deck;requestedUnavailable?:boolean}){
 const [cards,setCards]=useState(initial.cards);const [balance,setBalance]=useState(initial.balance);const [choice,setChoice]=useState<"RIGHT"|"LEFT"|null>(null);
 const [reason,setReason]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState(requestedUnavailable?"이미 참여했거나 마감된 카드예요":"");const [dx,setDx]=useState(0);const [dragging,setDragging]=useState(false);const [pending,start]=useTransition();
 const [topic,setTopic]=useState<Topic|"ALL">("ALL");
 const [flippedId,setFlippedId]=useState<string|null>(null);const [celebrate,setCelebrate]=useState<{title:string;goal:number}|null>(null);const [mediaPos,setMediaPos]=useState<{id:string;i:number}|null>(null);
 const pointer=useRef<{id:number;x:number;y:number}|null>(null);const dialog=useRef<HTMLDialogElement>(null);const router=useRouter();const shown=topic==="ALL"?cards:cards.filter(c=>c.topic===topic);const card=shown[0];const next=shown[1];
 const present=(Object.keys(TOPICS) as Topic[]).filter(t=>cards.some(c=>c.topic===t));
 const flipped=!!card&&flippedId===card.id;const mediaIndex=card&&mediaPos?.id===card.id?mediaPos.i:0;
 function flip(){if(card)setFlippedId(f=>f===card.id?null:card.id);}
 useEffect(()=>{if(choice&&!dialog.current?.open)dialog.current?.showModal();else if(!choice&&dialog.current?.open)dialog.current.close();},[choice]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(""),2600);return()=>clearTimeout(t);},[notice]);
 function choose(direction:"RIGHT"|"LEFT"){if(!card||pending)return;setDx(0);setChoice(direction);setReason("");setError("");}
 function submit(withReason:boolean){if(!card||!choice)return;setError("");start(async()=>{const r=await swipeIdea(card.id,choice,withReason?reason:"");if(!r.ok){setError(r.error);return;}setCards(c=>c.filter(x=>x.id!==card.id));setBalance(r.data.balance);setNotice(r.data.duplicate?"이미 반영된 카드예요":r.data.reward>0?`+${r.data.reward}P`:choice==="RIGHT"?"함께해요":"패스");setChoice(null);if(r.data.succeeded)setCelebrate({title:card.title,goal:r.data.goal??card.goal});router.refresh();});}
 function samples(){setError("");start(async()=>{const r=await prepareSamples();if(!r.ok){setError(r.error);return;}setCards(r.data.cards);setBalance(r.data.balance);router.refresh();});}
 function release(){pointer.current=null;setDragging(false);setDx(0);}
 const valid=reason.replace(/\s/g,"").length>=10&&reason.length<=500;
 const lean=Math.min(1,Math.abs(dx)/90);
 return <div className="px-3 pt-1">
  {present.length>0&&<div role="tablist" aria-label="동네 문제 분야" className="-mx-3 mb-2.5 flex gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none]">{(["ALL",...present] as const).map(t=><button key={t} type="button" role="tab" aria-selected={topic===t} onClick={()=>setTopic(t)} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors",topic===t?"bg-foreground text-background":"bg-muted text-muted-foreground hover:bg-[var(--muted-hover)]")}>{t==="ALL"?"전체":TOPICS[t]}</button>)}</div>}
  <div className="swipe-stage relative">
   <div role="status" aria-live="polite" className={notice?"absolute left-1/2 top-4 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-4 py-2 text-sm font-bold text-white backdrop-blur":"sr-only"}>{notice||(initial.enabled?`기록 포인트 ${balance}P`:"")}</div>
   {card?<>
    {next&&<div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[22px] transition-transform duration-200" style={{transform:`scale(${0.94+lean*0.06}) translateY(${(1-lean)*14}px)`}}><CardFront card={next} playing={false}/></div>}
    <article tabIndex={0} aria-label={`${card.title}, 왼쪽은 패스, 오른쪽은 함께해요, 엔터는 뒤집기`} className={cn("swipe-card absolute inset-0 rounded-[22px] shadow-float outline-offset-4 perspective-[1400px]",!dragging&&"transition-transform duration-300 ease-out")} style={{transform:`translateX(${dx}px) rotate(${dx/18}deg)`}} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==="ArrowLeft"){e.preventDefault();choose("LEFT");}if(e.key==="ArrowRight"){e.preventDefault();choose("RIGHT");}if(e.key==="Enter"||e.key===" "){e.preventDefault();flip();}}}
     onPointerDown={e=>{if((e.target as HTMLElement).closest("a,button")||pending||choice)return;pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);}}
     onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const delta=e.clientX-p.x;if(Math.abs(e.clientY-p.y)>Math.abs(delta)+15){release();return;}setDx(Math.max(-160,Math.min(160,delta)));}}
     onPointerUp={e=>{const p=pointer.current;release();if(!p)return;if(Math.hypot(e.clientX-p.x,e.clientY-p.y)<6){flip();return;}if(Math.abs(e.clientX-p.x)>75&&Math.abs(e.clientX-p.x)>Math.abs(e.clientY-p.y))choose(e.clientX>p.x?"RIGHT":"LEFT");}} onPointerCancel={release}>
     <div className={cn("relative size-full transform-3d transition-transform duration-500 ease-in-out motion-reduce:transition-none",flipped&&"rotate-y-180")}>
      <div aria-hidden={flipped} className={cn("flip-face absolute inset-0 overflow-hidden rounded-[22px] backface-hidden",flipped&&"invisible")}>
       <CardFront card={card} index={mediaIndex} onPick={i=>setMediaPos({id:card.id,i})}/>
       <span aria-hidden="true" className="absolute left-6 top-8 z-10 -rotate-[18deg] rounded-xl border-[5px] bg-white border-[var(--like)] px-3 py-1 text-[34px] font-black tracking-tight text-[var(--like)]" style={{opacity:dx>0?lean:0}}>함께</span>
       <span aria-hidden="true" className="absolute right-6 top-8 z-10 rotate-[18deg] rounded-xl border-[5px] bg-white border-[var(--nope)] px-3 py-1 text-[34px] font-black tracking-tight text-[var(--nope)]" style={{opacity:dx<0?lean:0}}>패스</span>
       <button type="button" onClick={flip} tabIndex={flipped?-1:0} aria-label="뒷면 보기" className="absolute bottom-6 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30"><Info className="size-5"/></button>
      </div>
      <div aria-hidden={!flipped} inert={!flipped} className={cn("flip-face absolute inset-0 overflow-hidden rounded-[22px] backface-hidden rotate-y-180",!flipped&&"invisible")}>
       <CardBack card={card} onFlip={flip}/>
      </div>
     </div>
    </article>
   </>:topic!=="ALL"&&cards.length?<div className="flex h-full flex-col items-center justify-center gap-5 text-center"><h2 className="text-xl font-extrabold tracking-tight">이 분야는 다 봤어요</h2><Button variant="soft" size="lg" onClick={()=>setTopic("ALL")}>전체 보기</Button></div>:<div className="flex h-full flex-col items-center justify-center text-center">
    <div className="relative mb-8 flex size-28 items-center justify-center"><span aria-hidden="true" className="pulse-ring absolute inset-0 rounded-full bg-primary/30 motion-reduce:hidden"/><span className="bg-brand relative flex size-24 items-center justify-center rounded-full text-white shadow-float"><BrandMark className="size-11"/></span></div>
    <h2 className="text-xl font-extrabold tracking-tight">새 카드가 없어요</h2>
    <div className="mt-7 flex w-full max-w-[280px] flex-col gap-2"><Button asChild size="lg"><Link href="/">서랍 보기</Link></Button><Button variant="soft" size="lg" disabled={pending} onClick={samples}><RotateCcw/>시연 카드 받기</Button></div>
   </div>}
  </div>
  {card&&<div className="mt-5 flex items-center justify-center gap-7">
   <button disabled={pending} onClick={()=>choose("LEFT")} aria-label="패스" className="flex size-16 items-center justify-center rounded-full border border-border bg-background text-[var(--nope)] shadow-float transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"><X className="size-8" strokeWidth={3}/></button>
   <button disabled={pending} onClick={()=>choose("RIGHT")} aria-label="함께해요" className="flex size-16 items-center justify-center rounded-full border border-border bg-background text-[var(--like)] shadow-float transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"><Heart className="size-8 fill-current" strokeWidth={0}/></button>
  </div>}
  {error&&!choice&&<p role="alert" className="mt-4 text-center text-sm text-destructive">{error}</p>}
  <dialog ref={dialog} className="credit-sheet w-full max-w-[480px] rounded-t-[28px] bg-background px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 text-foreground" onCancel={e=>{if(pending)e.preventDefault();else setChoice(null);}} aria-labelledby="reason-title">
   <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-border"/>
   <div className="mb-5 flex items-center gap-3">
    <span className={cn("flex size-11 items-center justify-center rounded-full",choice==="RIGHT"?"bg-[var(--like)]/12 text-[var(--like)]":"bg-[var(--nope)]/12 text-[var(--nope)]")}>{choice==="RIGHT"?<Heart className="size-5 fill-current" strokeWidth={0}/>:<X className="size-5" strokeWidth={3}/>}</span>
    <h2 id="reason-title" className="flex-1 text-[22px] font-extrabold tracking-tight">{choice==="RIGHT"?"함께해요":"패스"}</h2>
    <button onClick={()=>setChoice(null)} disabled={pending} aria-label="선택 취소" className="flex size-10 items-center justify-center rounded-full bg-muted"><X className="size-4"/></button>
   </div>
   <label htmlFor="swipe-reason" className="sr-only">이유 (선택)</label>
   <Textarea id="swipe-reason" value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} disabled={pending} rows={4} className="rounded-2xl border-0 bg-muted px-4 py-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary" placeholder={choice==="RIGHT"?"어떤 조건이면 함께할까요?":"어떤 점이 아쉬웠나요?"}/>
   <p className="mt-2 text-right text-xs text-[var(--text-4)] tnum">{valid?`${reason.length}/500`:"10자 이상"}</p>
   {error&&<div className="mt-2"><p role="alert" className="text-sm text-destructive">{error}</p><button className="mt-1 min-h-10 text-sm font-semibold text-primary" disabled={pending} onClick={()=>{setCards(c=>c.filter(x=>x.id!==card?.id));setChoice(null);setError("");}}>이 카드 건너뛰기</button></div>}
   <Button size="lg" disabled={!valid||pending} onClick={()=>submit(true)} className="mt-4 w-full">{pending?"저장 중…":initial.enabled?"이유 남기기 +10P":"이유 남기기"}</Button>
   <Button variant="ghost" disabled={pending} onClick={()=>submit(false)} className="mt-1 h-12 w-full text-[15px] text-muted-foreground">이유 없이 넘기기</Button>
  </dialog>
  {celebrate&&<div role="dialog" aria-modal="true" aria-labelledby="success-title" className="bg-brand fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-8 text-center text-white">
   {Array.from({length:18},(_,i)=><span key={i} aria-hidden="true" className="confetti absolute top-0 block h-3 w-2 rounded-sm" style={{left:`${(i*53)%100}%`,background:["#fff","#ffe2d2","#ffc39e","#212124"][i%4],animationDelay:`${(i*0.17)%1.6}s`}}/>)}
   <PartyPopper aria-hidden="true" className="pop-in size-14"/>
   <h2 id="success-title" className="pop-in mt-4 text-[64px] font-black leading-none tracking-[-0.05em]">성사!</h2>
   <p className="mt-5 text-xl font-extrabold [text-wrap:balance]">{celebrate.title}</p>
   <p className="mt-2 text-[15px] text-white/85">{celebrate.goal}명이 모였어요. 일정이 정해지면 알려드릴게요.</p>
   <Button autoFocus onClick={()=>setCelebrate(null)} size="lg" className="mt-10 w-full max-w-[280px] bg-none bg-white text-primary hover:bg-white/90">계속 둘러보기</Button>
  </div>}
 </div>;
}
