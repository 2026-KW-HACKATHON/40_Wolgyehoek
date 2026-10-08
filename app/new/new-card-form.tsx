"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { useActionState, useState, useTransition } from "react";
import { createDraft, publishCard, type ActionState } from "@/app/actions";
import { FormMessage, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { IdeaLineage } from "@/components/IdeaLineage";
import type { IdeaCheck } from "@/lib/domain/ideas";
import { useFormSubmit } from "@/components/use-form-submit";
import { MediaPicker, type PickedMedia } from "@/components/MediaPicker";
import { useI18n } from "@/lib/i18n/client";
import { TOPICS, type Topic } from "@/lib/domain/types";

export function NewCardForm({ parent }: { parent?: { id: string; title: string; body: string; target: string; place: string; effect: string; problem: string; topic: string } }) {
  const { t } = useI18n();
  const [text, setText] = useState(parent?.body ?? "");
  const [draft, setDraft] = useState<null | { title: string; target: string; place: string; effect: string; source: string }>(
    parent ? { title: parent.title, target: parent.target, place: parent.place, effect: parent.effect, source: "takeover" } : null,
  );
  const [check, setCheck] = useState<IdeaCheck | null>(null);
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const uploading = media.some((m) => !m.id && !m.error);
  const picker = <MediaPicker items={media} onChange={setMedia} />;
  const [draftError, setDraftError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [state, formAction, publishing] = useActionState<ActionState, FormData>(publishCard, { ok: true });
  const onSubmit = useFormSubmit(formAction);

  const runDraft = () =>
    startTransition(async () => {
      setDraftError(null);
      const r = await createDraft(text);
      if (!r.ok) return setDraftError(r.error);
      setDraft(r.draft);
      setCheck(r.check);
    });

  return (
    <div className="space-y-8">
      {!parent && (
        <section>
          <label htmlFor="text" className="sr-only">{t.intake.idea}</label>
          <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={t.intake.newPlaceholder} className={`${inputCls} rounded-[22px] p-5 text-[17px] leading-7`} />
          <div className="mt-3">{picker}</div>
          <Button type="button" onClick={runDraft} disabled={pending || text.trim().length < 10} className={`${draft ? btnSecondary : btnPrimary} mt-3 w-full`}>
            {pending ? t.intake.drafting : draft ? t.intake.redraft : t.intake.makeCard}
          </Button>
          {draftError && <p className="mt-2 text-sm text-[var(--stop-fg)]">{draftError}</p>}
        </section>
      )}

      {check && <IdeaLineage check={check} mode="draft" />}

      {draft && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">{parent ? t.intake.newCard : t.intake.draft}</h2>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{draft.source === "llm" ? "AI" : draft.source === "rule" ? t.intake.automatic : t.intake.originalLink}</span>
          </div>
          {parent && <input type="hidden" name="parentId" value={parent.id} />}
          {media.flatMap((m) => m.id && !m.error ? [<input key={m.key} type="hidden" name="mediaIds" value={m.id} />] : [])}
          {parent && picker}
          <div className="space-y-1.5">
            <label htmlFor="problem" className="block text-sm font-semibold text-muted-foreground">{t.intake.whichProblem}</label>
            <Input id="problem" name="problem" defaultValue={parent?.problem ?? ""} maxLength={80} placeholder={t.intake.problemPlaceholder} className={inputCls} required />
          </div>
          <fieldset>
            <legend className="mb-2 block text-sm font-semibold text-muted-foreground">{t.intake.topic}</legend>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TOPICS) as Topic[]).map((topic) => (
                <label key={topic} className="cursor-pointer rounded-full bg-muted px-3.5 py-2 text-sm font-bold text-muted-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
                  <input type="radio" name="topic" value={topic} defaultChecked={parent?.topic === topic} className="sr-only" required />
                  {t.common.topics[topic]}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label={t.intake.solution} name="title" defaultValue={draft.title} required />
          <div className="space-y-1.5">
            <label htmlFor="body" className="block text-sm font-semibold text-muted-foreground">{t.intake.content}</label>
            <Textarea id="body" name="body" defaultValue={text} rows={4} className={inputCls} required />
          </div>
          <div className="grid gap-4">
            <Field label={t.intake.target} name="target" defaultValue={draft.target} />
            <Field label={t.intake.place} name="place" defaultValue={draft.place} />
            <Field label={t.intake.effect} name="effect" defaultValue={draft.effect} />
          </div>
          {parent && (
            <div className="space-y-1.5">
              <label htmlFor="takeoverNote" className="block text-sm font-semibold text-muted-foreground">{t.intake.changes}</label>
              <Textarea id="takeoverNote" name="takeoverNote" rows={2} placeholder={t.intake.changesPlaceholder} className={inputCls} required />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="weeks" className="block text-sm font-semibold text-muted-foreground">{t.intake.period}</label>
            <select id="weeks" name="weeks" defaultValue="2" className={`${inputCls} appearance-none`}>
              {[1, 2, 3, 4, 6, 8].map((w) => (
                <option key={w} value={w}>{t.intake.weeks(w)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="goal" className="block text-sm font-semibold text-muted-foreground">{t.intake.openingGoal}</label>
            <Input id="goal" name="goal" type="number" inputMode="numeric" min={2} max={1000} defaultValue={30} className={inputCls} required />
          </div>
          <FormMessage state={state} />
          <Button type="submit" size="lg" disabled={publishing || uploading} className="w-full">
            {publishing ? t.intake.posting : uploading ? t.intake.uploading : parent ? t.intake.takeover : t.intake.publish}
          </Button>
        </form>
      )}
    </div>
  );
}

function Field({ label, name, defaultValue, required }: { label: string; name: string; defaultValue: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-muted-foreground">{label}</label>
      <Input id={name} name={name} defaultValue={defaultValue} required={required} className={inputCls} />
    </div>
  );
}
