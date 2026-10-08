import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import { TEAM_REPORTS, teamReport } from "@/lib/domain/team-reports";
import { contacts, nextSteps } from "@/lib/domain/next-steps";

export function generateStaticParams() {
  return TEAM_REPORTS.map((r) => ({ no: String(r.no) }));
}

export async function generateMetadata({ params }: { params: Promise<{ no: string }> }) {
  const { t } = await getT();
  const r = teamReport(Number((await params).no));
  return { title: r ? `${r.service} · ${t.teams.metadataTitle}` : t.teams.metadataTitle };
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return <section className="mt-8">
    <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
    {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
    <div className="mt-3">{children}</div>
  </section>;
}

export default async function TeamReportPage({ params }: { params: Promise<{ no: string }> }) {
  const { t } = await getT();
  const r = teamReport(Number((await params).no));
  if (!r) notFound();
  const related = r.check?.related ?? [];
  const steps = nextSteps(related);
  const asks = contacts(related);

  return <div className="mx-auto w-full max-w-[860px] px-6 pt-6 pb-16">
    <Link href="/teams" className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" />{t.teams.back}</Link>
    <p className="mt-4 text-sm font-bold text-primary">{r.no}조 · {r.teamName} · {r.category}</p>
    <h1 className="mt-1 text-[32px] font-black tracking-[-0.04em]">{r.service}</h1>
    {r.summary && <p className="mt-2 text-[16px] leading-7 text-muted-foreground">{r.summary}</p>}
    <a href={r.galleryUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground underline underline-offset-4">{t.teams.galleryLink}<ArrowUpRight className="size-3.5" /></a>

    {!!r.check?.concepts.length && <div className="mt-5 flex flex-wrap gap-1.5">
      {r.check.concepts.map((c) => <span key={c.key} className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-sm font-bold text-[var(--brand-deep)]">{pick(t.common.needs, c.key, c.label)}</span>)}
    </div>}

    {steps.length > 0 && <Section title={t.teams.nextSteps}>
      <ol className="space-y-2">{steps.map((s, i) => <li key={s.key} className="flex gap-3 rounded-2xl bg-[var(--brand-soft)] p-4">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">{i + 1}</span>
        <span className="min-w-0"><span className="block text-[16px] font-extrabold">{t.intake.nextSteps[s.key]}</span><span className="mt-0.5 block text-sm text-muted-foreground">{t.intake.nextStepBecause(s.ref)}</span></span>
      </li>)}</ol>
    </Section>}

    {asks.length > 0 && <Section title={t.teams.ask} hint={t.teams.askHint}>
      <div className="flex flex-wrap gap-2">{asks.map((a) => <span key={a.name} className="rounded-xl bg-muted px-3.5 py-2 text-[15px] font-bold">{a.name}</span>)}</div>
    </Section>}

    <Section title={t.teams.pastAttempts}>
      {related.length === 0 ? <p className="rounded-2xl bg-muted p-4 text-sm leading-6 text-muted-foreground">{t.teams.noPast}</p> :
        <ul className="divide-y divide-border">{related.map((a) => <li key={a.id} className="py-3.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="tnum">{a.year || t.intake.unknownYear}</span><span>{a.by || pick(t.common.origins, a.origin, a.originLabel)}</span><span className="ml-auto rounded-md bg-muted px-2 py-1 font-semibold">{a.statusLabel}</span></div>
          <Link href={`/cards/${a.id}`} className="mt-1 block text-[16px] font-bold hover:underline">{a.title}</Link>
          {a.reason && <p className="mt-1 text-sm leading-6"><b className="text-[var(--brand-deep)]">{a.reasonTags.length ? t.teams.stoppedBecause : ""}</b>{a.reasonTags.length ? " · " : ""}<span className="text-muted-foreground">{a.reason}</span></p>}
          {a.sourceUrl && <a href={a.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4">{a.sourceTitle || t.intake.source}<ArrowUpRight className="size-3" /></a>}
        </li>)}</ul>}
    </Section>

    {r.precedents.length > 0 && <Section title={t.teams.elsewhere}>
      <ul className="space-y-3">{r.precedents.slice(0, 4).map((p) => <li key={p.id} className="rounded-2xl bg-muted p-4">
        <p className="text-xs text-muted-foreground">{p.region} · {p.year}</p>
        <p className="mt-0.5 text-[15px] font-bold">{p.title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{p.approach}</p>
      </li>)}</ul>
    </Section>}

    <Link href={`/new?q=${encodeURIComponent(r.service + " " + (r.summary || ""))}`} className="bg-brand mt-10 flex min-h-12 items-center justify-center rounded-2xl text-[16px] font-bold text-white">{t.teams.tryIt}</Link>
    <p className="mt-4 text-xs text-[var(--text-4)]">{t.teams.disclaimer}</p>
  </div>;
}
