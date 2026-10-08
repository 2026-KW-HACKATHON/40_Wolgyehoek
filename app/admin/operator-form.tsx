"use client";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { useActionState } from "react";
import { enterOperator, type ActionState } from "@/app/actions";
import { FormMessage, btnPrimary, inputCls } from "@/components/ui";
import { createInstitution, type InstitutionState } from "@/app/org-actions";

export function OperatorForm() { const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>(enterOperator, { ok: true });
  return (
    <form action={action} className="space-y-3">
      <Input name="code" type="password" placeholder={t.system.operatorCode} aria-label={t.system.operatorCode} className={inputCls} />
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className={btnPrimary}>{t.system.enter}</Button>
    </form>
  );
}

export function CreateInstitutionForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<InstitutionState, FormData>(
    (_, form) => createInstitution(form), { ok: true });
  return <form action={action} className="space-y-3">
    <label htmlFor="institution-name" className="block text-sm font-semibold">{t.org.name}</label>
    <Input id="institution-name" name="name" required maxLength={100} className={inputCls} />
    <FormMessage state={state} />
    {state.ok && state.code && <div role="status" className="space-y-2 rounded-2xl bg-muted p-4">
      <p className="break-words text-sm font-bold">{state.name}</p>
      <p className="select-all font-mono text-xl font-bold tracking-widest">{state.code}</p>
      <p className="text-sm text-muted-foreground">{t.org.codeOnce}</p>
    </div>}
    <Button type="submit" disabled={pending}>{pending ? t.org.saving : t.org.create}</Button>
  </form>;
}
