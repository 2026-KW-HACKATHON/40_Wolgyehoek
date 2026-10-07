import Link from "next/link";
import { listCards } from "@/lib/queries";
import { CardItem } from "@/components/card-item";
import { SectionTitle } from "@/components/ui";
import { canTakeOver } from "@/lib/domain/status";

export default async function DrawerPage() {
  const cards = await listCards({ tab: "all" });
  const succeeded = cards.filter((s) => s.card.succeededAt);
  const shelved = cards.filter((s) => !s.card.succeededAt && s.status !== "open");
  return <div className="space-y-9 px-4 pb-8 pt-2">
    <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">서랍</h1>
    <section>
      <SectionTitle sub={succeeded.length || null}>성사된 아이디어</SectionTitle>
      {succeeded.length ? <div className="divide-y divide-border">{succeeded.map((s) => <CardItem key={s.card.id} s={s} />)}</div> : <p className="py-6 text-center text-sm text-[var(--text-4)]">아직 없어요</p>}
    </section>
    <section>
      <SectionTitle sub={shelved.length || null}>다시 꺼낼 아이디어</SectionTitle>
      {shelved.length ? <div className="divide-y divide-border">{shelved.map((s) => <div key={s.card.id} className="flex items-center gap-2">
        <div className="min-w-0 flex-1"><CardItem s={s} /></div>
        {canTakeOver(s.status) && <Link href={`/cards/${s.card.id}/takeover`} className="bg-brand shrink-0 rounded-full px-4 py-2 text-sm font-bold text-white">꺼내기</Link>}
      </div>)}</div> : <p className="py-6 text-center text-sm text-[var(--text-4)]">아직 없어요</p>}
    </section>
  </div>;
}
