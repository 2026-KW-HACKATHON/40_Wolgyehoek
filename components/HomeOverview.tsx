import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, MapPin, MessageCircle, RotateCcw, Sprout } from "lucide-react";
import type { CardSummary } from "@/lib/queries";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui";
import { BrandMark } from "./BrandMark";

export async function HomeOverview({ cards }: { cards: CardSummary[] }) {
  const { t, locale } = await getT();
  const copy = t.explore.overview;
  const num = (n: number) => n.toLocaleString(locale, { useGrouping: locale !== "ko" });
  const submitted = cards.filter(s => !s.card.isSeed);
  const featured = cards.find(s => s.status === "open" && !s.card.isSeed) ?? cards.find(s => s.status === "open");
  const child = cards.find(s => s.card.parentId && cards.some(p => p.card.id === s.card.parentId));
  const parent = child ? cards.find(s => s.card.id === child.card.parentId) : null;
  const stats = [
    { value: submitted.length, label: copy.ideas, suffix: copy.suffix },
    { value: submitted.reduce((total, s) => total + s.reactionCount, 0), label: copy.responses, suffix: copy.suffix },
    { value: submitted.filter(s => s.card.parentId).length, label: copy.takeovers, suffix: copy.suffix },
  ];
  return <>
    <section aria-labelledby="home-intro" className="home-hero grid overflow-hidden rounded-[24px] lg:grid-cols-[1.2fr_1fr]">
      <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden p-6 text-white sm:p-9 lg:p-10">
        <div className="relative z-10">
          <p className="mb-7 flex items-center gap-2 text-xs font-medium text-[var(--brand-mist)]"><MapPin className="size-3.5" />{copy.location}</p>
          <h1 id="home-intro" className="max-w-lg text-[34px] font-bold leading-[1.22] tracking-[-0.045em] sm:text-[44px] xl:text-[48px]">{copy.heading}<br /><span className="text-[var(--brand-highlight)]">{copy.nextAttempt}</span>{copy.headingEnd}</h1>
          <p className="mt-5 max-w-[360px] text-sm leading-7 text-white/80">{copy.intro}<br />{copy.introEnd}</p>
        </div>
        <div className="relative z-10 mt-7 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-12 rounded-xl bg-[var(--brand-highlight)] px-5 text-sm font-semibold text-[var(--brand-deep)] hover:bg-[var(--brand-highlight)]/90"><Link href="/new">{copy.submit}<ArrowUpRight /></Link></Button>
          <a href="#ideas" className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-medium text-white/90 hover:text-white">{copy.browse}<ArrowDown className="size-4" /></a>
        </div>
        <svg viewBox="0 0 240 240" fill="none" className="pointer-events-none absolute -bottom-16 -right-12 size-64 text-white/[0.055]" aria-hidden="true"><rect x="30" y="35" width="175" height="160" rx="14" stroke="currentColor" strokeWidth="10" /><path d="M30 90h175M30 145h175M102 63h30M102 118h30M102 172h30" stroke="currentColor" strokeWidth="10" strokeLinecap="round" /></svg>
      </div>
      <div className="relative flex flex-col justify-center bg-[var(--brand-paper)] p-6 sm:p-8 lg:p-9">
        <div className="mb-4 flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-semibold text-primary"><span className="size-1.5 rounded-full bg-primary" />{featured ? copy.waiting : copy.waitingFirst}</p><Sprout className="size-5 text-primary/60" /></div>
        {featured ? <div className="featured-paper relative rounded-2xl border border-[var(--brand-paper-border)] bg-background p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2"><StatusBadge status={featured.status} />{featured.card.isSeed && <span className="text-xs text-muted-foreground">{copy.example}</span>}<span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{featured.card.place || t.explore.wolgye}</span></div>
          <h2 className="line-clamp-2 text-[23px] font-semibold leading-snug tracking-tight">{featured.card.title}</h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{featured.card.body}</p>
          <div className="mt-5 flex items-center gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><MessageCircle className="size-3.5" />{copy.responsesCount(num(featured.reactionCount))}</span><span>{copy.opinionsCount(num(featured.opinionCount))}</span></div>
          <Button asChild className="mt-5 h-11 w-full rounded-xl text-sm"><Link href={`/cards/${featured.card.id}`}>{copy.contribute}<ArrowRight /></Link></Button>
        </div> : <div className="rounded-2xl border border-dashed border-[var(--brand-paper-border)] bg-background/60 p-7"><BrandMark className="mb-4 size-10 text-primary" /><h2 className="text-xl font-semibold">{copy.emptyHeading}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.emptyIntro}</p><Button asChild variant="outline" className="mt-5"><Link href="/new">{copy.firstIdea}<ArrowRight /></Link></Button></div>}
      </div>
    </section>
    <div className="grid grid-cols-3 gap-3 border-b border-border/70 px-1 pb-7 pt-1 sm:gap-6 sm:px-3">
      {stats.map(s => <div key={s.label}><p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p><p className="mt-2 flex items-baseline gap-1.5"><span className="tnum text-[28px] font-semibold leading-none tracking-tight sm:text-[34px]">{num(s.value)}</span><span className="text-xs text-muted-foreground">{s.suffix}</span></p></div>)}
      <p className="col-span-3 text-[11px] text-muted-foreground">{copy.statsHint}</p>
    </div>
    {child && parent ? <section aria-label={copy.lineage} className="flex flex-col gap-5 rounded-2xl border border-primary/15 bg-[var(--brand-soft)] p-5 sm:p-6 xl:flex-row xl:items-center">
      <div className="xl:w-52 xl:shrink-0"><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary"><RotateCcw className="size-3.5" />{copy.restarted}</p><h2 className="text-lg font-semibold tracking-tight">{copy.recordHeading}<br className="hidden xl:block" />{copy.recordHeadingEnd}</h2></div>
      <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <Link href={`/cards/${parent.card.id}`} className="rounded-xl border border-border/60 bg-background/70 p-4 transition-colors hover:border-primary/40"><p className="mb-2 text-[11px] font-medium text-muted-foreground">{copy.previous}</p><p className="line-clamp-1 text-sm font-semibold">{parent.card.title}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{parent.latest?.reason || copy.preserved}</p></Link>
        <ArrowRight aria-hidden="true" className="hidden size-4 text-primary sm:block" />
        <Link href={`/cards/${child.card.id}`} className="rounded-xl border border-primary/20 bg-background p-4 transition-colors hover:border-primary/60"><p className="mb-2 flex items-center justify-between text-[11px] font-semibold text-primary">{copy.next}<ArrowUpRight className="size-3.5" /></p><p className="line-clamp-1 text-sm font-semibold">{child.card.title}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{child.card.takeoverNote || copy.takenOver}</p></Link>
      </div>
    </section> : <div className="grid gap-4 rounded-2xl bg-[var(--brand-soft)] p-5 sm:grid-cols-3 sm:p-6">{copy.steps.map(([n, title, body]) => <div key={n}><span className="text-xs font-semibold text-primary">{n}</span><p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">{title}{n === "03" && <Check className="size-3.5 text-primary" />}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p></div>)}</div>}
  </>;
}
