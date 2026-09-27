import Link from "next/link";
import { notFound } from "next/navigation";
import { getCard } from "@/lib/queries";
import { currentDevice } from "@/lib/device";
import { aggregateReport } from "@/lib/domain/report";
import { canTakeOver } from "@/lib/domain/status";
import { DECISION_LABELS, RESPONDENT_LABELS, STANCE_LABELS, STEP_LABELS, type Decision, type RespondentType, type Stance } from "@/lib/domain/types";
import { closeNow } from "@/app/actions";
import { ButtonLink, Disclaimer, Pill, SectionTitle, StatusBadge, fmtDate, fmtWon } from "@/components/ui";
import { ConclusionForm, FlagForm, OpinionForm, ReactionPanel, ReportPublishForm } from "./panels";

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [d, me] = await Promise.all([getCard(id), currentDevice()]);
  if (!d || (d.card.hidden && !me?.isOperator)) notFound();
  const { card, status } = d;
  const isOwner = me?.id === card.proposerId;
  const canManage = isOwner || !!me?.isOperator;
  const report = aggregateReport(
    d.reactions.map((r) => ({ step: r.step, price: r.price, respondentType: r.respondentType as RespondentType, geoInside: r.geoInside })),
    d.opinions.map((o) => ({ stance: o.stance as Stance, hidden: o.hidden })),
  );
  const mine = d.reactions.find((r) => r.deviceId === me?.id) ?? null;
  const reportVisible = status !== "open" && (!!card.reportPublishedAt || canManage);

  return (
    <article className="mx-auto max-w-[720px] space-y-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {card.isSeed && <Pill>예시 · 과거 공개 아이디어</Pill>}
          <span className="tnum font-mono text-[12px] text-ink-3">{fmtDate(card.startsAt)} ~ {fmtDate(card.endsAt)}</span>
        </div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[32px]">{card.title}</h1>
        <p className="whitespace-pre-line text-[16px] leading-7 text-ink-2">{card.body}</p>
        <dl className="ring-card grid grid-cols-3 divide-x divide-divider rounded-lg bg-white text-sm">
          {[["대상", card.target], ["장소", card.place], ["기대 효과", card.effect]].map(([k, v]) => (
            <div key={k} className="p-3">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{k}</dt>
              <dd className="mt-1 font-medium">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-ink-3">제안 · {card.proposerName}</p>
        {d.parent && (
          <p className="rounded-md bg-subtle px-3 py-2 text-sm ring-line">
            이어받은 카드예요. 원본: <Link href={`/cards/${d.parent.id}`} className="font-medium underline">{d.parent.title}</Link>
            {card.takeoverNote && <> — 달라진 점: {card.takeoverNote}</>}
          </p>
        )}
        {me?.isOperator && status === "open" && (
          <form action={closeNow.bind(null, card.id)}>
            <button className="rounded-md bg-ink px-3 py-2 font-mono text-[12px] text-white">[운영자] 검증 즉시 종료</button>
          </form>
        )}
      </header>

      <section>
        <SectionTitle sub={<span className="tnum">반응 {report.total}</span>}>이 아이디어, 써보실 건가요?</SectionTitle>
        <ReactionPanel
          cardId={card.id}
          open={status === "open"}
          counts={report.steps.map((s) => s.count)}
          mine={mine ? { step: mine.step, price: mine.price, respondentType: mine.respondentType as RespondentType } : null}
        />
      </section>

      {reportVisible && (
        <section>
          <SectionTitle sub={card.reportPublishedAt ? `공개 ${fmtDate(card.reportPublishedAt)}` : "공개 전 · 제안자/운영자만 보임"}>검증 리포트</SectionTitle>
          <div className="ring-featured space-y-5 rounded-lg bg-white p-5">
            <Disclaimer total={report.total} />
            <div className="space-y-3">
              {report.steps.map((s) => (
                <div key={s.step} className="grid grid-cols-[120px_1fr_64px] items-center gap-3 text-sm">
                  <span className="flex items-center gap-2"><i className="block size-2 rounded-full" style={{ background: `var(--step-${s.step})` }} />{STEP_LABELS[s.step - 1]}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-divider">
                    <div className="h-full rounded-full" style={{ width: `${report.total ? (s.count / report.total) * 100 : 0}%`, background: `var(--step-${s.step})` }} />
                  </div>
                  <span className="tnum text-right font-mono text-[12px]">{s.count}명{s.ratio !== null && ` · ${Math.round(s.ratio * 100)}%`}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
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

      {(d.conclusions.length > 0 || (canManage && status !== "open")) && (
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
