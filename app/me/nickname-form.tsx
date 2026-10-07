"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { useActionState } from "react";
import { setNickname, type ActionState } from "@/app/actions";
import { FormMessage, inputCls } from "@/components/ui";

export function NicknameForm({ nickname }: { nickname: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setNickname, { ok: true });
  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2">
        <Input name="nickname" defaultValue={nickname} aria-label="닉네임" className={`${inputCls} min-w-0 flex-1 rounded-full`} />
        <Button type="submit" disabled={pending} className="h-12 px-6">저장</Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
