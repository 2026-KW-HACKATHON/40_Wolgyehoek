"use client";

import { useActionState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { enterInstitution, saveInstitutionResponse } from "@/app/org-actions";
import type { ActionState } from "@/app/actions";
import type { InstitutionResponse, InstitutionStance } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormMessage, inputCls } from "@/components/ui";

export function InstitutionEntryForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>(
    (_, form) => enterInstitution(String(form.get("code") ?? "")), { ok: true });
  return <form action={action} className="space-y-3">
    <label htmlFor="institution-code" className="block text-sm font-semibold">{t.org.code}</label>
    <Input id="institution-code" name="code" autoComplete="off" required maxLength={10} className={inputCls} />
    <FormMessage state={state} />
    <Button type="submit" disabled={pending}>{pending ? t.org.saving : t.org.enter}</Button>
  </form>;
}

export function InstitutionResponseForm({ cardId, name, existing }: { cardId: string; name: string; existing?: InstitutionResponse }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>(
    (_, form) => saveInstitutionResponse(cardId, form), { ok: true });
  const stances: InstitutionStance[] = ["EMPATHY", "SUPPORT", "PARTNER"];
  return <form action={action} className="mt-4 space-y-3 rounded-2xl bg-muted p-4">
    <p className="break-words text-sm font-bold">{name}</p>
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">{t.org.stance}</legend>
      {stances.map(stance => <label key={stance} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-background px-3 py-2 text-sm font-medium">
        <input type="radio" name="stance" value={stance} defaultChecked={stance === (existing?.stance ?? "EMPATHY")} required className="accent-primary" />
        {t.org.stances[stance]}
      </label>)}
    </fieldset>
    <label htmlFor={`institution-comment-${cardId}`} className="block text-sm font-semibold">{t.org.comment}</label>
    <Textarea id={`institution-comment-${cardId}`} name="comment" rows={3} required minLength={2} maxLength={500} defaultValue={existing?.comment ?? ""} placeholder={t.org.placeholder} className={inputCls} />
    <FormMessage state={state} />
    <Button type="submit" disabled={pending}>{pending ? t.org.saving : t.org.submit}</Button>
  </form>;
}
