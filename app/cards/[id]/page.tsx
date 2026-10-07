import { ArrowLeft, MapPin, UserRound } from "lucide-react";
import { getCreditInsight } from "@/lib/credits";
import { RecordProgress } from "@/components/RecordProgress";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCard } from "@/lib/queries";
import { currentDevice } from "@/lib/device";
import type { Report } from "@/lib/domain/report";
import { canTakeOver } from "@/lib/domain/status";
import { DECISION_LABELS, RESPONDENT_LABELS, STANCE_LABELS, STEP_LABELS, type Decision, type RespondentType, type Stance } from "@/lib/domain/types";
import { closeNow } from "@/app/actions";
import { ButtonLink, Disclaimer, Pill, SectionTitle, StatusBadge, fmtDate, fmtWon } from "@/components/ui";
import { ConclusionForm, FlagForm, OpinionForm, ReactionPanel, ReportPublishForm } from "./panels";

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [d, me] = await Promise.all([getCard(id), currentDevice()]);
  if (!d || (d.card.hidden && !me?.isOperator)) notFound();
  const insight = await getCreditInsight(id);
  const { card, status } = d;
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

  return (
    <article className="mx-auto max-w-[800px] space-y-8 px-4 py-7  ">
      <Link href="/" className="inline-flex min-h-9 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-3.5" />동네 아이디어로 돌아가기</Link>
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {card.isSeed && <Pill>예시 카드</Pill>}
          <span className="tnum font-mono text-[12px] text-ink-3">{fmtDate(card.startsAt)} ~ {fmtDate(card.endsAt)}</span>
        </div>
        <h1 className="text-[29px] font-semibold leading-[1.3] tracking-[-0.035em] ">{card.title}</h1>
        <p className="whitespace-pre-line text-[16px] leading-7 text-ink-2">{card.body}</p>
        <dl className="grid grid-cols-3 divide-x divide-border/70 rounded-2xl border border-border/70 bg-[var(--brand-soft)] text-sm">
          {[["대상", card.target], ["장소", card.place], ["기대 효과", card.effect]].map(([k, v]) => (
            <div key={k} className="p-3">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{k}</dt>
              <dd className="mt-1 font-medium">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        <p className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><UserRound className="size-3.5" />{card.proposerName}의 제안</span><span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{card.place || "월계1동"}</span></p>
        {d.parent && (
          <p className="rounded-md bg-subtle px-3 py-2 text-sm ring-line">
            이어받은 카드예요. 원본: <Link href={`/cards/${d.parent.id}`} className="font-medium underline">{d.parent.title}</Link>
            {card.takeoverNote && <> — 달라진 점: {card.takeoverNote}</>}
          </p>
        )}
        {me?.isOperator && status === "open" && (
          <form action={closeNow.bind(null, card.id)}>
            <Button type="submit" className="rounded-md bg-ink px-3 py-2 font-mono text-[12px] text-white">[운영자] 검증 즉시 종료</Button>
          </form>
        )}
      </header>
      {!insight.campaign && <RecordProgress status={status} reactions={d.reactionCount} published={!!card.reportPublishedAt} concluded={d.conclusions.length > 0} />}

      {insight.campaign ? <section className="rounded-2xl border border-primary/20 bg-[var(--brand-soft)] p-5">
        <h2 className="text-lg font-semibold">스와이프로 남긴 생각</h2>{card.reportPublishedAt && <p role="status" className="mt-2 text-xs font-semibold text-primary">공개 리포트 · {fmtDate(card.reportPublishedAt)}</p>}
        {insight.mine ? <div className="mt-3"><p className="text-sm font-semibold text-primary">내 반응: {insight.mine.direction === "RIGHT" ? "관심 있어요" : "이번엔 패스"} · {insight.mine.reward}C</p>{insight.mine.reason && <p className="mt-2 text-sm leading-6">{insight.mine.reason}</p>}<p className="mt-2 text-xs text-muted-foreground">이 카드의 보상은 한 번만 지급돼요.</p></div> : canManage ? <div className="mt-3"><p className="mb-3 text-xs leading-6 text-muted-foreground">{me?.isOperator ? "운영자 공간에서 카드 상태를 관리해 주세요." : "내 아이디어에는 보상 참여를 할 수 없어요. 팀 공간에서 모집과 예산을 관리해 주세요."}</p><ButtonLink href={me?.isOperator ? "/admin" : "/team"} variant="secondary">{me?.isOperator ? "운영자 공간" : "팀 공간에서 관리"}</ButtonLink></div> : insight.accepting ? <div className="mt-3"><p className="mb-3 text-xs leading-6 text-muted-foreground">관심 또는 패스를 선택해 주세요. 이유는 선택이며, 보상은 두 방향 모두 같아요.</p><ButtonLink href={`/?idea=${card.id}`}>이 카드에 생각 남기기</ButtonLink></div> : <p className="mt-3 text-xs text-muted-foreground">{status === "open" ? "참여 보상 예산이 준비되면 반응을 남길 수 있어요." : "참여 기간이 끝난 아이디어예요."}</p>}
        {insight.visible ? <div className="mt-5 border-t border-primary/15 pt-4"><p className="text-xs leading-6">기기 {insight.total}개의 반응 · 관심 {insight.likes} · 패스 {insight.passes}{insight.showRatio && !!insight.total && <span> · 관심 {Math.round((insight.likes ?? 0)/insight.total*100)}%</span>}</p>{!insight.showRatio && <p className="mt-2 text-[10px] text-muted-foreground">5개 미만 반응의 비율은 표시하지 않아요.</p>}<div className="mt-4 space-y-3">{insight.responses?.map((r,i)=><div key={i} className="rounded-xl bg-background p-3"><p className="text-[10px] font-semibold text-primary">{r.direction === "RIGHT" ? "관심 있어요" : "이번엔 패스"}</p><p className="mt-1 text-xs leading-6">{r.reason}</p></div>)}</div><p className="mt-3 text-[10px] leading-5 text-muted-foreground">보상 참여에 따른 비공식 반응이며 실제 구매나 주민 대표성을 뜻하지 않습니다.</p></div> : <p className="mt-5 text-xs leading-6 text-muted-foreground">전체 결과와 이유는 종료 후 팀이 리포트를 공개하면 확인할 수 있어요.</p>}
        {canManage && status !== "open" && !card.reportPublishedAt && <div className="mt-5"><ReportPublishForm cardId={card.id}/></div>}
      </section> : <>      <section>
        <SectionTitle sub={<span className="tnum">반응 {report.total}</span>}>이 아이디어, 써보실 건가요?</SectionTitle>
        <ReactionPanel
          cardId={card.id}
          open={status === "open"}
          counts={report.steps.map((s) => s.count)}
          mine={mine ? { step: mine.step, price: mine.price, respondentType: mine.respondentType as RespondentType } : null}
        />
      </section>
</>}

      {reportVisible && !insight.campaign && (
        <section>
          <SectionTitle sub={card.reportPublishedAt ? `공개 ${fmtDate(card.reportPublishedAt)}` : "공개 전 · 제안자/운영자만 보임"}>검증 리포트</SectionTitle>
          <div className="space-y-5 rounded-2xl border border-border/70 bg-white p-5 ">
            <Disclaimer total={report.total} />
            <div className="space-y-3">
              {report.steps.map((s) => (
                <div key={s.step} className="grid grid-cols-[120px_1fr_64px] items-center gap-3 text-sm">
                  <span className="flex items-center gap-2"><i className="block size-2 rounded-full" style={{ background: `var(--step-${s.step})` }} />{STEP_LABELS[s.step - 1]}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-divider">
                    <div className="h-full rounded-full" style={{ width: `${report.showRatio && report.total ? (s.count / report.total) * 100 : 0}%`, background: `var(--step-${s.step})` }} />
                  </div>
                  <span className="tnum text-right font-mono text-[12px]">{s.count}명{s.ratio !== null && ` · ${Math.round(s.ratio * 100)}%`}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm ">
              <Stat label="희망가 중앙값" value={report.price.median !== null ? fmtWon(report.price.median) : "—"} sub={report.price.count ? `${fmtWon(report.price.min!)}~${fmtWon(report.price.max!)}` : "가격 응답 없음"} />
              {(Object.keys(RESPONDENT_LABELS) as RespondentType[]).map((k) => (
                <Stat key={k} label={RESPONDENT_LABELS[k]} value={`${report.respondents[k]}명`} />
              ))}
            </div>
            <p className="tnum text-sm text-ink-2">위치로 월계1동 안 확인 {report.geoInside}명 · 의견 찬성 {report.opinions.pro} / 반대 {report.opinions.con} / 조건부 {report.opinions.conditional}</p>
            {card.reportSummary && <p className="rounded-md bg-subtle px-3 py-2 text-sm leading-6 ring-line">요약(제안자 확인): {card.reportSummary}</p>}
            {!card.reportPublishedAt && canManage && <ReportPublishForm cardId={card.id} />}
          </div>
        </section>
      )}

      {(d.conclusions.length > 0 || canTakeOver(status) || (canManage && status !== "open")) && (
        <section>
          <SectionTitle>결론</SectionTitle>
          {d.conclusions.map((c) => (
            <div key={c.id} className="ring-card mb-3 rounded-lg bg-white p-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={c.decision as Decision} />
                <span className="tnum font-mono text-[12px] text-ink-3">{fmtDate(c.createdAt)}</span>
              </div>
              {c.reasonTags.length > 0 && <p className="mt-2 text-sm font-medium">{c.reasonTags.join(" · ")}</p>}
              {c.reason && <p className="mt-1 text-sm leading-6 text-ink-2">{c.reason}</p>}
            </div>
          ))}
          {canManage && status !== "open" && <ConclusionForm cardId={card.id} />}
          {canTakeOver(status) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-subtle p-4 ring-line">
              <p className="flex-1 text-sm text-ink-2">
                {DECISION_LABELS[(d.latest?.decision as Decision) ?? "hold"] ?? "멈춘"} 상태예요. 이전 반응 {report.total}건 위에서 다시 시작할 수 있어요.
              </p>
              <ButtonLink href={`/cards/${card.id}/takeover`}>이어받기</ButtonLink>
            </div>
          )}
          {d.children.length > 0 && (
            <p className="mt-3 text-sm">
              이어받은 카드: {d.children.map((ch) => <Link key={ch.id} href={`/cards/${ch.id}`} className="mr-2 font-medium underline">{ch.title}</Link>)}
            </p>
          )}
        </section>
      )}

      <section>
        <SectionTitle sub={`${d.opinions.filter((o) => !o.hidden).length}개`}>의견</SectionTitle>
        {status === "open" && <OpinionForm cardId={card.id} />}
        <ul className="mt-4 space-y-3">
          {d.opinions.map((o) => (
            <li key={o.id} className="ring-card rounded-lg bg-white p-4">
              {o.hidden ? (
                <p className="text-sm text-ink-3">운영 정책에 따라 가려진 글입니다.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <Pill>{STANCE_LABELS[o.stance as Stance]}</Pill>
                    <span className="text-ink-3">{o.authorName} · {fmtDate(o.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{o.body}</p>
                  {o.condition && <p className="mt-1 text-sm text-ink-2">조건: {o.condition}</p>}
                  <FlagForm targetType="opinion" targetId={o.id} cardId={card.id} />
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-divider pt-6">
        <FlagForm targetType="card" targetId={card.id} cardId={card.id} label="이 카드 신고" />
      </footer>
    </article>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md bg-subtle p-3 ring-line">
      <div className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className="tnum mt-1 text-base font-semibold">{value}</div>
      {sub && <div className="tnum mt-0.5 text-[12px] text-ink-3">{sub}</div>}
    </div>
  );
}
