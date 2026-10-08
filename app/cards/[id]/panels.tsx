"use client";
import { useI18n } from "@/lib/i18n/client";
import { pick } from "@/lib/i18n/messages/common";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { announceSuccess, endIdea } from "@/app/credit-actions";
import { addOpinion, flagTarget, publishReport, recordConclusion, upsertReaction, type ActionState } from "@/app/actions";
import { isInsideWolgye1 } from "@/lib/domain/geo";
import { REASON_TAGS, type RespondentType } from "@/lib/domain/types";
import { FormMessage, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form-submit";

const init: ActionState = { ok: true };

export function ReactionPanel({ cardId, open, counts, mine }: { cardId: string; open: boolean; counts: number[]; mine: { step: number; price: number | null; respondentType: RespondentType } | null }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>(upsertReaction.bind(null, cardId), init);
  const [step, setStep] = useState<number>(mine?.step ?? 0);
  const [type, setType] = useState<RespondentType | "">(mine?.respondentType ?? "");
  const [geo, setGeo] = useState<"" | "true" | "false">("");
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const onSubmit = useFormSubmit(action);

  const checkGeo = () => {
    if (!("geolocation" in navigator)) return setGeoMsg(t.card.geoUnsupported);
    setGeoMsg(t.card.geoChecking);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const inside = isInsideWolgye1(p.coords.latitude, p.coords.longitude);
        setGeo(inside ? "true" : "false");
        setGeoMsg(inside ? t.card.geoInside : t.card.geoOutside);
      },
      () => setGeoMsg(t.card.geoFailed),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  if (!open) {
    return <p className="py-2 text-sm text-[var(--text-4)]">{t.card.closed}</p>;
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset>
        <legend className="sr-only">{t.card.demandStrength}</legend>
        <div className="grid grid-cols-2 gap-2 ">
          {t.common.steps.map((label, i) => {
            const s = i + 1;
            const on = step === s;
            return (
              <label key={s} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 relative flex min-h-[68px] cursor-pointer flex-col justify-between rounded-2xl p-3.5 text-sm transition-colors ${on ? "bg-[var(--brand-soft)] ring-2 ring-primary" : "bg-muted hover:bg-[var(--muted-hover)]"}`}>
                <input type="radio" name="step" value={s} checked={on} onChange={() => setStep(s)} className="sr-only" />
                <span className="font-bold">{label}</span>
                <span className="tnum text-xs text-muted-foreground">{t.card.people(counts[i])}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {step === 3 && (
        <div className="space-y-1.5">
          <label htmlFor="price" className="block text-sm font-semibold text-muted-foreground">{t.card.price}</label>
          <Input id="price" name="price" inputMode="numeric" defaultValue={mine?.price ?? ""} placeholder={t.card.priceExample} className={inputCls} />
        </div>
      )}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-muted-foreground">{t.card.respondent}</legend>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(Object.keys(t.common.respondents) as RespondentType[]).map((k) => (
            <label key={k} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-sm font-bold ${type === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              <input type="radio" name="respondentType" value={k} checked={type === k} onChange={() => setType(k)} className="sr-only" />
              {t.common.respondents[k]}
            </label>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="soft" size="sm" type="button" onClick={checkGeo}>{t.card.checkLocation}</Button>
          {geoMsg && <span className="text-xs text-muted-foreground">{geoMsg}</span>}
        </div>
        <input type="hidden" name="geoInside" value={geo} />
      </fieldset>
      <FormMessage state={state} />
      <Button type="submit" size="lg" disabled={pending || !step || !type} className="w-full">{pending ? t.card.saving : mine ? t.card.editReaction : t.card.addReaction}</Button>
    </form>
  );
}

export function OpinionForm({ cardId, targets }: { cardId: string; targets?: { id: string; label: string }[] }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>((prev, form) => addOpinion(String(form.get("target") || cardId), prev, form), init);
  const [stance, setStance] = useState("pro");
  const onSubmit = useFormSubmit(action);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state.ok && state.message && formRef.current) {
      for (const field of Array.from(formRef.current.elements)) {
        if (field instanceof HTMLTextAreaElement || (field instanceof HTMLInputElement && field.type === "text")) field.value = "";
      }
      if (targets) router.refresh();
    }
  }, [state, targets, router]);
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      {targets && <select name="target" defaultValue={cardId} aria-label={t.card.opinionTarget} className={`${inputCls} cursor-pointer font-semibold`}>
        {targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>}
      <div className="flex gap-1 rounded-full bg-muted p-1">
        {[["pro", t.card.agree], ["con", t.card.counterpoint], ["conditional", t.card.improve]].map(([k, l]) => (
          <label key={k} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 flex-1 cursor-pointer whitespace-nowrap rounded-full px-3 py-2 text-center text-sm font-bold ${stance === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            <input type="radio" name="stance" value={k} checked={stance === k} onChange={() => setStance(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      <Textarea name="body" rows={2} placeholder={t.card.opinionPlaceholder} className={inputCls} />
      {stance === "conditional" && <Input name="condition" placeholder={t.card.conditionPlaceholder} className={inputCls} />}
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className={btnSecondary}>{pending ? t.card.saving : t.card.addOpinion}</Button>
    </form>
  );
}

export function ReportPublishForm({ cardId }: { cardId: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>(publishReport.bind(null, cardId), init);
  const onSubmit = useFormSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t border-divider pt-4">
      <label htmlFor="summary" className="block text-sm font-semibold text-muted-foreground">{t.card.summary}</label>
      <Textarea id="summary" name="summary" rows={2} placeholder={t.card.summaryPlaceholder} className={inputCls} />
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className={btnPrimary}>{pending ? t.card.publishing : t.card.publishReport}</Button>
    </form>
  );
}

export function ConclusionForm({ cardId }: { cardId: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>(recordConclusion.bind(null, cardId), init);
  const [decision, setDecision] = useState("hold");
  const onSubmit = useFormSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[22px] border border-border p-5">
      <p className="text-[15px] font-extrabold">{t.card.recordConclusion}</p>
      <div className="flex gap-1 rounded-full bg-muted p-1">
        {[["go", t.card.go], ["hold", t.card.hold], ["stop", t.card.stop]].map(([k, l]) => (
          <label key={k} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-sm font-bold ${decision === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            <input type="radio" name="decision" value={k} checked={decision === k} onChange={() => setDecision(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {REASON_TAGS.map((tag) => (
          <label key={tag} className="has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3.5 py-2 text-xs font-bold has-[:checked]:bg-foreground has-[:checked]:text-white">
            <input type="checkbox" name="reasonTags" value={tag} className="sr-only" />
            {pick(t.common.barriers, tag, tag)}
          </label>
        ))}
      </div>
      <Textarea name="reason" rows={2} placeholder={decision === "go" ? t.card.nextStep : t.card.stopReason} className={inputCls} />
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className={btnPrimary}>{pending ? t.card.saving : t.card.recordConclusion}</Button>
    </form>
  );
}

export function FlagForm({ targetType, targetId, cardId, label }: { targetType: "card" | "opinion"; targetId: string; cardId: string; label?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(flagTarget.bind(null, targetType, targetId, cardId), init);
  if (!open) return <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(true)} className="-ml-3 mt-1 h-8 min-h-8 text-xs font-medium text-[var(--text-4)]">{label ?? t.card.flag}</Button>;
  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <Input name="reason" placeholder={t.card.flagReason} variant="soft" size="sm" className="min-w-0 flex-1 rounded-full" />
      <Button variant="soft" size="sm" type="submit" disabled={pending}>{t.card.submitFlag}</Button>
      <FormMessage state={state} />
    </form>
  );
}

export function OwnerControls({ cardId, open, succeeded, pledges }: { cardId: string; open: boolean; succeeded: boolean; pledges: number }) {
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();
  const run = (job: () => Promise<{ ok: true } | { ok: false; error: string }>, done: string) => start(async () => {
    const r = await job();
    setMsg(r.ok ? { ok: true, text: done } : { ok: false, text: r.error });
    if (r.ok) { setConfirm(false); setNote(""); router.refresh(); }
  });
  return (
    <div className="space-y-3">
      {succeeded && (
        <div className="rounded-2xl bg-[var(--brand-soft)] p-4">
          <label htmlFor="success-note" className="sr-only">{t.card.schedule}</label>
          <Textarea id="success-note" rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.card.schedulePlaceholder} className="rounded-2xl border-0 bg-background px-4 py-3 text-[15px]" />
          <Button disabled={pending || note.trim().length < 2} onClick={() => run(() => announceSuccess(cardId, note), t.card.announced)} className="mt-2 w-full"><Send />{t.card.notify(pledges)}</Button>
        </div>
      )}
      {open && (confirm
        ? <div className="grid grid-cols-2 gap-2"><Button variant="soft" disabled={pending} onClick={() => setConfirm(false)}>{t.card.cancel}</Button><Button disabled={pending} onClick={() => run(() => endIdea(cardId), t.card.ended)} className="bg-none bg-foreground">{t.card.end}</Button></div>
        : <Button variant="soft" disabled={pending} onClick={() => setConfirm(true)} className="w-full">{t.card.closeRecruitment}</Button>)}
      {msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-sm font-bold text-primary" : "text-sm text-destructive"}>{msg.text}</p>}
    </div>
  );
}
