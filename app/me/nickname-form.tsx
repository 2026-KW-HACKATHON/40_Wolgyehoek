"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { useActionState } from "react";
import { setNickname, type ActionState } from "@/app/actions";
import { FormMessage, btnSecondary, inputCls } from "@/components/ui";

export function NicknameForm({ nickname }: { nickname: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setNickname, { ok: true });
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Input name="nickname" defaultValue={nickname} aria-label="닉네임" className={`${inputCls} max-w-[220px]`} />
      <Button type="submit" disabled={pending} className={btnSecondary}>닉네임 저장</Button>
      <FormMessage state={state} />
    </form>
  );
}
