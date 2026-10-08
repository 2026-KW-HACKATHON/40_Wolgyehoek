"use client";

import Link from "next/link";
import { useActionState, useState, useSyncExternalStore, useTransition } from "react";
import { FileText, Link2, MessageSquareText, ArrowRight, RotateCcw } from "lucide-react";
import { analyzeIntake, publishIntake } from "@/app/intake-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormMessage, inputCls } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form-submit";
import { TOPICS, type Topic } from "@/lib/domain/types";
import { AgentPanel } from "./AgentPanel";
import { readIntakeFile, TEXT_LIMIT } from "./source";
import { researchMemo, researchQuestions, takeoverCandidates, type ResearchQuestion, type TeamMemory } from "./rules";

type Analysis = Extract<Awaited<ReturnType<typeof analyzeIntake>>, { ok: true }>;
interface EditableDraft { title: string; problem: string; topic: Topic; body: string; target: string; place: string; effect: string }
const MEMORY_KEY = "dongne-seorap:intake-team:v1";
const MEMORY_EVENT = "intake-memory";
const emptyMemory: TeamMemory = { team: "", place: "", topic: "" };
const modes = [
  { key: "text", label: "자유 서술", icon: MessageSquareText },
  { key: "url", label: "기사·회의록 URL", icon: Link2 },
  { key: "file", label: "기획서 파일", icon: FileText },
] as const;

function subscribeMemory(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(MEMORY_EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(MEMORY_EVENT, callback); };
}
function getMemory() {
  try { return localStorage.getItem(MEMORY_KEY) ?? ""; } catch { return ""; }
}
function parseMemory(raw: string): TeamMemory {
  try {
    const value = JSON.parse(raw);
    return { team: typeof value.team === "string" ? value.team : "", place: typeof value.place === "string" ? value.place : "", topic: typeof value.topic === "string" ? value.topic : "" };
  } catch { return emptyMemory; }
}

