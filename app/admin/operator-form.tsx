"use client";

import { useActionState } from "react";
import { enterOperator, type ActionState } from "@/app/actions";
import { FormMessage, btnPrimary, inputCls } from "@/components/ui";

export function OperatorForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(enterOperator, { ok: true });
  return (
    <form action={action} className="space-y-3">
      <input name="code" type="password" placeholder="운영 코드" aria-label="운영 코드" className={inputCls} />
      <FormMessage state={state} />
      <button disabled={pending} className={btnPrimary}>들어가기</button>
    </form>
  );
}
