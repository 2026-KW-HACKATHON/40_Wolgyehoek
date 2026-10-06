import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Bell, CheckCircle2, MessageCircle, NotebookPen, RotateCcw, UserRound } from "lucide-react";
import { currentDevice } from "@/lib/device";
import { myActivity } from "@/lib/queries";
import { markNoticesRead } from "@/app/actions";
import { CardItem } from "@/components/card-item";
import { ButtonLink, SectionTitle, fmtDate } from "@/components/ui";
import { DECISION_LABELS, type Decision } from "@/lib/domain/types";
import { NicknameForm } from "./nickname-form";

export default async function MePage() {
  const me = await currentDevice();
  if (!me) return <p className="p-6 text-muted-foreground">새로고침 후 다시 시도해 주세요.</p>;
  const a = await myActivity();
  const cardById = new Map([...a.mine, ...a.joined].map(s => [s.card.id, s]));
  const unread = a.notices.filter(n => !n.readAt);
  return <div className="mx-auto max-w-[1000px] space-y-9 px-4 py-7 sm:px-8 sm:py-10">
    <header><p className="mb-4 flex items-center gap-2 text-xs font-semibold text-primary"><UserRound className="size-4" />{me.nickname}님의 참여 기록</p><h1 className="text-[30px] font-semibold leading-snug tracking-[-0.035em] sm:text-[38px]">내가 보탠 생각,<br />어떤 변화가 되었을까요?</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">참여한 아이디어의 결론과 새로운 시작을 이곳에서 확인해요.<br className="hidden sm:block" />로그인 없이, 이 기기로 남긴 기록이 모여 있어요.</p></header>
    <div className="grid gap-3 sm:grid-cols-3">{[{ icon: NotebookPen, label: "내가 남긴 제안", count: a.mine.length }, { icon: MessageCircle, label: "함께한 아이디어", count: a.joined.length }, { icon: Bell, label: "새로 도착한 알림", count: unread.length }].map(({ icon: MetricIcon, label, count }) => { return <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-[var(--brand-soft)] p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-background text-primary"><MetricIcon className="size-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="tnum mt-1 text-xl font-semibold">{count}<span className="ml-1 text-xs font-normal text-muted-foreground">개</span></p></div></div>; })}</div>
    <section>
      <SectionTitle sub={unread.length ? <form action={markNoticesRead}><Button type="submit" variant="outline" size="sm">모두 읽음</Button></form> : null}>도착한 소식</SectionTitle>
      {a.notices.length ? <ul className="space-y-3">{a.notices.map(n => { const s = cardById.get(n.cardId); const Icon = n.kind === "conclusion" ? CheckCircle2 : RotateCcw; return <li key={n.id} className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${n.readAt ? "border-border/70 bg-background" : "border-primary/25 bg-[var(--brand-soft)]"}`}><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-primary"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{n.kind === "conclusion" ? "결론이 도착했어요" : "아이디어가 다시 시작됐어요"}{!n.readAt && <span className="ml-2 font-semibold text-primary">새 소식</span>}</span><span className="tnum">{fmtDate(n.createdAt)}</span></p><Link href={`/cards/${n.cardId}`} className="mt-2 block text-sm font-semibold leading-6 hover:text-primary">{n.cardTitle}</Link>{n.kind === "conclusion" && s?.latest && <p className="mt-1 text-xs text-muted-foreground">{DECISION_LABELS[s.latest.decision as Decision]} · {s.latest.reason || "결과를 확인해 보세요."}</p>}</div></li>; })}</ul> : <div className="rounded-2xl border border-dashed border-border bg-muted/25 px-6 py-8 text-center"><Bell className="mx-auto mb-3 size-6 text-primary/60" /><p className="text-sm font-medium">참여한 아이디어의 다음 소식을 기다려요.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">결론이 기록되거나 누군가 이어받으면 여기에 소식이 도착해요.</p></div>}
    </section>
    <section><SectionTitle sub={`${a.joined.length}개`}>내가 함께한 아이디어</SectionTitle>{a.joined.length ? <div className="grid gap-4 sm:grid-cols-2">{a.joined.map(s => <CardItem key={s.card.id} s={s} />)}</div> : <div className="rounded-2xl border border-dashed border-border p-6"><p className="mb-4 text-sm text-muted-foreground">관심 있는 제안에 첫 반응을 남겨 보세요.</p><ButtonLink href="/#ideas" variant="secondary">동네 아이디어 둘러보기</ButtonLink></div>}</section>
    <section><SectionTitle sub={`${a.mine.length}개`}>내가 올린 아이디어</SectionTitle>{a.mine.length ? <div className="grid gap-4 sm:grid-cols-2">{a.mine.map(s => <CardItem key={s.card.id} s={s} />)}</div> : <div className="rounded-2xl border border-dashed border-border p-6"><p className="mb-4 text-sm text-muted-foreground">동네에서 함께 해보고 싶은 일이 있나요?</p><ButtonLink href="/new" variant="secondary">첫 아이디어 남기기</ButtonLink></div>}</section>
    <section className="rounded-2xl border border-border/70 bg-muted/25 p-5"><h2 className="mb-2 text-sm font-semibold">이웃에게 보이는 이름</h2><p className="mb-4 text-xs leading-5 text-muted-foreground">실명 대신 편한 닉네임을 사용해도 좋아요.</p><NicknameForm nickname={me.nickname} /></section>
    <p className="text-xs text-muted-foreground"><Link href="/admin" className="underline">운영자 모드</Link></p>
  </div>;
}
