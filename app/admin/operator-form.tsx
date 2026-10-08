"use client";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { useActionState } from "react";
import { enterOperator, type ActionState } from "@/app/actions";
import { FormMessage, btnPrimary, inputCls } from "@/components/ui";

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
