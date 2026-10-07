"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { createDraft, publishCard, type ActionState } from "@/app/actions";
import { FormMessage, StatusBadge, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form-submit";
import type { CardStatus } from "@/lib/domain/types";

type Similar = { id: string; title: string; status: CardStatus; reactionCount: number; reason: string | null };

export function NewCardForm({ parent }: { parent?: { id: string; title: string; body: string; target: string; place: string; effect: string } }) {
  const [text, setText] = useState(parent?.body ?? "");
  const [draft, setDraft] = useState<null | { title: string; target: string; place: string; effect: string; source: string }>(
    parent ? { title: parent.title, target: parent.target, place: parent.place, effect: parent.effect, source: "takeover" } : null,
  );
  const [similar, setSimilar] = useState<Similar[]>([]);
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
      setSimilar(r.similar.filter((s) => s.id !== parent?.id));
    });

  return (
    <div className="space-y-8">
      {!parent && (
        <section className="rounded-2xl border border-border/80 bg-white p-5 ">
          <label htmlFor="text" className="mb-2 block text-sm font-medium">1. 아이디어를 자유롭게 적어 주세요</label>
          <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="예) 광운로 공터에서 주말마다 주민 플리마켓을 열면 좋겠어요." className={inputCls} />
          <div className="mt-3 flex items-center gap-3">
            <Button type="button" onClick={runDraft} disabled={pending || text.trim().length < 10} className={btnSecondary}>
              {pending ? "정리하는 중…" : "초안으로 정리하기"}
            </Button>
            {draftError && <p className="text-sm text-[var(--stop-fg)]">{draftError}</p>}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="rounded-lg bg-subtle p-5 ring-line">
          <h2 className="text-sm font-semibold">비슷한 과거 카드가 있어요</h2>
          <p className="mt-1 text-sm text-ink-2">같은 내용이면 기존 카드에 반응을 더하거나, 멈춘 카드를 이어받을 수 있어요.</p>
          <ul className="mt-3 space-y-2">
            {similar.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-md bg-white px-3 py-2.5 ring-line">
                <StatusBadge status={s.status} />
                <Link href={`/cards/${s.id}`} className="flex-1 text-sm font-medium hover:underline">{s.title}</Link>
                <span className="tnum font-mono text-[12px] text-ink-3">반응 {s.reactionCount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {draft && (
        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-primary/20 bg-white p-5 ">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{parent ? "이어받을 카드 내용" : "2. 정리된 초안을 확인하고 고쳐 주세요"}</h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{draft.source === "llm" ? "AI 초안 · 확인 필요" : draft.source === "rule" ? "자동 정리 · 확인 필요" : "원본 연결"}</span>
          </div>
          {parent && <input type="hidden" name="parentId" value={parent.id} />}
          <Field label="제목" name="title" defaultValue={draft.title} required />
          <div className="space-y-1.5">
            <label htmlFor="body" className="block text-sm font-medium">아이디어 원문</label>
            <Textarea id="body" name="body" defaultValue={text} rows={4} className={inputCls} required />
          </div>
          <div className="grid gap-4 ">
            <Field label="대상" name="target" defaultValue={draft.target} />
            <Field label="장소" name="place" defaultValue={draft.place} />
            <Field label="기대 효과" name="effect" defaultValue={draft.effect} />
          </div>
          {parent && (
            <div className="space-y-1.5">
              <label htmlFor="takeoverNote" className="block text-sm font-medium">멈춘 사유에 대해 무엇이 달라졌나요? (필수)</label>
              <Textarea id="takeoverNote" name="takeoverNote" rows={2} placeholder="예) 광운대 학생팀이 운영을 맡습니다." className={inputCls} required />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="weeks" className="block text-sm font-medium">검증 기간</label>
            <select id="weeks" name="weeks" defaultValue="2" className={inputCls}>
              {[1, 2, 3, 4, 6, 8].map((w) => (
                <option key={w} value={w}>{w}주</option>
              ))}
            </select>
          </div>
          <FormMessage state={state} />
          <Button type="submit" disabled={publishing} className={`${btnPrimary} w-full `}>
            {publishing ? "게시하는 중…" : parent ? "이어받아 다시 검증 시작" : "검증 카드 게시"}
          </Button>
        </form>
      )}
    </div>
  );
}

function Field({ label, name, defaultValue, required }: { label: string; name: string; defaultValue: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium">{label}</label>
      <Input id={name} name={name} defaultValue={defaultValue} required={required} className={inputCls} />
    </div>
  );
}
