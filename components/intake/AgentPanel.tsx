"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { pick } from "@/lib/i18n/messages/common";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { OutcomeBar, ReasonChips } from "@/components/IdeaLineage";
import { type IdeaCheck } from "@/lib/domain/ideas";
import type { Precedent, Problem } from "@/lib/domain/problems";
import type { Draft } from "@/lib/domain/draft";
import { takeoverCandidates, type ResearchQuestion } from "./rules";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AgentBubble({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return <section className="flex items-start gap-3">
    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-deep)]">{step}</span>
    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-muted p-4">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      {children}
    </div>
  </section>;
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-lg bg-background px-2.5 py-1.5 text-xs text-foreground">{children}</span>;
}

function SourceLink({ url, title }: { url: string; title?: string }) {
  const { t } = useI18n();
  if (!url) return null;
  return <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">{title ?? t.intake.source}<ArrowUpRight size={12} aria-hidden="true" /></a>;
}

export function AgentPanel({ pending, draft, check, precedents, local, questions, answers, onAnswer }: {
  pending: boolean; draft: Draft | null; check: IdeaCheck | null; precedents: Precedent[]; local: Problem[];
  questions: ResearchQuestion[]; answers: Partial<Record<ResearchQuestion["key"], string>>;
  onAnswer: (question: ResearchQuestion, answer: string) => void;
}) {
  const { locale, t } = useI18n();
  const candidates = takeoverCandidates(check?.related ?? []);
  const attempts = [...new Map(local.flatMap((p) => p.attempts).map((a) => [a.id, a])).values()];
  return <aside className="min-w-0 self-start overflow-clip rounded-2xl border border-border bg-background lg:sticky lg:top-24" aria-label={t.intake.assistant}>
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <h2 className="flex items-center gap-2 text-base font-bold"><Sparkles className="size-4 text-primary" aria-hidden="true" />{t.intake.assistant}</h2>
      <span role="status" className="text-xs text-muted-foreground">{pending ? t.intake.analyzing : draft ? t.intake.analysisDone : t.intake.waiting}</span>
    </div>
    <div className="space-y-5 p-5 lg:max-h-[calc(100dvh-190px)] lg:overflow-y-auto">
      {!draft && <div className="rounded-2xl rounded-tl-sm bg-muted p-4 text-sm leading-6 text-muted-foreground">
        {pending ? t.intake.analysisProgress : t.intake.assistantIntro}
      </div>}
      {draft && <>
        <AgentBubble step={1} title={t.intake.concepts}>
          <div className="space-y-3">
            <div><p className="mb-1.5 text-xs text-muted-foreground">{t.intake.needs}</p><div className="flex flex-wrap gap-1.5">{check?.concepts.length ? check.concepts.map((c) => <Chip key={c.key}>{pick(t.common.needs, c.key, c.label)}</Chip>) : <Chip>{t.intake.noConcepts}</Chip>}</div></div>
            <div className="flex flex-wrap gap-1.5"><Chip>{t.intake.place} · {draft.place || (check ? pick(t.common.places, check.zone.key, check.zone.label) : "") || t.intake.unknown}</Chip><Chip>{t.intake.target} · {draft.target || t.intake.unknown}</Chip></div>
            <div><p className="mb-1.5 text-xs text-muted-foreground">{t.intake.barrierCandidates}</p><div className="flex flex-wrap gap-1.5">{check?.outcome.reasons.length ? check.outcome.reasons.map((r) => <Chip key={r.tag}>{pick(t.common.barriers, r.tag, r.tag)}</Chip>) : <span className="text-xs text-muted-foreground">{t.intake.noBarriers}</span>}</div></div>
          </div>
        </AgentBubble>
        <AgentBubble step={2} title={t.intake.precedentAlert}>
          {!check ? <p className="text-sm text-muted-foreground">{t.intake.precedentError}</p> : <>
            <p data-testid="duplicate-alert" className="text-base font-bold">{t.intake.already} <span className="text-[var(--brand-deep)]">{t.intake.attemptCount(check.outcome.attempts)}</span>{t.intake.ideaAppeared}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.intake.outcomeCounts(check.outcome.going, check.outcome.stopped, check.outcome.open)}</p>
            <OutcomeBar o={check.outcome} className="my-3" />
            <ReasonChips o={check.outcome} />
            <ul className="mt-3 divide-y divide-border">{check.related.map((r) => <li key={r.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>{r.year || t.intake.unknownYear}</span><span>{pick(t.common.origins, r.origin, r.originLabel)}</span><span className="ml-auto rounded-md bg-background px-2 py-1">{locale === "ko" ? r.statusLabel : pick(t.common.ideaStates, r.status.toUpperCase(), pick(t.common.cardStatus, r.status.toLowerCase(), r.statusLabel))}</span></div>
              <Link href={`/cards/${r.id}`} className="mt-1 block text-sm font-semibold leading-6 hover:underline">{r.title}</Link>
              {r.reason && <p className="mt-1 text-xs leading-5 text-muted-foreground">{r.reason}</p>}
              <div className="mt-2 flex flex-wrap gap-3"><SourceLink url={r.sourceUrl} />{candidates.some((c) => c.id === r.id) && <Link href={`/cards/${r.id}/takeover`} className="text-xs font-bold text-[var(--brand-deep)] hover:underline">{t.intake.takeover}</Link>}</div>
            </li>)}</ul>
          </>}
        </AgentBubble>
        <AgentBubble step={3} title={t.intake.otherSolutions}>
          {!precedents.length && !attempts.length ? <p className="text-sm text-muted-foreground">{t.intake.noOtherSolutions}</p> :
            <div className="space-y-4">
              {precedents.map((p) => <article key={p.id} className="space-y-1.5">
                <p className="text-xs text-muted-foreground">{p.countryCode === "KR" ? t.intake.domestic : t.intake.overseas} · {p.region} · {p.year}</p>
                <h4 className="text-sm font-semibold">{p.title}</h4><p className="text-xs leading-5">{p.approach}</p>
                <p className="text-xs text-muted-foreground">{t.intake.result} · {t.common.ideaStates[p.outcome]}{p.reason && ` · ${p.reason}`}</p><SourceLink url={p.sourceUrl} title={p.sourceTitle || t.intake.source} />
              </article>)}
              {attempts.map((a) => <article key={a.id} className="space-y-1.5">
                <p className="text-xs text-muted-foreground">{t.intake.otherPlace} · {pick(t.common.places, a.place.key, a.place.label)} · {a.year || t.intake.unknownYear}</p>
                {a.href ? <Link href={a.href} className="block text-sm font-semibold hover:underline">{a.title}</Link> : <h4 className="text-sm font-semibold">{a.title}</h4>}
                <p className="text-xs text-muted-foreground">{t.common.ideaStates[a.state]}{a.barriers.length > 0 && ` · ${a.barriers.map((tag) => pick(t.common.barriers, tag, tag)).join(", ")}`}</p><SourceLink url={a.sourceUrl} />
              </article>)}
            </div>}
        </AgentBubble>
        <AgentBubble step={4} title={t.intake.missingQuestions(questions.length)}>
          <div className="space-y-5">{questions.length ? questions.map((q) => <QuestionBox key={q.key} question={q} answer={answers[q.key]} onAnswer={(answer) => onAnswer(q, answer)} />) : <p className="text-sm text-muted-foreground">{t.intake.noQuestions}</p>}</div>
        </AgentBubble>
      </>}
    </div>
  </aside>;
}

