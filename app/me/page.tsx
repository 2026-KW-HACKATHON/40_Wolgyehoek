import { getT } from "@/lib/i18n/server";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { currentDevice } from "@/lib/device";
import { myActivity } from "@/lib/queries";
import { markNoticesRead } from "@/app/actions";
import { CardItem } from "@/components/card-item";
import { ButtonLink, SectionTitle, fmtDate } from "@/components/ui";
import { type Decision } from "@/lib/domain/types";
import { NicknameForm } from "./nickname-form";

export async function generateMetadata() { const { t } = await getT(); return { title: t.me.metadata }; }

export default async function MePage() {
  const { t } = await getT();
  const me = await currentDevice();
  if (!me) return <p className="mx-auto max-w-[1200px] px-8 py-10 text-muted-foreground">{t.me.retry}</p>;
  const a = await myActivity();
  const cardById = new Map([...a.mine, ...a.joined].map((s) => [s.card.id, s]));
  const unread = a.notices.filter((n) => !n.readAt);
  const contributions: [string, number][] = [
    [t.me.registered, a.mine.filter((s) => !s.card.parentId).length],
    [t.me.takenOver, a.mine.filter((s) => s.card.parentId).length],
    [t.me.joined, a.joined.length],
  ];

  return <div className="mx-auto grid w-full max-w-[1200px] items-start gap-10 px-8 pt-8 lg:grid-cols-[minmax(0,1fr)_380px]">
    <div className="min-w-0 space-y-10">
      <header>
        <h1 className="text-[34px] font-black tracking-[-0.04em]">{t.me.workspace}</h1>
        <p className="mt-2 text-[17px] font-medium text-muted-foreground">{t.me.intro}</p>
      </header>
      <section><SectionTitle sub={a.mine.length || null}>{t.me.registered}</SectionTitle>{a.mine.length ? <div className="divide-y divide-border">{a.mine.map((s) => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-border py-10"><p className="text-sm text-[var(--text-4)]">{t.me.empty}</p><ButtonLink href="/new" variant="secondary">{t.me.newIdea}</ButtonLink></div>}</section>
      <section><SectionTitle sub={a.joined.length || null}>{t.me.joined}</SectionTitle>{a.joined.length ? <div className="divide-y divide-border">{a.joined.map((s) => <CardItem key={s.card.id} s={s} />)}</div> : <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-border py-10"><p className="text-sm text-[var(--text-4)]">{t.me.empty}</p><ButtonLink href="/problems" variant="secondary">{t.me.browse}</ButtonLink></div>}</section>
    </div>

    <aside className="space-y-8 lg:sticky lg:top-24">
      <section className="rounded-[22px] bg-muted p-5">
        <div className="flex items-center gap-3">
          <span className="bg-brand flex size-14 items-center justify-center rounded-full text-[22px] font-black text-white">{me.nickname.slice(0, 1)}</span>
          <div className="min-w-0"><p className="truncate text-lg font-extrabold">{me.nickname}</p><p className="text-xs font-semibold text-muted-foreground">{t.me.history}</p></div>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2">{contributions.map(([k, v]) => <div key={k} className="rounded-2xl bg-background p-3"><dd className="tnum text-[22px] font-black leading-none">{v}</dd><dt className="mt-1.5 text-[11px] font-semibold leading-tight text-muted-foreground">{k}</dt></div>)}</dl>
      </section>

      <section>
        <SectionTitle sub={unread.length ? <form action={markNoticesRead}><Button type="submit" variant="soft" size="sm">{t.me.readAll}</Button></form> : null}>{t.me.news}</SectionTitle>
        {a.notices.length ? <ul className="divide-y divide-border">{a.notices.map((n) => { const s = cardById.get(n.cardId); return <li key={n.id} className="flex items-start gap-3 py-3">
          <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-primary"}`} />
          <div className="min-w-0 flex-1">
            <Link href={`/cards/${n.cardId}`} className="block truncate text-[15px] font-bold hover:text-primary">{n.cardTitle}</Link>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.kind === "conclusion" ? (s?.latest ? `${t.common.decisions[s.latest.decision as Decision]}${s.latest.reason ? ` · ${s.latest.reason}` : ""}` : t.me.conclusionArrived) : n.kind === "success" ? t.me.goalReached : n.kind === "schedule" ? (s?.card.successNote ?? t.me.scheduled) : t.me.restarted}</p>
          </div>
          <span className="shrink-0 text-xs text-[var(--text-4)] tnum">{fmtDate(n.createdAt)}</span>
        </li>; })}</ul> : <p className="py-4 text-sm text-[var(--text-4)]">{t.me.empty}</p>}
      </section>

      <section><SectionTitle>{t.me.name}</SectionTitle><NicknameForm nickname={me.nickname} /></section>
      <p className="text-[11px] text-[var(--text-4)]"><Link href="/admin" className="inline-flex min-h-10 items-center">{t.me.operator}</Link></p>
    </aside>
  </div>;
}
