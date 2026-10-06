import { listCards } from "@/lib/queries";
import { CardItem } from "@/components/card-item";
import { ButtonLink, Disclaimer } from "@/components/ui";
import { PageHeaderBar } from "@/components/PageHeaderBar";
import { CardFilters } from "@/components/CardFilters";
import { Archive, ArrowRight } from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === "open" || sp.tab === "done" ? sp.tab : "all";
  const q = sp.q ?? "";
  const cards = await listCards({ tab, q });
  return <>
    <PageHeaderBar title="기록 탐색" count={cards.length} meta="월계1동 아이디어 수요 검증·기록"><CardFilters tab={tab} q={q} /></PageHeaderBar>
    <div className="mx-auto max-w-[1160px] space-y-7 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-5 rounded-lg border border-primary/15 bg-primary/[0.04] p-5 sm:flex-row sm:items-center sm:p-6">
        <div><p className="mb-2 text-xs font-semibold text-primary">작은 아이디어가 다음 시도로 이어지도록</p><h2 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">동네의 생각을 모으고,<br className="sm:hidden" /> 결론까지 함께 남겨요.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">아이디어를 올리고 주민 반응을 확인해요. 멈춘 시도의 이유도 기록하면, 다음 팀이 이어갈 수 있어요.</p></div>
        <ButtonLink href="/new">아이디어 올리기<ArrowRight className="size-4" /></ButtonLink>
      </section>
      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{q ? `“${q}” 검색 결과` : "우리 동네에 쌓이는 시도들"}</span><span>최신순</span></div>
      {cards.length ? <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{cards.map(s => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center"><Archive className="size-8 text-muted-foreground" /><h2 className="font-semibold">{q ? "검색 결과가 없어요" : "아직 등록된 카드가 없어요"}</h2><p className="text-sm text-muted-foreground">{q ? "다른 검색어나 상태를 선택해 보세요." : "첫 아이디어를 올려 주민의 생각을 들어 보세요."}</p><ButtonLink href={q ? "/" : "/new"} variant="secondary">{q ? "전체 카드 보기" : "아이디어 올리기"}</ButtonLink></div>}
      <Disclaimer />
    </div>
  </>;
}