export function IntakeForm() {
  const memoryRaw = useSyncExternalStore(subscribeMemory, getMemory, () => "");
  const memory = parseMemory(memoryRaw);
  const [memoryError, setMemoryError] = useState("");
  const [mode, setMode] = useState<"text" | "url" | "file">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<{ name: string; text: string } | null>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [draft, setDraft] = useState<EditableDraft | null>(null);
  const [questions, setQuestions] = useState<ResearchQuestion[]>([]);
  const [answers, setAnswers] = useState<Partial<Record<ResearchQuestion["key"], string>>>({});
  const [pending, startTransition] = useTransition();
  const [state, formAction, publishing] = useActionState(publishIntake, { ok: true });
  const onSubmit = useFormSubmit(formAction);
  const input = mode === "text" ? text : mode === "url" ? url : file?.text ?? "";
  const memo = researchMemo(questions, answers);
  const body = (draft?.body ?? "") + memo;
  const sourceNote = analysis?.source ? `\n\n출처: ${analysis.source}` : "";
  const fullLength = body.trim().length + sourceNote.length;
  const candidates = takeoverCandidates(analysis?.check?.related ?? []);
  const [takeoverId, setTakeoverId] = useState("");
  const chosenTakeover = candidates.find((r) => r.id === takeoverId) ?? candidates[0];

  const saveMemory = (next: TeamMemory | null) => {
    try {
      if (next) localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
      else localStorage.removeItem(MEMORY_KEY);
      window.dispatchEvent(new Event(MEMORY_EVENT));
      setMemoryError("");
    } catch { setMemoryError("이 브라우저에서 팀 메모리를 저장할 수 없어요."); }
  };
  const run = () => startTransition(async () => {
    setError("");
    try {
      const selectedMode = mode === "text" && /^https?:\/\/\S+$/.test(input.trim()) ? "url" : mode;
      const result = await analyzeIntake({ mode: selectedMode, text: input, source: file?.name ?? "", place: memory.place });
      if (!result.ok) { setError(result.error); return; }
      const topic = result.check?.topic;
      const selectedTopic: Topic = topic && topic in TOPICS ? topic as Topic : memory.topic in TOPICS ? memory.topic as Topic : "NEIGHBOR";
      const concepts = result.check?.concepts.map((c) => c.label).join("·");
      setAnalysis(result);
      setDraft({
        ...result.draft,
        title: result.draft.title.slice(0, 60),
        problem: (concepts ? `${result.draft.place} ${result.draft.target}의 ${concepts}` : result.draft.title).slice(0, 80),
        topic: selectedTopic, body: result.text.slice(0, 1600),
      });
      setQuestions(researchQuestions(result.text, result.check, memory));
      setAnswers({});
      setTakeoverId("");
    } catch { setError("분석을 마치지 못했어요. 다시 시도해 주세요."); }
  });
  const answer = (q: ResearchQuestion, value: string) => {
    const previous = answers[q.key];
    setAnswers((old) => ({ ...old, [q.key]: value }));
    if (q.key === "scale" || q.key === "existing") {
      setDraft((old) => {
        if (!old) return old;
        const field = q.key === "scale" ? "target" : "effect";
        const suffix = previous ? ` · ${previous}` : "";
        const base = suffix && old[field].endsWith(suffix) ? old[field].slice(0, -suffix.length) : old[field];
        return { ...old, [field]: `${base}${base ? " · " : ""}${value}`.slice(0, field === "target" ? 100 : 200) };
      });
    }
  };
  const changeDraft = (name: keyof EditableDraft, value: string) => setDraft((old) => old ? { ...old, [name]: value } : old);

  return <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-bold">어떤 문제를 풀고 싶나요?</h2>
        <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-muted p-1" role="group" aria-label="입력 방식">
          {modes.map(({ key, label, icon: Icon }) => <button key={key} type="button" aria-pressed={mode === key} disabled={pending || reading || publishing} onClick={() => { setMode(key); setError(""); }} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors disabled:opacity-50 ${mode === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{label}</button>)}
        </div>
        {mode === "text" && <><label htmlFor="idea-text" className="sr-only">아이디어</label><Textarea id="idea-text" value={text} onChange={(e) => setText(e.target.value)} disabled={pending || publishing} maxLength={TEXT_LIMIT} rows={6} placeholder="예) 월계1동 홀몸 어르신 안부를 매일 확인하는 서비스를 수업 과제로 만들고 싶어요" className={`${inputCls} resize-y rounded-xl text-base leading-7`} /></>}
        {mode === "url" && <div className="space-y-2"><label htmlFor="idea-url" className="text-sm font-semibold">기사·회의록 URL</label><Input id="idea-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} disabled={pending || publishing} placeholder="https://" maxLength={2000} className={inputCls} /><p className="text-xs text-muted-foreground">공개 페이지의 제목·설명·본문을 읽고 출처를 남겨요.</p></div>}
        {mode === "file" && <div className="space-y-3">
          <label htmlFor="idea-file" className="block text-sm font-semibold">팀 기획서 · TXT, MD, PDF · 최대 5MB</label>
          <input id="idea-file" type="file" accept=".txt,.md,.pdf" disabled={pending || reading || publishing} className="sr-only" onChange={async (event) => {
            const picked = event.target.files?.[0];
            setFile(null); setError("");
            if (!picked) return;
            setReading(true);
            try { setFile({ name: picked.name, text: await readIntakeFile(picked) }); }
            catch (e) { setError(e instanceof Error ? e.message : "파일을 읽지 못했어요."); }
            finally { setReading(false); }
          }} />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" disabled={pending || reading || publishing} onClick={() => document.getElementById("idea-file")?.click()}><FileText aria-hidden="true" />파일 선택</Button>
            <span className="min-w-0 break-all text-sm text-muted-foreground">{file?.name ?? "선택한 파일 없음"}</span>
          </div>
          {reading && <p role="status" className="text-sm text-muted-foreground">파일에서 텍스트를 읽고 있어요…</p>}
          {file && <><p className="text-xs text-muted-foreground">{file.name} · {file.text.length}자{file.text.length === TEXT_LIMIT && " · 앞 6000자"}</p><Textarea aria-label="파일에서 읽은 내용" value={file.text} onChange={(e) => setFile({ ...file, text: e.target.value })} disabled={pending || publishing} maxLength={TEXT_LIMIT} rows={5} className={inputCls} /></>}
        </div>}
        <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{mode === "url" ? "페이지 본문 최대 6000자" : `${input.length.toLocaleString()} / 6000자`}</span><Button onClick={run} disabled={pending || reading || publishing || input.trim().length < 10} loading={pending}>{!pending && (analysis ? <RotateCcw aria-hidden="true" /> : <MessageSquareText aria-hidden="true" />)} {pending ? "분석 중…" : analysis ? "다시 분석하기" : "분석하기"}</Button></div>
        {error && <p role="alert" className="mt-3 text-sm text-[var(--stop-fg)]">{error}</p>}
      </section>

      <section className="rounded-2xl border border-border bg-background p-5" aria-label="팀 메모리">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">팀 메모리</h2><button type="button" onClick={() => saveMemory(null)} className="min-h-9 px-2 text-xs text-muted-foreground underline underline-offset-4">잊기</button></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MemoryField label="소속" value={memory.team} placeholder="광운대 공학설계입문 3조" onChange={(team) => saveMemory({ ...memory, team })} />
          <MemoryField label="주 활동 지역" value={memory.place} placeholder="월계1동" onChange={(place) => saveMemory({ ...memory, place })} />
          <div><label htmlFor="memory-topic" className="mb-1.5 block text-xs text-muted-foreground">관심 분야</label><select id="memory-topic" value={memory.topic} onChange={(e) => saveMemory({ ...memory, topic: e.target.value })} className={`${inputCls} h-12 appearance-none rounded-lg py-2 text-sm`}><option value="">선택</option>{(Object.keys(TOPICS) as Topic[]).map((t) => <option key={t} value={t}>{TOPICS[t]}</option>)}</select></div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">이 브라우저에만 저장돼요.</p>
        {memoryError && <p role="alert" className="mt-2 text-xs text-[var(--stop-fg)]">{memoryError}</p>}
      </section>

      {draft && analysis && <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-background p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">등록 초안</h2><span className="text-xs text-muted-foreground">직접 수정할 수 있어요</span></div>
        {analysis.warning && <p role="status" className="text-sm text-[var(--stop-fg)]">{analysis.warning}</p>}
        {analysis.text.length > 1600 && <p className="text-xs leading-5 text-muted-foreground">문서 앞 1600자로 초안을 만들었어요. 필요한 내용을 골라 수정해 주세요.</p>}
        <DraftField name="problem" label="동네 문제" value={draft.problem} maxLength={80} minLength={5} required onChange={changeDraft} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><label htmlFor="draft-topic" className="block text-sm font-semibold">분야</label><select id="draft-topic" name="topic" value={draft.topic} onChange={(e) => changeDraft("topic", e.target.value)} className={`${inputCls} h-12 appearance-none`}>{(Object.keys(TOPICS) as Topic[]).map((t) => <option key={t} value={t}>{TOPICS[t]}</option>)}</select></div>
          <DraftField name="place" label="장소" value={draft.place} maxLength={100} onChange={changeDraft} />
        </div>
        <DraftField name="title" label="해결 아이디어" value={draft.title} maxLength={60} minLength={2} required onChange={changeDraft} />
        <div className="space-y-1.5"><label htmlFor="draft-body" className="block text-sm font-semibold">내용</label><Textarea id="draft-body" value={draft.body} onChange={(e) => changeDraft("body", e.target.value)} rows={6} minLength={10} maxLength={2000} required className={`${inputCls} leading-6`} /><input type="hidden" name="body" value={body} /><p className={`text-xs ${fullLength > 2000 ? "text-[var(--stop-fg)]" : "text-muted-foreground"}`}>조사 메모·출처 포함 {fullLength} / 2000자</p></div>
        <DraftField name="target" label="대상" value={draft.target} maxLength={100} onChange={changeDraft} />
        <DraftField name="effect" label="기대 효과" value={draft.effect} maxLength={200} onChange={changeDraft} />
        {memo && <div className="rounded-xl bg-muted p-4"><h3 className="mb-2 text-sm font-semibold">조사 메모</h3><p data-testid="research-memo" className="whitespace-pre-line text-sm leading-6">{memo.replace(/^\s*조사 메모\n/, "")}</p></div>}
        {analysis.source && <p className="break-all text-xs text-muted-foreground">출처: {analysis.source}</p>}
        <input type="hidden" name="intakeSource" value={analysis.source} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><label htmlFor="draft-weeks" className="block text-sm font-semibold">검증 기간</label><select id="draft-weeks" name="weeks" defaultValue="2" className={`${inputCls} h-12 appearance-none`}>{[1, 2, 3, 4, 6, 8].map((w) => <option key={w} value={w}>{w}주</option>)}</select></div>
          <div className="space-y-1.5"><label htmlFor="draft-goal" className="block text-sm font-semibold">참여 목표 인원</label><Input id="draft-goal" name="goal" type="number" defaultValue={30} min={2} max={1000} required className={inputCls} /></div>
        </div>
        <FormMessage state={state} />
        <div className="space-y-3 border-t border-border pt-5">
          <Button type="submit" disabled={publishing || pending || fullLength > 2000} loading={publishing} className="w-full">{publishing ? "등록 중…" : "새 시도로 등록"}<ArrowRight aria-hidden="true" /></Button>
          {chosenTakeover && <>
            {candidates.length > 1 && <div className="space-y-1.5"><label htmlFor="takeover-choice" className="block text-xs text-muted-foreground">이어받을 시도</label><select id="takeover-choice" value={chosenTakeover.id} onChange={(e) => setTakeoverId(e.target.value)} className={`${inputCls} h-12 appearance-none text-sm`}>{candidates.map((r) => <option key={r.id} value={r.id}>{r.year} · {r.title}</option>)}</select></div>}
            <Button asChild variant="outline" className="w-full"><Link href={`/cards/${chosenTakeover.id}/takeover`}>이어받기로 등록<ArrowRight aria-hidden="true" /></Link></Button>
          </>}
        </div>
      </form>}
    </div>
    <AgentPanel pending={pending} draft={draft && analysis ? { title: draft.title, target: draft.target, place: draft.place, effect: draft.effect, source: analysis.draft.source } : null} check={analysis?.check ?? null} precedents={analysis?.precedents ?? []} local={analysis?.local ?? []} questions={questions} answers={answers} onAnswer={answer} />
  </div>;
}

function MemoryField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-xs text-muted-foreground">{label}</span><Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} maxLength={100} className={`${inputCls} rounded-lg text-sm`} /></label>;
}
function DraftField({ name, label, value, maxLength, minLength, required, onChange }: { name: keyof EditableDraft; label: string; value: string; maxLength: number; minLength?: number; required?: boolean; onChange: (name: keyof EditableDraft, value: string) => void }) {
  return <div className="space-y-1.5"><label htmlFor={`draft-${name}`} className="block text-sm font-semibold">{label}</label><Input id={`draft-${name}`} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} maxLength={maxLength} minLength={minLength} required={required} className={inputCls} /></div>;
}
