import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { currentDevice } from "@/lib/device";
import { myActivity } from "@/lib/queries";
import { markNoticesRead } from "@/app/actions";
import { CardItem } from "@/components/card-item";
import { ButtonLink, SectionTitle, fmtDate } from "@/components/ui";
import { DECISION_LABELS, type Decision } from "@/lib/domain/types";
import { NicknameForm } from "./nickname-form";

export const metadata = { title: "워크스페이스 · 동네서랍" };

export default async function MePage() {
  const me = await currentDevice();
  if (!me) return <p className="mx-auto max-w-[1200px] px-8 py-10 text-muted-foreground">새로고침 후 다시 시도해 주세요.</p>;
  const a = await myActivity();
  const cardById = new Map([...a.mine, ...a.joined].map((s) => [s.card.id, s]));
  const unread = a.notices.filter((n) => !n.readAt);
  const contributions: [string, number][] = [
    ["등록한 시도", a.mine.filter((s) => !s.card.parentId).length],
    ["이어받은 시도", a.mine.filter((s) => s.card.parentId).length],
    ["반응·의견 남긴 시도", a.joined.length],
  ];

  return <div className="mx-auto grid w-full max-w-[1200px] items-start gap-10 px-8 pt-8 lg:grid-cols-[minmax(0,1fr)_380px]">
    <div className="min-w-0 space-y-10">
      <header>
        <h1 className="text-[34px] font-black tracking-[-0.04em]">워크스페이스</h1>
        <p className="mt-2 text-[17px] font-medium text-muted-foreground">우리 팀이 등록하고 이어받은 시도, 남긴 의견을 모아 봅니다.</p>
      </header>
      <section><SectionTitle sub={a.mine.length || null}>등록한 시도</SectionTitle>{a.mine.length ? <div className="divide-y divide-border">{a.mine.map((s) => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-border py-10"><p className="text-sm text-[var(--text-4)]">아직 없어요</p><ButtonLink href="/new" variant="secondary">아이디어 등록</ButtonLink></div>}</section>
      <section><SectionTitle sub={a.joined.length || null}>반응·의견 남긴 시도</SectionTitle>{a.joined.length ? <div className="divide-y divide-border">{a.joined.map((s) => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-border py-10"><p className="text-sm text-[var(--text-4)]">아직 없어요</p><ButtonLink href="/problems" variant="secondary">문제 둘러보기</ButtonLink></div>}</section>
    </div>

    <aside className="space-y-8 lg:sticky lg:top-24">
      <section className="rounded-[22px] bg-muted p-5">
        <div className="flex items-center gap-3">
          <span className="bg-brand flex size-14 items-center justify-center rounded-full text-[22px] font-black text-white">{me.nickname.slice(0, 1)}</span>
          <div className="min-w-0"><p className="truncate text-lg font-extrabold">{me.nickname}</p><p className="text-xs font-semibold text-muted-foreground">기여 이력</p></div>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2">{contributions.map(([k, v]) => <div key={k} className="rounded-2xl bg-background p-3"><dd className="tnum text-[22px] font-black leading-none">{v}</dd><dt className="mt-1.5 text-[11px] font-semibold leading-tight text-muted-foreground">{k}</dt></div>)}</dl>
      </section>

      <section>
        <SectionTitle sub={unread.length ? <form action={markNoticesRead}><Button type="submit" variant="soft" size="sm">모두 읽음</Button></form> : null}>소식</SectionTitle>
        {a.notices.length ? <ul className="divide-y divide-border">{a.notices.map((n) => { const s = cardById.get(n.cardId); return <li key={n.id} className="flex items-start gap-3 py-3">
          <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-primary"}`} />
          <div className="min-w-0 flex-1">
            <Link href={`/cards/${n.cardId}`} className="block truncate text-[15px] font-bold hover:text-primary">{n.cardTitle}</Link>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.kind === "conclusion" ? (s?.latest ? `${DECISION_LABELS[s.latest.decision as Decision]}${s.latest.reason ? ` · ${s.latest.reason}` : ""}` : "결론 도착") : n.kind === "success" ? "목표 인원이 모였어요" : n.kind === "schedule" ? (s?.card.successNote ?? "일정이 정해졌어요") : "다시 시작됨"}</p>
          </div>
          <span className="shrink-0 text-xs text-[var(--text-4)] tnum">{fmtDate(n.createdAt)}</span>
        </li>; })}</ul> : <p className="py-4 text-sm text-[var(--text-4)]">아직 없어요</p>}
      </section>

      <section><SectionTitle>이름</SectionTitle><NicknameForm nickname={me.nickname} /></section>
      <p className="text-[11px] text-[var(--text-4)]"><Link href="/admin" className="inline-flex min-h-10 items-center">운영자</Link></p>
    </aside>
  </div>;
}
