import { notFound } from "next/navigation";
import { getCard } from "@/lib/queries";
import { canTakeOver } from "@/lib/domain/status";
import { DECISION_LABELS, type Decision } from "@/lib/domain/types";
import { NewCardForm } from "@/app/new/new-card-form";
import { ButtonLink, StatusBadge } from "@/components/ui";

export default async function TakeoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getCard(id);
  if (!d || d.card.hidden) notFound();
  if (!canTakeOver(d.status)) {
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-20 text-center">
        <p className="text-lg font-extrabold">이어받을 수 없는 카드예요</p>
        <ButtonLink href={`/cards/${id}`} variant="secondary">돌아가기</ButtonLink>
      </div>
    );
  }
  return (
    <div className="space-y-6 px-4 pb-8 pt-2">
      <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">이어받기</h1>
      <div className="rounded-[22px] bg-muted p-5">
        <div className="flex items-center gap-2"><StatusBadge status={d.status} /><span className="truncate text-[15px] font-bold">{d.card.title}</span></div>
        {d.latest && (
          <p className="mt-2 text-sm text-muted-foreground">
            {DECISION_LABELS[d.latest.decision as Decision]}{d.latest.reasonTags.length > 0 && ` · ${d.latest.reasonTags.join(", ")}`}{d.latest.reason && ` · ${d.latest.reason}`}
          </p>
        )}
        <p className="tnum mt-2 text-xs text-[var(--text-4)]">반응 {d.reactionCount} · 의견 {d.opinions.length} 연결</p>
      </div>
      <NewCardForm parent={{ id: d.card.id, title: d.card.title, body: d.card.body, target: d.card.target, place: d.card.place, effect: d.card.effect }} />
    </div>
  );
}
