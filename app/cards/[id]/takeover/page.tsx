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
      <div className="mx-auto max-w-[800px] space-y-4 px-4 py-6 sm:px-8">
        <p className="text-ink-2">보류·중단·정체된 카드만 이어받을 수 있어요.</p>
        <ButtonLink href={`/cards/${id}`} variant="secondary">카드로 돌아가기</ButtonLink>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[800px] space-y-6 px-4 py-6 sm:px-8">
      <div>
        <p className="mb-2 font-mono text-[12px] uppercase tracking-wider text-ink-3">이전 기록과 연결</p>
        <h1 className="text-[26px] font-semibold tracking-[-0.03em]">멈춘 아이디어 이어받기</h1>
      </div>
      <div className="rounded-lg bg-subtle p-5 ring-line">
        <div className="flex items-center gap-2"><StatusBadge status={d.status} /><span className="text-sm font-medium">{d.card.title}</span></div>
        {d.latest && (
          <p className="mt-2 text-sm text-ink-2">
            {DECISION_LABELS[d.latest.decision as Decision]} · {d.latest.reasonTags.join(", ")} — {d.latest.reason}
          </p>
        )}
        <p className="tnum mt-2 font-mono text-[12px] text-ink-3">이전 반응 {d.reactionCount}건 · 의견 {d.opinions.length}건은 원본 카드에 그대로 남고, 새 카드에 연결돼요.</p>
      </div>
      <NewCardForm parent={{ id: d.card.id, title: d.card.title, body: d.card.body, target: d.card.target, place: d.card.place, effect: d.card.effect }} />
    </div>
  );
}
