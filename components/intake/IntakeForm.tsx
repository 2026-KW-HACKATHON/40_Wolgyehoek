"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
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
  const { locale, t } = useI18n();
  const modes = [
    { key: "text", label: t.intake.freeText, icon: MessageSquareText },
    { key: "url", label: t.intake.urlMode, icon: Link2 },
    { key: "file", label: t.intake.fileMode, icon: FileText },
  ] as const;
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
  const memo = researchMemo(questions, answers, locale);
  const body = (draft?.body ?? "") + memo;
  const sourceNote = analysis?.source ? `\n\n${t.intake.source}: ${analysis.source}` : "";
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
    } catch { setMemoryError(t.intake.memoryError); }
  };
  const run = () => startTransition(async () => {
    setError("");
    try {
      const selectedMode = mode === "text" && /^https?:\/\/\S+$/.test(input.trim()) ? "url" : mode;
      const result = await analyzeIntake({ mode: selectedMode, text: input, source: file?.name ?? "", place: memory.place });
      if (!result.ok) { setError(result.error); return; }
      const topic = result.check?.topic;
      const selectedTopic: Topic = topic && topic in TOPICS ? topic as Topic : memory.topic in TOPICS ? memory.topic as Topic : "NEIGHBOR";
      const concepts = result.check?.concepts.map((c) => t.common.needs[c.key] || c.label).join("·");
      setAnalysis(result);
      setDraft({
        ...result.draft,
        title: result.draft.title.slice(0, 60),
        problem: (concepts ? t.intake.problemSummary(result.draft.place, result.draft.target, concepts) : result.draft.title).slice(0, 80),
        topic: selectedTopic, body: result.text.slice(0, 1600),
      });
      setQuestions(researchQuestions(result.text, result.check, memory, locale));
      setAnswers({});
      setTakeoverId("");
    } catch { setError(t.intake.analysisError); }
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
        <h2 className="mb-4 text-lg font-bold">{t.intake.problemQuestion}</h2>
        <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-muted p-1" role="group" aria-label={t.intake.inputMode}>
          {modes.map(({ key, label, icon: Icon }) => <button key={key} type="button" aria-pressed={mode === key} disabled={pending || reading || publishing} onClick={() => { setMode(key); setError(""); }} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors disabled:opacity-50 ${mode === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{label}</button>)}
        </div>
        {mode === "text" && <><label htmlFor="idea-text" className="sr-only">{t.intake.idea}</label><Textarea id="idea-text" value={text} onChange={(e) => setText(e.target.value)} disabled={pending || publishing} maxLength={TEXT_LIMIT} rows={6} placeholder={t.intake.ideaPlaceholder} className={`${inputCls} resize-y rounded-xl text-base leading-7`} /></>}
        {mode === "url" && <div className="space-y-2"><label htmlFor="idea-url" className="text-sm font-semibold">{t.intake.urlMode}</label><Input id="idea-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} disabled={pending || publishing} placeholder="https://" maxLength={2000} className={inputCls} /><p className="text-xs text-muted-foreground">{t.intake.urlHint}</p></div>}
        {mode === "file" && <div className="space-y-3">
          <label htmlFor="idea-file" className="block text-sm font-semibold">{t.intake.fileLabel}</label>
          <input id="idea-file" type="file" accept=".txt,.md,.pdf" disabled={pending || reading || publishing} className="sr-only" onChange={async (event) => {
            const picked = event.target.files?.[0];
            setFile(null); setError("");
            if (!picked) return;
            setReading(true);
            try { setFile({ name: picked.name, text: await readIntakeFile(picked, locale) }); }
            catch (e) { setError(e instanceof Error ? e.message : t.intake.fileError); }
            finally { setReading(false); }
          }} />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" disabled={pending || reading || publishing} onClick={() => document.getElementById("idea-file")?.click()}><FileText aria-hidden="true" />{t.intake.chooseFile}</Button>
            <span className="min-w-0 break-all text-sm text-muted-foreground">{file?.name ?? t.intake.noFile}</span>
          </div>
          {reading && <p role="status" className="text-sm text-muted-foreground">{t.intake.readingFile}</p>}
          {file && <><p className="text-xs text-muted-foreground">{file.name} · {t.intake.fileCharacters(file.text.length)}{file.text.length === TEXT_LIMIT && t.intake.firstCharacters}</p><Textarea aria-label={t.intake.fileContent} value={file.text} onChange={(e) => setFile({ ...file, text: e.target.value })} disabled={pending || publishing} maxLength={TEXT_LIMIT} rows={5} className={inputCls} /></>}
        </div>}
        <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{mode === "url" ? t.intake.pageLimit : t.intake.inputCharacters(input.length.toLocaleString())}</span><Button onClick={run} disabled={pending || reading || publishing || input.trim().length < 10} loading={pending}>{!pending && (analysis ? <RotateCcw aria-hidden="true" /> : <MessageSquareText aria-hidden="true" />)} {pending ? t.intake.analyzing : analysis ? t.intake.reanalyze : t.intake.analyze}</Button></div>
        {error && <p role="alert" className="mt-3 text-sm text-[var(--stop-fg)]">{error}</p>}
      </section>

      <section className="rounded-2xl border border-border bg-background p-5" aria-label={t.intake.teamMemory}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">{t.intake.teamMemory}</h2><button type="button" onClick={() => saveMemory(null)} className="min-h-9 px-2 text-xs text-muted-foreground underline underline-offset-4">{t.intake.forget}</button></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MemoryField label={t.intake.team} value={memory.team} placeholder={t.intake.teamPlaceholder} onChange={(team) => saveMemory({ ...memory, team })} />
          <MemoryField label={t.intake.area} value={memory.place} placeholder={t.intake.areaPlaceholder} onChange={(place) => saveMemory({ ...memory, place })} />
          <div><label htmlFor="memory-topic" className="mb-1.5 block text-xs text-muted-foreground">{t.intake.interests}</label><select id="memory-topic" value={memory.topic} onChange={(e) => saveMemory({ ...memory, topic: e.target.value })} className={`${inputCls} h-12 appearance-none rounded-lg py-2 text-sm`}><option value="">{t.intake.select}</option>{(Object.keys(TOPICS) as Topic[]).map((topic) => <option key={topic} value={topic}>{t.common.topics[topic]}</option>)}</select></div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t.intake.memoryHint}</p>
        {memoryError && <p role="alert" className="mt-2 text-xs text-[var(--stop-fg)]">{memoryError}</p>}
      </section>

      {draft && analysis && <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-background p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t.intake.registrationDraft}</h2><span className="text-xs text-muted-foreground">{t.intake.editable}</span></div>
        {analysis.warning && <p role="status" className="text-sm text-[var(--stop-fg)]">{analysis.warning}</p>}
        {analysis.text.length > 1600 && <p className="text-xs leading-5 text-muted-foreground">{t.intake.documentHint}</p>}
        <DraftField name="problem" label={t.intake.problem} value={draft.problem} maxLength={80} minLength={5} required onChange={changeDraft} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><label htmlFor="draft-topic" className="block text-sm font-semibold">{t.intake.topic}</label><select id="draft-topic" name="topic" value={draft.topic} onChange={(e) => changeDraft("topic", e.target.value)} className={`${inputCls} h-12 appearance-none`}>{(Object.keys(TOPICS) as Topic[]).map((topic) => <option key={topic} value={topic}>{t.common.topics[topic]}</option>)}</select></div>
          <DraftField name="place" label={t.intake.place} value={draft.place} maxLength={100} onChange={changeDraft} />
        </div>
        <DraftField name="title" label={t.intake.solution} value={draft.title} maxLength={60} minLength={2} required onChange={changeDraft} />
        <div className="space-y-1.5"><label htmlFor="draft-body" className="block text-sm font-semibold">{t.intake.content}</label><Textarea id="draft-body" value={draft.body} onChange={(e) => changeDraft("body", e.target.value)} rows={6} minLength={10} maxLength={2000} required className={`${inputCls} leading-6`} /><input type="hidden" name="body" value={body} /><p className={`text-xs ${fullLength > 2000 ? "text-[var(--stop-fg)]" : "text-muted-foreground"}`}>{t.intake.totalCharacters(fullLength)}</p></div>
        <DraftField name="target" label={t.intake.target} value={draft.target} maxLength={100} onChange={changeDraft} />
        <DraftField name="effect" label={t.intake.effect} value={draft.effect} maxLength={200} onChange={changeDraft} />
        {memo && <div className="rounded-xl bg-muted p-4"><h3 className="mb-2 text-sm font-semibold">{t.intake.researchMemo}</h3><p data-testid="research-memo" className="whitespace-pre-line text-sm leading-6">{memo.slice(memo.indexOf("\n", 2) + 1)}</p></div>}
        {analysis.source && <p className="break-all text-xs text-muted-foreground">{t.intake.source}: {analysis.source}</p>}
        <input type="hidden" name="intakeSource" value={analysis.source} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><label htmlFor="draft-weeks" className="block text-sm font-semibold">{t.intake.validationPeriod}</label><select id="draft-weeks" name="weeks" defaultValue="2" className={`${inputCls} h-12 appearance-none`}>{[1, 2, 3, 4, 6, 8].map((w) => <option key={w} value={w}>{t.intake.weeks(w)}</option>)}</select></div>
          <div className="space-y-1.5"><label htmlFor="draft-goal" className="block text-sm font-semibold">{t.intake.goal}</label><Input id="draft-goal" name="goal" type="number" defaultValue={30} min={2} max={1000} required className={inputCls} /></div>
        </div>
        <FormMessage state={state} />
        <div className="space-y-3 border-t border-border pt-5">
          <Button type="submit" disabled={publishing || pending || fullLength > 2000} loading={publishing} className="w-full">{publishing ? t.intake.registering : t.intake.register}<ArrowRight aria-hidden="true" /></Button>
          {chosenTakeover && <>
            {candidates.length > 1 && <div className="space-y-1.5"><label htmlFor="takeover-choice" className="block text-xs text-muted-foreground">{t.intake.takeoverChoice}</label><select id="takeover-choice" value={chosenTakeover.id} onChange={(e) => setTakeoverId(e.target.value)} className={`${inputCls} h-12 appearance-none text-sm`}>{candidates.map((r) => <option key={r.id} value={r.id}>{r.year} · {r.title}</option>)}</select></div>}
            <Button asChild variant="outline" className="w-full"><Link href={`/cards/${chosenTakeover.id}/takeover`}>{t.intake.registerTakeover}<ArrowRight aria-hidden="true" /></Link></Button>
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
