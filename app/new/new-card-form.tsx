"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { createDraft, publishCard, type ActionState } from "@/app/actions";
import { FormMessage, StatusBadge, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form-submit";
import { MediaPicker, type PickedMedia } from "@/components/MediaPicker";
import type { CardStatus } from "@/lib/domain/types";

type Similar = { id: string; title: string; status: CardStatus; reactionCount: number; reason: string | null };

export function NewCardForm({ parent }: { parent?: { id: string; title: string; body: string; target: string; place: string; effect: string } }) {
  const [text, setText] = useState(parent?.body ?? "");
  const [draft, setDraft] = useState<null | { title: string; target: string; place: string; effect: string; source: string }>(
    parent ? { title: parent.title, target: parent.target, place: parent.place, effect: parent.effect, source: "takeover" } : null,
  );
  const [similar, setSimilar] = useState<Similar[]>([]);
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
      setSimilar(r.similar.filter((s) => s.id !== parent?.id));
    });

  return (
    <div className="space-y-8">
      {!parent && (
        <section>
          <label htmlFor="text" className="sr-only">아이디어</label>
          <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="우리 동네에 이런 게 있다면?" className={`${inputCls} rounded-[22px] p-5 text-[17px] leading-7`} />
          <div className="mt-3">{picker}</div>
          <Button type="button" onClick={runDraft} disabled={pending || text.trim().length < 10} className={`${draft ? btnSecondary : btnPrimary} mt-3 w-full`}>
            {pending ? "정리하는 중…" : draft ? "다시 정리하기" : "카드로 만들기"}
          </Button>
          {draftError && <p className="mt-2 text-sm text-[var(--stop-fg)]">{draftError}</p>}
        </section>
      )}

      {similar.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-extrabold tracking-tight">비슷한 카드</h2>
          <ul className="divide-y divide-border">
            {similar.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <StatusBadge status={s.status} />
                <Link href={`/cards/${s.id}`} className="min-w-0 flex-1 truncate text-[15px] font-bold hover:text-primary">{s.title}</Link>
                <span className="tnum shrink-0 text-xs text-[var(--text-4)]">반응 {s.reactionCount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {draft && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">{parent ? "새 카드" : "초안"}</h2>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{draft.source === "llm" ? "AI" : draft.source === "rule" ? "자동" : "원본 연결"}</span>
          </div>
          {parent && <input type="hidden" name="parentId" value={parent.id} />}
          {media.flatMap((m) => m.id && !m.error ? [<input key={m.key} type="hidden" name="mediaIds" value={m.id} />] : [])}
          {parent && picker}
          <Field label="제목" name="title" defaultValue={draft.title} required />
          <div className="space-y-1.5">
            <label htmlFor="body" className="block text-sm font-semibold text-muted-foreground">내용</label>
            <Textarea id="body" name="body" defaultValue={text} rows={4} className={inputCls} required />
          </div>
          <div className="grid gap-4">
            <Field label="대상" name="target" defaultValue={draft.target} />
            <Field label="장소" name="place" defaultValue={draft.place} />
            <Field label="기대 효과" name="effect" defaultValue={draft.effect} />
          </div>
          {parent && (
            <div className="space-y-1.5">
              <label htmlFor="takeoverNote" className="block text-sm font-semibold text-muted-foreground">달라진 점</label>
              <Textarea id="takeoverNote" name="takeoverNote" rows={2} placeholder="예) 광운대 학생팀이 운영을 맡습니다." className={inputCls} required />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="weeks" className="block text-sm font-semibold text-muted-foreground">기간</label>
            <select id="weeks" name="weeks" defaultValue="2" className={`${inputCls} appearance-none`}>
              {[1, 2, 3, 4, 6, 8].map((w) => (
                <option key={w} value={w}>{w}주</option>
              ))}
            </select>
          </div>
          <FormMessage state={state} />
          <Button type="submit" size="lg" disabled={publishing || uploading} className="w-full">
            {publishing ? "게시하는 중…" : uploading ? "올리는 중…" : parent ? "이어받기" : "게시"}
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
