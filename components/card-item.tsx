import Link from "next/link";
import type { CardSummary } from "@/lib/queries";
import { DECISION_LABELS, type Decision } from "@/lib/domain/types";
import { Pill, StatusBadge, fmtDate } from "./ui";

export function CardItem({ s }: { s: CardSummary }) {
  const { card } = s;
  return (
    <Link href={`/cards/${card.id}`} className="ring-card group block rounded-lg bg-white p-5 transition-shadow hover:shadow-[0_0_0_1px_rgba(0,0,0,0.14),0_4px_8px_rgba(0,0,0,0.06)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={s.status} />
        {card.isSeed && <Pill>예시 · 과거 공개 아이디어</Pill>}
        {card.parentId && <Pill>이어받은 카드</Pill>}
      </div>
      <h3 className="text-lg font-semibold tracking-[-0.01em] group-hover:underline">{card.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-2">{card.body}</p>
      {s.latest && (
        <p className="mt-2 line-clamp-1 text-sm text-ink-2">
          <span className="font-medium text-ink">{DECISION_LABELS[s.latest.decision as Decision]}</span>
          {" · "}
          {s.latest.reasonTags.length > 0 ? s.latest.reasonTags.join(", ") : s.latest.reason || "결론 기록됨"}
        </p>
      )}
      <div className="tnum mt-4 flex items-center gap-3 font-mono text-[12px] text-ink-3">
        <span>반응 {s.reactionCount}</span>
        <span>의견 {s.opinionCount}</span>
        <span className="ml-auto">{card.place || "월계1동"} · ~{fmtDate(card.endsAt)}</span>
      </div>
    </Link>
  );
}
