import { PageHeaderBar } from "@/components/PageHeaderBar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { currentDevice } from "@/lib/device";
import { myActivity } from "@/lib/queries";
import { DECISION_LABELS, type Decision } from "@/lib/domain/types";
import { markNoticesRead } from "@/app/actions";
import { CardItem } from "@/components/card-item";
import { SectionTitle, fmtDate } from "@/components/ui";
import { NicknameForm } from "./nickname-form";

export default async function MePage() {
  const me = await currentDevice();
  if (!me) return <p className="text-ink-2">새로고침 후 다시 시도해 주세요.</p>;
  const a = await myActivity();
  const cardById = new Map([...a.mine, ...a.joined].map((s) => [s.card.id, s]));
  const unread = a.notices.filter((n) => !n.readAt);
  return (
    <div className="mx-auto max-w-[800px] space-y-8 px-4 py-6 sm:px-8">
      <div>

        <PageHeaderBar title="내 참여" className="-mx-4 sm:-mx-8" />
        <p className="mt-2 text-sm text-ink-2">로그인 없이 이 기기로 참여한 기록이에요.</p>
        <div className="mt-4"><NicknameForm nickname={me.nickname} /></div>
      </div>

      <section>
        <SectionTitle sub={unread.length ? <form action={markNoticesRead}><Button type="submit" className="text-sm underline">모두 읽음</Button></form> : null}>알림</SectionTitle>
        {a.notices.length === 0 ? (
          <p className="rounded-lg bg-subtle px-4 py-6 text-center text-sm text-ink-3 ring-line">아직 받은 알림이 없어요. 결론이 나면 여기에 도착해요.</p>
        ) : (
          <ul className="space-y-2">
            {a.notices.map((n) => {
              const s = cardById.get(n.cardId);
              return (
                <li key={n.id} className={`ring-card flex items-center gap-3 rounded-lg bg-white p-4 ${n.readAt ? "" : "shadow-[0_0_0_2px_var(--step-4)]"}`}>
                  <span className="text-sm">
                    {n.kind === "conclusion" ? "결론이 도착했어요 · " : "보류됐던 아이디어가 다시 시작됐어요 · "}
                    <Link href={`/cards/${n.cardId}`} className="font-medium underline">{n.cardTitle}</Link>
                    {n.kind === "conclusion" && s?.latest && <> — {DECISION_LABELS[s.latest.decision as Decision]}</>}
                  </span>
                  <span className="tnum ml-auto shrink-0 whitespace-nowrap font-mono text-[12px] text-ink-3">{fmtDate(n.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle sub={`${a.joined.length}개`}>참여한 카드</SectionTitle>
        <div className="grid gap-3">{a.joined.map((s) => <CardItem key={s.card.id} s={s} />)}</div>
      </section>
      <section>
        <SectionTitle sub={`${a.mine.length}개`}>내가 올린 카드</SectionTitle>
        <div className="grid gap-3">{a.mine.map((s) => <CardItem key={s.card.id} s={s} />)}</div>
      </section>
      <p className="text-xs text-ink-3"><Link href="/admin" className="underline">운영자 모드</Link></p>
    </div>
  );
}
