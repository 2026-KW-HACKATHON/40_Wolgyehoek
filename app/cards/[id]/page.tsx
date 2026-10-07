import { ArrowUpRight, ChevronLeft, Heart, MapPin, PartyPopper, X } from "lucide-react";
import { getCreditInsight } from "@/lib/credits";
import { RecordProgress } from "@/components/RecordProgress";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCard, relatedIdeas } from "@/lib/queries";
import { ORIGIN_LABELS } from "@/lib/domain/ideas";
import { IdeaLineage } from "@/components/IdeaLineage";
import { currentDevice } from "@/lib/device";
import type { Report } from "@/lib/domain/report";
import { canTakeOver } from "@/lib/domain/status";
import { DECISION_LABELS, RESPONDENT_LABELS, STANCE_LABELS, STATUS_LABELS, STEP_LABELS, topicLabel, type Decision, type RespondentType, type Stance } from "@/lib/domain/types";
import { closeNow } from "@/app/actions";
import { CardBackdrop } from "@/components/CardMedia";
import { ButtonLink, Disclaimer, Pill, SectionTitle, StatusBadge, fmtDate, fmtWon } from "@/components/ui";
import { ConclusionForm, FlagForm, OpinionForm, ReactionPanel, ReportPublishForm } from "./panels";

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [d, me] = await Promise.all([getCard(id), currentDevice()]);
  if (!d || (d.card.hidden && !me?.isOperator)) notFound();
  const [insight, lineage] = await Promise.all([getCreditInsight(id), relatedIdeas(id)]);
  const { card, status } = d;
  const archived = card.origin !== "";
  const statusText = card.succeededAt ? "성사" : archived && !d.latest ? "결과 미확인" : archived && status === "go" ? "시행" : STATUS_LABELS[status];
  const canManage = d.canManage;
  const mine = d.mine;
  const reportVisible = d.report !== null;
  const report: Report = d.report ?? {
    total: d.reactionCount, showRatio: false,
    steps: d.stepCounts.map((count, index) => ({ step: index + 1, count, ratio: null })),
    atLeast: [], price: { count: 0, median: null, min: null, max: null },
    respondents: { resident: 0, work_study: 0, visitor: 0 }, geoInside: 0,
    opinions: { pro: 0, con: 0, conditional: 0 },
  };
  const likeRatio = insight.total ? Math.round(((insight.likes ?? 0) / insight.total) * 100) : 0;

  return (
    <article className="space-y-8 px-4 pb-8 pt-1">
      <header className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[22px] p-6 text-white shadow-float">
        <CardBackdrop cardId={card.id} media={card.media[0]} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[rgb(74_24_4/.78)] via-transparent to-[rgb(74_24_4/.22)]" />
        <Link href="/" aria-label="뒤로" className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur hover:bg-black/30"><ChevronLeft className="size-5" /></Link>
        <div className="absolute right-4 top-6 flex items-center gap-1.5 text-[11px] font-bold"><span className="rounded-full bg-white/25 px-2.5 py-1 backdrop-blur">{statusText}</span>{card.isSeed && <span className="rounded-full bg-white/25 px-2.5 py-1 backdrop-blur">예시</span>}</div>
        <div className="relative">
          <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-white/90"><MapPin className="size-4" />{card.place || "월계1동"}</p>
          <h1 className="text-[30px] font-extrabold leading-[1.18] tracking-[-0.04em] [text-wrap:balance]">{card.title}</h1>
          <p className="mt-2 text-sm text-white/75 tnum">{card.proposerName} · {archived ? `${card.sourceYear}년` : `${fmtDate(card.startsAt)} ~ ${fmtDate(card.endsAt)}`}</p>
        </div>
      </header>

      <section className="space-y-5">
        {card.problem && (
          <div className="rounded-2xl bg-[var(--brand-soft)] p-4">
            <p className="text-xs font-bold text-primary">{[topicLabel(card.topic), "동네 문제"].filter(Boolean).join(" · ")}</p>
            <p className="mt-1 text-[17px] font-bold leading-snug">{card.problem}</p>
          </div>
        )}
        <p className="whitespace-pre-line text-[16px] leading-7">{card.body}</p>
        {card.media.length > 1 && (
          <ul className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1">
            {card.media.map((m) => (
              <li key={m.id} className="relative aspect-[3/4] w-[62%] shrink-0 snap-start overflow-hidden rounded-2xl bg-muted">
                {m.kind === "IMAGE" ? <Image src={`/media/${m.id}`} alt="" fill unoptimized sizes="300px" className="object-cover" /> : <video src={`/media/${m.id}`} controls playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />}
              </li>
            ))}
          </ul>
        )}
        <dl className="divide-y divide-border border-y border-border">
          {[["대상", card.target], ["기대 효과", card.effect]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex gap-4 py-3 text-[15px]"><dt className="w-16 shrink-0 text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
          ))}
        </dl>
        {card.sourceUrl && (
          <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-muted p-4 text-sm hover:bg-[var(--muted-hover)]">
            <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{ORIGIN_LABELS[card.origin] ?? "기록"} · {card.sourceYear}</span><span className="mt-0.5 block truncate font-bold">{card.sourceTitle}</span></span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </a>
        )}
        {d.parent && (
          <Link href={`/cards/${d.parent.id}`} className="block rounded-2xl bg-muted p-4 text-sm hover:bg-[var(--muted-hover)]">
            <span className="text-muted-foreground">이어받은 카드 · </span><span className="font-bold">{d.parent.title}</span>
            {card.takeoverNote && <span className="mt-1 block text-muted-foreground">{card.takeoverNote}</span>}
          </Link>
        )}
        {me?.isOperator && status === "open" && (
          <form action={closeNow.bind(null, card.id)}>
            <Button type="submit" size="sm" className="bg-none bg-foreground">운영자 · 즉시 종료</Button>
          </form>
        )}
      </section>

      {!insight.campaign && !archived && <RecordProgress status={status} reactions={d.reactionCount} published={!!card.reportPublishedAt} concluded={d.conclusions.length > 0} />}

      {insight.campaign ? <section>
        <SectionTitle sub={card.reportPublishedAt ? <span role="status" className="text-xs font-bold text-primary">공개 · {fmtDate(card.reportPublishedAt)}</span> : null}>반응</SectionTitle>
        <div className="mb-4 rounded-2xl bg-muted p-4">
          {insight.succeededAt ? <>
            <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-primary"><PartyPopper className="size-4" />성사 · {insight.pledges}명 함께</p>
            {insight.successNote && <p className="mt-2 text-sm leading-6">{insight.successNote}</p>}
          </> : <>
            <div className="flex items-baseline justify-between text-sm font-bold"><span>성사까지 {Math.max(0, insight.goal - insight.pledges)}명</span><span className="tnum text-xs text-muted-foreground">{insight.pledges}/{insight.goal}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className="bg-brand h-full rounded-full" style={{ width: `${Math.min(100, Math.round((insight.pledges / Math.max(1, insight.goal)) * 100))}%` }} /></div>
          </>}
        </div>
        {insight.mine ? <div className="rounded-2xl bg-muted p-4"><p className="flex items-center gap-2 text-[15px] font-bold">{insight.mine.direction === "RIGHT" ? <Heart className="size-4 fill-[var(--like)] text-[var(--like)]" /> : <X className="size-4 text-[var(--nope)]" strokeWidth={3} />}{insight.mine.direction === "RIGHT" ? "함께해요" : "패스"}<span className="ml-auto text-sm text-primary">+{insight.mine.reward}C</span></p>{insight.mine.reason && <p className="mt-2 text-sm leading-6">{insight.mine.reason}</p>}</div>
          : canManage ? <ButtonLink href={me?.isOperator ? "/admin" : "/team"} variant="secondary">{me?.isOperator ? "운영자 공간" : "팀 공간에서 관리"}</ButtonLink>
          : insight.accepting ? <Button asChild size="lg" className="w-full"><Link href={`/?idea=${card.id}`}>스와이프하러 가기</Link></Button>
          : <p className="text-sm text-[var(--text-4)]">{status === "open" ? "예산 준비 중" : "참여 종료"}</p>}
        {insight.visible ? <div className="mt-6">
          <div className="flex items-end justify-between text-sm font-bold tnum"><span className="flex items-center gap-1.5 text-[var(--like)]"><Heart className="size-4 fill-current" />{insight.likes}</span><span className="text-xs font-medium text-[var(--text-4)]">{insight.total}명{insight.showRatio && !!insight.total && ` · 관심 ${likeRatio}%`}</span><span className="flex items-center gap-1.5 text-[var(--nope)]">{insight.passes}<X className="size-4" strokeWidth={3} /></span></div>
          {insight.showRatio && !!insight.total && <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[var(--nope)]"><div className="h-full bg-[var(--like)]" style={{ width: `${likeRatio}%` }} /></div>}
          {!!insight.responses?.length && <ul className="mt-4 space-y-2">{insight.responses.map((r, i) => <li key={i} className="flex gap-2.5 rounded-2xl bg-muted p-3">{r.direction === "RIGHT" ? <Heart aria-label="함께해요" className="mt-1 size-4 shrink-0 fill-[var(--like)] text-[var(--like)]" /> : <X aria-label="패스" className="mt-1 size-4 shrink-0 text-[var(--nope)]" strokeWidth={3} />}<p className="text-sm leading-6">{r.reason}</p></li>)}</ul>}
          <p className="mt-3 text-[11px] text-[var(--text-4)]">비공식 반응 · 대표성 없음</p>
        </div> : <p className="mt-4 text-sm text-[var(--text-4)]">결과는 종료 후 공개돼요</p>}
        {canManage && status !== "open" && !card.reportPublishedAt && <div className="mt-5"><ReportPublishForm cardId={card.id} /></div>}
      </section> : !archived && <section>
        <SectionTitle sub={<span className="tnum">{report.total}</span>}>써보실 건가요?</SectionTitle>
        <ReactionPanel
          cardId={card.id}
          open={status === "open"}
          counts={report.steps.map((s) => s.count)}
          mine={mine ? { step: mine.step, price: mine.price, respondentType: mine.respondentType as RespondentType } : null}
        />
      </section>}

      {reportVisible && !insight.campaign && (
        <section>
          <SectionTitle sub={card.reportPublishedAt ? `공개 ${fmtDate(card.reportPublishedAt)}` : "공개 전"}>리포트</SectionTitle>
          <div className="space-y-5">
            <div className="space-y-3">
              {report.steps.map((s) => (
                <div key={s.step} className="grid grid-cols-[112px_1fr_72px] items-center gap-3 text-sm">
                  <span className="font-medium">{STEP_LABELS[s.step - 1]}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${report.showRatio && report.total ? (s.count / report.total) * 100 : 0}%`, background: `var(--step-${s.step})` }} />
                  </div>
                  <span className="tnum text-right text-xs text-muted-foreground">{s.count}명{s.ratio !== null && ` · ${Math.round(s.ratio * 100)}%`}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Stat label="희망가 중앙값" value={report.price.median !== null ? fmtWon(report.price.median) : "—"} sub={report.price.count ? `${fmtWon(report.price.min!)}~${fmtWon(report.price.max!)}` : undefined} />
              {(Object.keys(RESPONDENT_LABELS) as RespondentType[]).map((k) => (
                <Stat key={k} label={RESPONDENT_LABELS[k]} value={`${report.respondents[k]}명`} />
              ))}
            </div>
            <p className="tnum text-sm text-muted-foreground">월계1동 위치 확인 {report.geoInside}명 · 찬성 {report.opinions.pro} / 반대 {report.opinions.con} / 조건부 {report.opinions.conditional}</p>
            {card.reportSummary && <p className="rounded-2xl bg-muted p-4 text-sm leading-6">{card.reportSummary}</p>}
            <Disclaimer total={report.total} />
            {!card.reportPublishedAt && canManage && <ReportPublishForm cardId={card.id} />}
          </div>
        </section>
      )}

      {(d.conclusions.length > 0 || canTakeOver(status) || (canManage && status !== "open")) && (
        <section>
          <SectionTitle>결론</SectionTitle>
          {d.conclusions.map((c) => (
            <div key={c.id} className="mb-3 rounded-2xl bg-muted p-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={c.decision as Decision} />
                <span className="tnum text-xs text-muted-foreground">{fmtDate(c.createdAt)}</span>
              </div>
              {c.reasonTags.length > 0 && <p className="mt-2 text-sm font-bold">{c.reasonTags.join(" · ")}</p>}
              {c.reason && <p className="mt-1 text-sm leading-6 text-muted-foreground">{c.reason}</p>}
            </div>
          ))}
          {canManage && status !== "open" && <ConclusionForm cardId={card.id} />}
          {canTakeOver(status) && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border p-4">
              <p className="flex-1 text-sm text-muted-foreground">
                {DECISION_LABELS[(d.latest?.decision as Decision) ?? "hold"] ?? "멈춤"} · 반응 {report.total}
              </p>
              <ButtonLink href={`/cards/${card.id}/takeover`}>이어받기</ButtonLink>
            </div>
          )}
          {d.children.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {d.children.map((ch) => <li key={ch.id}><Link href={`/cards/${ch.id}`} className="font-bold text-primary">→ {ch.title}</Link></li>)}
            </ul>
          )}
        </section>
      )}

      <IdeaLineage check={lineage} mode="detail" />

      {(!archived || d.opinions.length > 0) && <section>
        <SectionTitle sub={d.opinions.filter((o) => !o.hidden).length}>의견</SectionTitle>
        {status === "open" && <OpinionForm cardId={card.id} />}
        <ul className="mt-2 divide-y divide-border">
          {d.opinions.map((o) => (
            <li key={o.id} className="py-4">
              {o.hidden ? (
                <p className="text-sm text-[var(--text-4)]">가려진 글이에요</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <Pill>{STANCE_LABELS[o.stance as Stance]}</Pill>
                    <span className="font-bold">{o.authorName}</span>
                    <span className="text-[var(--text-4)]">{fmtDate(o.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-[15px] leading-6">{o.body}</p>
                  {o.condition && <p className="mt-1 text-sm text-muted-foreground">조건 · {o.condition}</p>}
                  <FlagForm targetType="opinion" targetId={o.id} cardId={card.id} />
                </>
              )}
            </li>
          ))}
        </ul>
      </section>}

      <footer className="border-t border-border pt-2">
        <FlagForm targetType="card" targetId={card.id} cardId={card.id} label="이 카드 신고" />
      </footer>
    </article>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="tnum mt-1 text-base font-extrabold">{value}</div>
      {sub && <div className="tnum mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