function QuestionBox({ question, answer, onAnswer }: { question: ResearchQuestion; answer?: string; onAnswer: (answer: string) => void }) {
  const { t } = useI18n();
  return <form onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onAnswer(String(form.get("custom") || form.get("option")).trim());
  }} className="space-y-3">
    <p className="text-sm font-semibold leading-6">{question.prompt}</p>
    <fieldset className="space-y-2">
      <legend className="sr-only">{t.intake.suggestions(question.label)}</legend>
      {question.options.map((option, i) => <label key={option} className="flex cursor-pointer items-start gap-2 text-xs leading-5">
        <input type="radio" name="option" value={option} defaultChecked={i === 0} className="mt-1 accent-[var(--primary)]" />
        {option}
      </label>)}
    </fieldset>
    <Input name="custom" aria-label={t.intake.customLabel(question.label)} placeholder={t.intake.customInput} maxLength={120} variant="soft" className="bg-background" />
    <Button type="submit" variant="soft" size="sm" className="bg-background text-xs">{answer ? t.intake.editAnswer : t.intake.applyAnswer}</Button>
    {answer && <div className="ml-5 flex items-start gap-2 rounded-xl rounded-tr-sm bg-[var(--brand-soft)] p-3 text-xs leading-5"><Check size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{answer}</span></div>}
  </form>;
}
