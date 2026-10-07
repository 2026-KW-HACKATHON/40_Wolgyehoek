import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { currentDevice } from "@/lib/device";
import { myActivity } from "@/lib/queries";
import { getWallet } from "@/lib/credits";
import { POINTS } from "@/lib/domain/types";
import { markNoticesRead } from "@/app/actions";
import { CardItem } from "@/components/card-item";
import { ButtonLink, SectionTitle, fmtDate } from "@/components/ui";
import { DECISION_LABELS, type Decision } from "@/lib/domain/types";
import { NicknameForm } from "./nickname-form";

export default async function MePage() {
  const me = await currentDevice();
  if (!me) return <p className="p-6 text-muted-foreground">새로고침 후 다시 시도해 주세요.</p>;
  const [a, wallet] = await Promise.all([myActivity(), getWallet()]);
  const cardById = new Map([...a.mine, ...a.joined].map(s => [s.card.id, s]));
  const unread = a.notices.filter(n => !n.readAt);
  return <div className="space-y-9 px-4 pb-8 pt-4">
    <header className="flex flex-col items-center text-center">
      <span className="bg-brand flex size-[104px] items-center justify-center rounded-full p-[3px]"><span className="flex size-full items-center justify-center rounded-full border-4 border-background bg-muted text-[38px] font-black text-foreground">{me.nickname.slice(0, 1)}</span></span>
      <h1 className="mt-3 text-[24px] font-extrabold tracking-tight">{me.nickname}</h1>
      <dl className="mt-5 grid w-full grid-cols-3">
        {[["제안", a.mine.length], ["참여", a.joined.length], ["새 소식", unread.length]].map(([label, count]) => <div key={label} className="flex flex-col-reverse"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-[22px] font-extrabold tnum">{count}</dd></div>)}
      </dl>
    </header>
    {wallet.enabled && <section className="rounded-[22px] bg-muted p-5">
      <div className="flex items-baseline justify-between"><h2 className="text-sm font-bold text-muted-foreground">기록 포인트</h2><p className="text-[28px] font-black leading-none tracking-tight tnum">{wallet.balance.toLocaleString()}<span className="ml-0.5 text-base">P</span></p></div>
      <p className="mt-2 text-xs text-[var(--text-4)] tnum">이유 {POINTS.reason}P · 결론 {POINTS.conclusion}P · 이어받기 {POINTS.takeover}P · 시연용</p>
      {wallet.ledger.length > 0 && <details className="mt-3 border-t border-border pt-3"><summary className="cursor-pointer text-sm font-bold">기록 {wallet.ledger.length}</summary><ul className="mt-2 divide-y divide-border">{wallet.ledger.map((r, i) => <li key={`${r.createdAt}-${i}`} className="flex items-center justify-between gap-3 py-2.5"><span className="min-w-0 truncate text-sm">{r.description}</span><span className={`shrink-0 text-sm font-bold tnum ${r.amount > 0 ? "text-primary" : "text-muted-foreground"}`}>{r.amount > 0 ? "+" : ""}{r.amount}</span></li>)}</ul></details>}
    </section>}
    <section>
      <SectionTitle sub={unread.length ? <form action={markNoticesRead}><Button type="submit" variant="soft" size="sm">모두 읽음</Button></form> : null}>소식</SectionTitle>
      {a.notices.length ? <ul className="divide-y divide-border">{a.notices.map(n => { const s = cardById.get(n.cardId); return <li key={n.id} className="flex items-start gap-3 py-3.5">
        <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-primary"}`} />
        <div className="min-w-0 flex-1">
          <Link href={`/cards/${n.cardId}`} className="block truncate text-[15px] font-bold hover:text-primary">{n.cardTitle}</Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.kind === "conclusion" ? (s?.latest ? `${DECISION_LABELS[s.latest.decision as Decision]}${s.latest.reason ? ` · ${s.latest.reason}` : ""}` : "결론 도착") : n.kind === "success" ? "성사됐어요!" : n.kind === "schedule" ? (s?.card.successNote ?? "일정이 정해졌어요") : "다시 시작됨"}</p>
        </div>
        <span className="shrink-0 text-xs text-[var(--text-4)] tnum">{fmtDate(n.createdAt)}{!n.readAt && <span className="sr-only"> 새 소식</span>}</span>
      </li>; })}</ul> : <p className="py-6 text-center text-sm text-[var(--text-4)]">아직 없어요</p>}
    </section>
    <section><SectionTitle sub={a.mine.length || null}>내 아이디어</SectionTitle>{a.mine.length ? <div className="divide-y divide-border">{a.mine.map(s => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-4 py-6"><p className="text-sm text-[var(--text-4)]">아직 없어요</p><ButtonLink href="/new" variant="secondary">아이디어 올리기</ButtonLink></div>}</section>
    <section><SectionTitle sub={a.joined.length || null}>참여한 아이디어</SectionTitle>{a.joined.length ? <div className="divide-y divide-border">{a.joined.map(s => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-4 py-6"><p className="text-sm text-[var(--text-4)]">아직 없어요</p><ButtonLink href="/" variant="secondary">둘러보기</ButtonLink></div>}</section>
    <section><SectionTitle>닉네임</SectionTitle><NicknameForm nickname={me.nickname} /></section>
    <p className="text-center text-[11px] text-[var(--text-4)]"><Link href="/admin" className="inline-flex min-h-10 items-center">운영자</Link></p>
  </div>;
}
