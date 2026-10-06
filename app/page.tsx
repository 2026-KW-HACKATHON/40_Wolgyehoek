import { listCards } from "@/lib/queries";
import { CardItem } from "@/components/card-item";
import { ButtonLink } from "@/components/ui";
import { CardFilters } from "@/components/CardFilters";
import { HomeOverview } from "@/components/HomeOverview";
import { Archive, MapPin } from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === "open" || sp.tab === "done" ? sp.tab : "all";
  const q = sp.q ?? "";
  const allCards = await listCards({ tab: "all" });
  const cards = tab === "all" && !q ? allCards : await listCards({ tab, q });
  const filtered = q.length > 0 || tab !== "all";
  return <div className="mx-auto max-w-[1280px] space-y-7 px-4 py-5 sm:px-7 sm:py-7 lg:px-9 lg:py-8">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><p className="flex items-center gap-1.5 font-medium text-muted-foreground"><MapPin className="size-3.5 text-primary" />월계1동 · 청년과 지역의 연결</p><span className="text-muted-foreground">생각을 모으고, 변화를 기록해요.</span></div>
    {!filtered && <HomeOverview cards={allCards} />}
    <section id="ideas" aria-labelledby="ideas-title" className="scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-medium text-primary">우리 동네의 아이디어</p>{filtered ? <h1 id="ideas-title" className="text-[26px] font-semibold tracking-tight">{q ? `“${q}” 검색 결과` : tab === "open" ? "지금 검증 중인 아이디어" : "결론이 남은 기록"}</h1> : <h2 id="ideas-title" className="text-[26px] font-semibold tracking-tight">어떤 생각에 함께해 볼까요?</h2>}<p className="mt-2 text-sm text-muted-foreground">{filtered ? "검색어와 상태로 원하는 기록을 찾아보세요." : "이웃의 제안에 반응을 남기거나, 지난 기록을 둘러보세요."}</p></div><span className="text-xs text-muted-foreground">{cards.length}개 아이디어 · 최신순</span></div>
      <div className="mb-6 border-y border-border/70 py-2"><CardFilters tab={tab} q={q} /></div>
      {cards.length ? <div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">{cards.map(s => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-16 text-center"><Archive className="size-9 text-primary/60" /><h2 className="text-lg font-semibold">{q ? "아직 맞는 아이디어가 없어요" : "새로운 이야기를 기다리고 있어요"}</h2><p className="max-w-sm text-sm leading-6 text-muted-foreground">{q ? "다른 검색어나 상태로 찾아보거나, 나만의 아이디어를 남겨 보세요." : "우리 동네에서 함께 해보고 싶은 일이 있나요? 첫 아이디어를 남겨 주세요."}</p><ButtonLink href={filtered ? "/" : "/new"} variant="secondary">{filtered ? "전체 아이디어 보기" : "아이디어 올리기"}</ButtonLink></div>}
    </section>
  </div>;
}
