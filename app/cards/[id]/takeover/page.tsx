import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCard } from "@/lib/queries";
import { canTakeOver } from "@/lib/domain/status";
import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import { NewCardForm } from "@/app/new/new-card-form";
import { ButtonLink, StatusBadge } from "@/components/ui";

export default async function TakeoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getT();
  const { id } = await params;
  const d = await getCard(id);
  if (!d || d.card.hidden) notFound();
  if (!canTakeOver(d.status)) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-8 py-20 text-center">
        <p className="text-lg font-extrabold">{t.intake.cannotTakeover}</p>
        <ButtonLink href={`/cards/${id}`} variant="secondary">{t.intake.return}</ButtonLink>
      </div>
    );
  }
  return (
    <div className="mx-auto grid w-full max-w-[1200px] items-start gap-10 px-8 pt-8 lg:grid-cols-[380px_minmax(0,1fr)]">
     <aside className="space-y-4 lg:sticky lg:top-24">
      <h1 className="text-[34px] font-black tracking-[-0.04em]">{t.intake.takeover}</h1>
      <p className="text-[15px] text-muted-foreground">{t.intake.takeoverIntro}</p>
      <Link href={`/cards/${d.card.id}`} className="block rounded-[22px] bg-muted p-5 transition-colors hover:bg-[var(--muted-hover)]">
        <div className="flex items-center gap-2"><StatusBadge status={d.status} /><span className="min-w-0 flex-1 truncate text-[15px] font-bold">{d.card.title}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></div>
        {d.latest && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t.common.decisions[d.latest.decision]}{d.latest.reasonTags.length > 0 && ` · ${d.latest.reasonTags.map((tag) => pick(t.common.barriers, tag, tag)).join(", ")}`}{d.latest.reason && ` · ${d.latest.reason}`}
          </p>
        )}
        <p className="tnum mt-2 text-xs text-[var(--text-4)]">{t.intake.connections(d.reactionCount, d.opinions.length)}</p>
      </Link>
     </aside>
     <div className="min-w-0">
      <NewCardForm parent={{ id: d.card.id, title: d.card.title, body: d.card.body, target: d.card.target, place: d.card.place, effect: d.card.effect, problem: d.card.problem, topic: d.card.topic }} />
     </div>
    </div>
  );
}
