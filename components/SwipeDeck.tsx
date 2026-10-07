"use client";
import Link from "next/link";
import {useEffect,useRef,useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {Heart,Info,MapPin,RotateCcw,Users,X} from "lucide-react";
import type {Deck,SwipeCard} from "@/lib/credits";
import {prepareSamples,swipeIdea} from "@/app/credit-actions";
import {Button} from "./ui/Button";
import {Textarea} from "./ui/Textarea";
import {BrandMark} from "./BrandMark";
import {CardBackdrop} from "./CardMedia";
import {cn} from "@/lib/utils";

function CardFront({card,index=0,onPick,playing=true}:{card:SwipeCard;index?:number;onPick?:(i:number)=>void;playing?:boolean}){
 const media=card.media??[];
 return <>
  <CardBackdrop cardId={card.id} media={media[index]} playing={playing}/>
  {media.length>0&&<div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent"/>}
  {media.length>1&&<div className="absolute inset-x-3 top-1 z-10 flex gap-1">{media.map((m,i)=><button key={m.id} type="button" tabIndex={onPick?0:-1} aria-label={`${i+1}번째 사진·영상`} aria-pressed={i===index} onClick={()=>onPick?.(i)} className="flex-1 py-2"><span className={cn("block h-1 rounded-full transition-colors",i===index?"bg-white":"bg-white/40")}/></button>)}</div>}
  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent"/>
  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
   <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-white/90"><MapPin className="size-4"/>{card.place||"월계1동"}</p>
   <h2 className="text-[30px] font-extrabold leading-[1.18] tracking-[-0.04em] [text-wrap:balance]">{card.title}</h2>
   <p className="mt-2.5 line-clamp-3 text-[15px] leading-6 text-white/85">{card.body}</p>
   {card.target&&<p className="mt-3 flex items-center gap-1.5 text-[13px] text-white/75"><Users className="size-4 shrink-0"/><span className="line-clamp-1">{card.target}</span></p>}
  </div>
 </>;
}

export function SwipeDeck({initial,requestedUnavailable=false}:{initial:Deck;requestedUnavailable?:boolean}){
 const [cards,setCards]=useState(initial.cards);const [balance,setBalance]=useState(initial.balance);const [choice,setChoice]=useState<"RIGHT"|"LEFT"|null>(null);
 const [reason,setReason]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState(requestedUnavailable?"이미 참여했거나 마감된 카드예요":"");const [dx,setDx]=useState(0);const [dragging,setDragging]=useState(false);const [pending,start]=useTransition();
 const [mediaPos,setMediaPos]=useState<{id:string;i:number}|null>(null);
 const pointer=useRef<{id:number;x:number;y:number}|null>(null);const dialog=useRef<HTMLDialogElement>(null);const router=useRouter();const card=cards[0];const next=cards[1];const mediaIndex=card&&mediaPos?.id===card.id?mediaPos.i:0;
 useEffect(()=>{if(choice&&!dialog.current?.open)dialog.current?.showModal();else if(!choice&&dialog.current?.open)dialog.current.close();},[choice]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(""),2600);return()=>clearTimeout(t);},[notice]);
 function choose(direction:"RIGHT"|"LEFT"){if(!card||pending)return;setDx(0);setChoice(direction);setReason("");setError("");}
 function submit(withReason:boolean){if(!card||!choice)return;setError("");start(async()=>{const r=await swipeIdea(card.id,choice,withReason?reason:"");if(!r.ok){setError(r.error);return;}setCards(c=>c.filter(x=>x.id!==card.id));setBalance(r.data.balance);setNotice(r.data.duplicate?"이미 반영된 카드예요":`+${r.data.reward}C`);setChoice(null);router.refresh();});}
 function samples(){setError("");start(async()=>{const r=await prepareSamples();if(!r.ok){setError(r.error);return;}setCards(r.data.cards);setBalance(r.data.balance);router.refresh();});}
 function release(){pointer.current=null;setDragging(false);setDx(0);}
 const valid=reason.replace(/\s/g,"").length>=10&&reason.length<=500;
 const lean=Math.min(1,Math.abs(dx)/90);
 return <div className="px-3 pt-1">
  <div className="swipe-stage relative">
   <div role="status" aria-live="polite" className={notice?"absolute left-1/2 top-4 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-4 py-2 text-sm font-bold text-white backdrop-blur":"sr-only"}>{notice||`내 잔액 ${balance}C`}</div>
   {!initial.enabled?<div className="flex h-full flex-col items-center justify-center text-center"><p className="text-lg font-bold">준비 중이에요</p></div>:card?<>
    {next&&<div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[22px] transition-transform duration-200" style={{transform:`scale(${0.94+lean*0.06}) translateY(${(1-lean)*14}px)`}}><CardFront card={next} playing={false}/></div>}
    <article tabIndex={0} aria-label={`${card.title}, 왼쪽은 패스, 오른쪽은 관심`} className={cn("swipe-card absolute inset-0 overflow-hidden rounded-[22px] shadow-float outline-offset-4",!dragging&&"transition-transform duration-300 ease-out")} style={{transform:`translateX(${dx}px) rotate(${dx/18}deg)`}} onKeyDown={e=>{if(e.key==="ArrowLeft"){e.preventDefault();choose("LEFT");}if(e.key==="ArrowRight"){e.preventDefault();choose("RIGHT");}}}
     onPointerDown={e=>{if((e.target as HTMLElement).closest("a,button")||pending||choice)return;pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);}}
     onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const delta=e.clientX-p.x;if(Math.abs(e.clientY-p.y)>Math.abs(delta)+15){release();return;}setDx(Math.max(-160,Math.min(160,delta)));}}
     onPointerUp={e=>{const p=pointer.current;release();if(p&&Math.abs(e.clientX-p.x)>75&&Math.abs(e.clientX-p.x)>Math.abs(e.clientY-p.y))choose(e.clientX>p.x?"RIGHT":"LEFT");}} onPointerCancel={release}>
     <CardFront card={card} index={mediaIndex} onPick={i=>setMediaPos({id:card.id,i})}/>
     <span aria-hidden="true" className="absolute left-6 top-8 z-10 -rotate-[18deg] rounded-xl border-[5px] border-[var(--like)] px-3 py-1 text-[34px] font-black tracking-tight text-[var(--like)]" style={{opacity:dx>0?lean:0}}>관심</span>
     <span aria-hidden="true" className="absolute right-6 top-8 z-10 rotate-[18deg] rounded-xl border-[5px] border-[var(--nope)] px-3 py-1 text-[34px] font-black tracking-tight text-[var(--nope)]" style={{opacity:dx<0?lean:0}}>패스</span>
     <Link href={`/cards/${card.id}`} aria-label="자세히 보기" className="absolute bottom-6 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30"><Info className="size-5"/></Link>
    </article>
   </>:<div className="flex h-full flex-col items-center justify-center text-center">
    <div className="relative mb-8 flex size-28 items-center justify-center"><span aria-hidden="true" className="pulse-ring absolute inset-0 rounded-full bg-primary/30 motion-reduce:hidden"/><span className="bg-brand relative flex size-24 items-center justify-center rounded-full text-white shadow-float"><BrandMark className="size-11"/></span></div>
    <h2 className="text-xl font-extrabold tracking-tight">새 카드가 없어요</h2>
    <div className="mt-7 flex w-full max-w-[280px] flex-col gap-2"><Button asChild size="lg"><Link href="/rewards">혜택 보기</Link></Button><Button variant="soft" size="lg" disabled={pending} onClick={samples}><RotateCcw/>시연 카드 받기</Button></div>
   </div>}
  </div>
  {initial.enabled&&card&&<div className="mt-5 flex items-center justify-center gap-7">
   <button disabled={pending} onClick={()=>choose("LEFT")} aria-label="패스" className="flex size-16 items-center justify-center rounded-full border border-border bg-background text-[var(--nope)] shadow-float transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"><X className="size-8" strokeWidth={3}/></button>
   <button disabled={pending} onClick={()=>choose("RIGHT")} aria-label="관심" className="flex size-16 items-center justify-center rounded-full border border-border bg-background text-[var(--like)] shadow-float transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"><Heart className="size-8 fill-current" strokeWidth={0}/></button>
  </div>}
  {error&&!choice&&<p role="alert" className="mt-4 text-center text-sm text-destructive">{error}</p>}
  <dialog ref={dialog} className="credit-sheet w-full max-w-[480px] rounded-t-[28px] bg-background px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 text-foreground" onCancel={e=>{if(pending)e.preventDefault();else setChoice(null);}} aria-labelledby="reason-title">
   <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-border"/>
   <div className="mb-5 flex items-center gap-3">
    <span className={cn("flex size-11 items-center justify-center rounded-full",choice==="RIGHT"?"bg-[var(--like)]/12 text-[var(--like)]":"bg-[var(--nope)]/12 text-[var(--nope)]")}>{choice==="RIGHT"?<Heart className="size-5 fill-current" strokeWidth={0}/>:<X className="size-5" strokeWidth={3}/>}</span>
    <h2 id="reason-title" className="flex-1 text-[22px] font-extrabold tracking-tight">{choice==="RIGHT"?"관심":"패스"}</h2>
    <button onClick={()=>setChoice(null)} disabled={pending} aria-label="선택 취소" className="flex size-10 items-center justify-center rounded-full bg-muted"><X className="size-4"/></button>
   </div>
   <label htmlFor="swipe-reason" className="sr-only">이유 (선택)</label>
   <Textarea id="swipe-reason" value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} disabled={pending} rows={4} className="rounded-2xl border-0 bg-muted px-4 py-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary" placeholder={choice==="RIGHT"?"어떤 점이 좋았나요?":"어떤 점이 아쉬웠나요?"}/>
   <p className="mt-2 text-right text-xs text-[var(--text-4)] tnum">{valid?`${reason.length}/500`:"10자 이상"}</p>
   {error&&<div className="mt-2"><p role="alert" className="text-sm text-destructive">{error}</p><button className="mt-1 min-h-10 text-sm font-semibold text-primary" disabled={pending} onClick={()=>{setCards(c=>c.filter(x=>x.id!==card?.id));setChoice(null);setError("");}}>이 카드 건너뛰기</button></div>}
   <Button size="lg" disabled={!valid||pending} onClick={()=>submit(true)} className="mt-4 w-full">{pending?"저장 중…":"이유와 함께 +30C"}</Button>
   <Button variant="ghost" disabled={pending} onClick={()=>submit(false)} className="mt-1 h-12 w-full text-[15px] text-muted-foreground">그냥 넘기기 +10C</Button>
  </dialog>
 </div>;
}
