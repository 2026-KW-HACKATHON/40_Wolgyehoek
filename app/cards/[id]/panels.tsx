"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { useActionState, useEffect, useRef, useState } from "react";
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
    return <p className="rounded-lg bg-subtle px-4 py-3 text-sm text-ink-2 ring-line">검증 기간이 끝났어요. 아래 리포트와 결론을 확인해 주세요.</p>;
  }
  return (
    <form onSubmit={onSubmit} className="ring-card space-y-5 rounded-lg bg-white p-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">수요의 강도를 골라 주세요</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const on = step === s;
            return (
              <label key={s} className={`relative flex min-h-[64px] cursor-pointer flex-col justify-between rounded-md bg-white p-3 text-sm transition-shadow ${on ? "ring-2 ring-primary" : "ring-line hover:bg-subtle"}`}>
                <input type="radio" name="step" value={s} checked={on} onChange={() => setStep(s)} className="sr-only" />
                <span className="flex items-center gap-2 font-medium"><i className="block size-2 rounded-full" style={{ background: `var(--step-${s})` }} />{label}</span>
                <span className="tnum font-mono text-[12px] text-ink-3">{counts[i]}명</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {step === 3 && (
        <div className="space-y-1.5">
          <label htmlFor="price" className="block text-sm font-medium">이 가격이면 쓰겠다 (원)</label>
          <Input id="price" name="price" inputMode="numeric" defaultValue={mine?.price ?? ""} placeholder="예) 5000" className={inputCls} />
        </div>
      )}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">나는 월계1동에서</legend>
        <div className="flex gap-1 rounded-lg bg-subtle p-1 ring-line">
          {(Object.keys(RESPONDENT_LABELS) as RespondentType[]).map((k) => (
            <label key={k} className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-center text-sm font-medium ${type === k ? "bg-white text-ink ring-card" : "text-ink-3"}`}>
              <input type="radio" name="respondentType" value={k} checked={type === k} onChange={() => setType(k)} className="sr-only" />
              {RESPONDENT_LABELS[k]}
            </label>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={checkGeo} className="rounded-md bg-white px-3 py-1.5 text-xs font-medium ring-line hover:bg-subtle">위치로 확인(선택)</Button>
          {geoMsg && <span className="text-xs text-ink-3">{geoMsg}</span>}
        </div>
        <input type="hidden" name="geoInside" value={geo} />
        <p className="mt-1 text-xs text-ink-3">구분과 위치 확인은 참고용이며 거주를 증명하지 않아요.</p>
      </fieldset>
      <FormMessage state={state} />
      <Button type="submit" disabled={pending || !step || !type} className={btnPrimary}>{pending ? "저장 중…" : mine ? "반응 수정" : "반응 남기기"}</Button>
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
    <form ref={formRef} onSubmit={onSubmit} className="ring-card space-y-3 rounded-lg bg-white p-4">
      <div className="flex gap-1 rounded-lg bg-subtle p-1 ring-line">
        {[["pro", "찬성"], ["con", "반대"], ["conditional", "조건부 찬성"]].map(([k, l]) => (
          <label key={k} className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-sm font-medium ${stance === k ? "bg-white ring-card" : "text-ink-3"}`}>
            <input type="radio" name="stance" value={k} checked={stance === k} onChange={() => setStance(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      <Textarea name="body" rows={2} placeholder="의견을 남겨 주세요" className={inputCls} />
      {stance === "conditional" && <Input name="condition" placeholder="어떤 조건이면 찬성하나요? (필수)" className={inputCls} />}
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
      <label htmlFor="summary" className="block text-sm font-medium">의견 요약(확인 후 공개)</label>
      <Textarea id="summary" name="summary" rows={2} placeholder="예) 참여 의사는 높지만 운영 주체를 묻는 조건부 의견이 많았다." className={inputCls} />
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
    <form onSubmit={onSubmit} className="ring-card space-y-4 rounded-lg bg-white p-5">
      <p className="text-sm font-medium">결론 기록 (응답자 전원에게 알림)</p>
      <div className="flex gap-1 rounded-lg bg-subtle p-1 ring-line">
        {[["go", "진행"], ["hold", "보류"], ["stop", "중단"]].map(([k, l]) => (
          <label key={k} className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-sm font-medium ${decision === k ? "bg-white ring-card" : "text-ink-3"}`}>
            <input type="radio" name="decision" value={k} checked={decision === k} onChange={() => setDecision(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {REASON_TAGS.map((t) => (
          <label key={t} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium ring-line has-[:checked]:bg-ink has-[:checked]:text-white">
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
  if (!open) return <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(true)} className="mt-2 text-xs text-ink-3 underline-offset-2 hover:underline">{label}</Button>;
  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <Input name="reason" placeholder="신고 사유" className="rounded-md bg-white px-2 py-1 text-xs ring-line" />
      <Button variant="outline" size="sm" type="submit" disabled={pending} className="rounded-md bg-white px-2 py-1 text-xs ring-line">접수</Button>
      <FormMessage state={state} />
    </form>
  );
}
