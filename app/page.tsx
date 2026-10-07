import {getDeck} from "@/lib/credits";
import {SwipeDeck} from "@/components/SwipeDeck";
export default async function Home({searchParams}:{searchParams:Promise<{idea?:string}>}){
 const [deck,sp]=await Promise.all([getDeck(),searchParams]);
 if(sp.idea)deck.cards.sort((a,b)=>Number(b.id===sp.idea)-Number(a.id===sp.idea));
 return <SwipeDeck initial={deck} requestedUnavailable={!!sp.idea&&!deck.cards.some(c=>c.id===sp.idea)} key={sp.idea??"discover"}/>;
}
