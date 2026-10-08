"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { announceSuccess, endIdea } from "@/app/credit-actions";
import { addOpinion, flagTarget, publishReport, recordConclusion, upsertReaction, type ActionState } from "@/app/actions";
import { isInsideWolgye1 } from "@/lib/domain/geo";
import { REASON_TAGS, RESPONDENT_LABELS, STEP_LABELS, type RespondentType } from "@/lib/domain/types";
import { FormMessage, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form-submit";

const init: ActionState = { ok: true };

export function ReactionPanel({ cardId, open, counts, mine }: { cardId: string; open: boolean; counts: number[]; mine: { step: number; price: number | null; respondentType: RespondentType } | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(upsertReaction.bind(null, cardId), init);
  const [step, setStep] = useState<number>(mine?.step ?? 0);
  const [type, setType] = useState<RespondentType | "">(mine?.respondentType ?? "");
  const [geo, setGeo] = useState<"" | "true" | "false">("");
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const onSubmit = useFormSubmit(action);

  const checkGeo = () => {
    if (!("geolocation" in navigator)) return setGeoMsg("이 브라우저는 위치 확인을 지원하지 않아요.");
    setGeoMsg("위치 확인 중…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const inside = isInsideWolgye1(p.coords.latitude, p.coords.longitude);
        setGeo(inside ? "true" : "false");
        setGeoMsg(inside ? "월계1동 안에 있어요. 좌표는 저장하지 않아요." : "월계1동 밖이에요. 응답은 그대로 받을게요.");
      },
      () => setGeoMsg("위치를 확인하지 못했어요. 본인 선택만 저장돼요."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  if (!open) {
    return <p className="py-2 text-sm text-[var(--text-4)]">검증 종료</p>;
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset>
        <legend className="sr-only">수요의 강도</legend>
        <div className="grid grid-cols-2 gap-2 ">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const on = step === s;
            return (
              <label key={s} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 relative flex min-h-[68px] cursor-pointer flex-col justify-between rounded-2xl p-3.5 text-sm transition-colors ${on ? "bg-[var(--brand-soft)] ring-2 ring-primary" : "bg-muted hover:bg-[var(--muted-hover)]"}`}>
                <input type="radio" name="step" value={s} checked={on} onChange={() => setStep(s)} className="sr-only" />
                <span className="font-bold">{label}</span>
                <span className="tnum text-xs text-muted-foreground">{counts[i]}명</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {step === 3 && (
        <div className="space-y-1.5">
          <label htmlFor="price" className="block text-sm font-semibold text-muted-foreground">희망 가격 (원)</label>
          <Input id="price" name="price" inputMode="numeric" defaultValue={mine?.price ?? ""} placeholder="예) 5000" className={inputCls} />
        </div>
      )}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-muted-foreground">나는 월계1동에서</legend>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(Object.keys(RESPONDENT_LABELS) as RespondentType[]).map((k) => (
            <label key={k} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-sm font-bold ${type === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              <input type="radio" name="respondentType" value={k} checked={type === k} onChange={() => setType(k)} className="sr-only" />
              {RESPONDENT_LABELS[k]}
            </label>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="soft" size="sm" type="button" onClick={checkGeo}>위치 확인</Button>
          {geoMsg && <span className="text-xs text-muted-foreground">{geoMsg}</span>}
        </div>
        <input type="hidden" name="geoInside" value={geo} />
      </fieldset>
      <FormMessage state={state} />
      <Button type="submit" size="lg" disabled={pending || !step || !type} className="w-full">{pending ? "저장 중…" : mine ? "반응 수정" : "반응 남기기"}</Button>
    </form>
  );
}

export function OpinionForm({ cardId }: { cardId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addOpinion.bind(null, cardId), init);
  const [stance, setStance] = useState("pro");
  const onSubmit = useFormSubmit(action);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && state.message && formRef.current) {
      for (const field of Array.from(formRef.current.elements)) {
        if (field instanceof HTMLTextAreaElement || (field instanceof HTMLInputElement && field.type === "text")) field.value = "";
      }
    }
  }, [state]);
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-1 rounded-full bg-muted p-1">
        {[["pro", "공감"], ["con", "반론"], ["conditional", "보완"]].map(([k, l]) => (
          <label key={k} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-sm font-bold ${stance === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            <input type="radio" name="stance" value={k} checked={stance === k} onChange={() => setStance(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      <Textarea name="body" rows={2} placeholder="의견을 남겨 주세요" className={inputCls} />
      {stance === "conditional" && <Input name="condition" placeholder="무엇을 보완하면 될까요? (필수)" className={inputCls} />}
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className={btnSecondary}>{pending ? "저장 중…" : "의견 남기기"}</Button>
    </form>
  );
}

export function ReportPublishForm({ cardId }: { cardId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(publishReport.bind(null, cardId), init);
  const onSubmit = useFormSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t border-divider pt-4">
      <label htmlFor="summary" className="block text-sm font-semibold text-muted-foreground">요약</label>
      <Textarea id="summary" name="summary" rows={2} placeholder="한두 문장으로 요약" className={inputCls} />
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className={btnPrimary}>{pending ? "공개하는 중…" : "리포트 공개"}</Button>
    </form>
  );
}

export function ConclusionForm({ cardId }: { cardId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(recordConclusion.bind(null, cardId), init);
  const [decision, setDecision] = useState("hold");
  const onSubmit = useFormSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[22px] border border-border p-5">
      <p className="text-[15px] font-extrabold">결론 기록</p>
      <div className="flex gap-1 rounded-full bg-muted p-1">
        {[["go", "진행"], ["hold", "보류"], ["stop", "중단"]].map(([k, l]) => (
          <label key={k} className={`has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-sm font-bold ${decision === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            <input type="radio" name="decision" value={k} checked={decision === k} onChange={() => setDecision(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {REASON_TAGS.map((t) => (
          <label key={t} className="has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3.5 py-2 text-xs font-bold has-[:checked]:bg-foreground has-[:checked]:text-white">
            <input type="checkbox" name="reasonTags" value={t} className="sr-only" />
            {t}
          </label>
        ))}
      </div>
      <Textarea name="reason" rows={2} placeholder={decision === "go" ? "다음 단계를 적어 주세요(선택)" : "멈춘 사유를 적어 주세요(필수)"} className={inputCls} />
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className={btnPrimary}>{pending ? "저장 중…" : "결론 기록"}</Button>
    </form>
  );
}

export function FlagForm({ targetType, targetId, cardId, label = "신고" }: { targetType: "card" | "opinion"; targetId: string; cardId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(flagTarget.bind(null, targetType, targetId, cardId), init);
  if (!open) return <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(true)} className="-ml-3 mt-1 h-8 min-h-8 text-xs font-medium text-[var(--text-4)]">{label}</Button>;
  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <Input name="reason" placeholder="신고 사유" variant="soft" size="sm" className="min-w-0 flex-1 rounded-full" />
      <Button variant="soft" size="sm" type="submit" disabled={pending}>접수</Button>
      <FormMessage state={state} />
    </form>
  );
}

export function OwnerControls({ cardId, open, succeeded, pledges }: { cardId: string; open: boolean; succeeded: boolean; pledges: number }) {
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
          <label htmlFor="success-note" className="sr-only">일정 안내</label>
          <Textarea id="success-note" rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="언제, 어디서 열리나요?" className="rounded-2xl border-0 bg-background px-4 py-3 text-[15px]" />
          <Button disabled={pending || note.trim().length < 2} onClick={() => run(() => announceSuccess(cardId, note), "안내했어요")} className="mt-2 w-full"><Send />함께한 {pledges}명에게 알리기</Button>
        </div>
      )}
      {open && (confirm
        ? <div className="grid grid-cols-2 gap-2"><Button variant="soft" disabled={pending} onClick={() => setConfirm(false)}>취소</Button><Button disabled={pending} onClick={() => run(() => endIdea(cardId), "마감했어요")} className="bg-none bg-foreground">마감</Button></div>
        : <Button variant="soft" disabled={pending} onClick={() => setConfirm(true)} className="w-full">모집 마감하기</Button>)}
      {msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-sm font-bold text-primary" : "text-sm text-destructive"}>{msg.text}</p>}
    </div>
  );
}
