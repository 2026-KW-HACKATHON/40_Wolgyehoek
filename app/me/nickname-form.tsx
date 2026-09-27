"use client";

import { useActionState } from "react";
import { setNickname, type ActionState } from "@/app/actions";
import { FormMessage, btnSecondary, inputCls } from "@/components/ui";

export function NicknameForm({ nickname }: { nickname: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setNickname, { ok: true });
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input name="nickname" defaultValue={nickname} aria-label="닉네임" className={`${inputCls} max-w-[220px]`} />
      <button disabled={pending} className={btnSecondary}>닉네임 저장</button>
      <FormMessage state={state} />
    </form>
  );
}
