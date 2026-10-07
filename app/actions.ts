"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { listCards } from "@/lib/queries";
import type { Draft } from "@/lib/domain/draft";
import { cardInput, conclusionInput, opinionInput, validatePrice } from "@/lib/domain/validation";

export type ActionState = { ok: boolean; error?: string; message?: string };
const fail = (error: string): ActionState => ({ ok: false, error });
const errorMessage = (e: unknown) => e instanceof ApiError ? e.message : "요청을 처리하지 못했어요. 다시 시도해 주세요.";
const refresh = (id?: string) => { revalidatePath("/", "layout"); if (id) revalidatePath(`/cards/${id}`); };

export async function createDraft(text: string) {
  const clean = String(text ?? "").trim();
  if (clean.length < 10 || clean.length > 2000) return { ok: false as const, error: "아이디어를 10~2000자로 적어 주세요." };
  try {
    const draft = await api<Draft>("/api/assist/draft", { method: "POST", body: { text: clean } });
    const sims = await api<{ card: { id: string } }[]>("/api/assist/similar", { method: "POST", body: { title: draft.title, body: clean } });
    const cards = await listCards({ tab: "all" });
    return { ok: true as const, draft: { ...draft, source: draft.source.toLowerCase() as Draft["source"] },
      similar: sims.flatMap(s => { const c = cards.find(c => c.card.id === s.card.id); return c ? [{ id: c.card.id, title: c.card.title, status: c.status, reactionCount: c.reactionCount, reason: c.latest?.reason ?? null }] : []; }) };
  } catch (e) { return { ok: false as const, error: errorMessage(e) }; }
}

export async function publishCard(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = cardInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const parentId = String(form.get("parentId") ?? "");
  const card = { ...parsed.data, mediaIds: form.getAll("mediaIds").map(String).filter(Boolean) };
  let id: string;
  try {
    if (parentId) {
      const result = await api<{ card: { id: string } }>(`/api/cards/${encodeURIComponent(parentId)}/takeover`, { method: "POST", body: { card, takeoverNote: String(form.get("takeoverNote") ?? "").trim() } });
      id = result.card.id;
    } else { id = (await api<{ id: string }>("/api/cards", { method: "POST", body: card })).id; }
  } catch (e) { return fail(errorMessage(e)); }
  refresh(parentId || id);
  redirect("/team");
}

export async function upsertReaction(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const step = Number(form.get("step"));
  let price: number | null = null;
  if (step === 3) { const p = validatePrice(form.get("price")); if (!p.ok) return fail(p.error); price = p.value; }
  const raw = form.get("geoInside");
  try {
    await api(`/api/cards/${encodeURIComponent(cardId)}/reaction`, { method: "PUT", body: { step, price, respondentType: String(form.get("respondentType") ?? ""), geoInside: raw === "true" ? true : raw === "false" ? false : null } });
    refresh(cardId); return { ok: true, message: "반응을 남겼어요. 결론이 나면 알려 드릴게요." };
  } catch (e) { return fail(errorMessage(e)); }
}
export async function addOpinion(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const parsed = opinionInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  try { await api(`/api/cards/${encodeURIComponent(cardId)}/opinions`, { method: "POST", body: { ...parsed.data, stance: parsed.data.stance.toUpperCase() } }); refresh(cardId); return { ok: true, message: "의견을 남겼어요." }; }
  catch (e) { return fail(errorMessage(e)); }
}
export async function publishReport(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  try { await api(`/api/cards/${encodeURIComponent(cardId)}/report`, { method: "POST", body: { summary: String(form.get("summary") ?? "").trim() } }); refresh(cardId); return { ok: true, message: "리포트를 공개했어요." }; }
  catch (e) { return fail(errorMessage(e)); }
}
export async function recordConclusion(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const parsed = conclusionInput.safeParse({ decision: form.get("decision"), reasonTags: form.getAll("reasonTags"), reason: form.get("reason") ?? "" });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  try { const r = await api<{ notifiedCount: number }>(`/api/cards/${encodeURIComponent(cardId)}/conclusions`, { method: "POST", body: { ...parsed.data, decision: parsed.data.decision.toUpperCase() } }); refresh(cardId); return { ok: true, message: `결론을 기록하고 응답자 ${r.notifiedCount}명에게 알렸어요.` }; }
  catch (e) { return fail(errorMessage(e)); }
}
export async function flagTarget(type: "card" | "opinion", id: string, cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  try { await api(`/api/${type === "card" ? "cards" : "opinions"}/${encodeURIComponent(id)}/flags`, { method: "POST", body: { reason: String(form.get("reason") ?? "").trim() } }); refresh(cardId); return { ok: true, message: "신고가 접수됐어요. 운영자가 확인할게요." }; }
  catch (e) { return fail(errorMessage(e)); }
}
export async function setNickname(_: ActionState, form: FormData): Promise<ActionState> {
  try { await api("/api/me/nickname", { method: "PATCH", body: { nickname: String(form.get("nickname") ?? "").trim() } }); refresh(); return { ok: true, message: "닉네임을 바꿨어요." }; }
  catch (e) { return fail(errorMessage(e)); }
}
export async function markNoticesRead() { await api("/api/me/notices/read-all", { method: "POST" }); refresh(); }
export async function enterOperator(_: ActionState, form: FormData): Promise<ActionState> {
  try { await api("/api/operator/enter", { method: "POST", body: { code: String(form.get("code") ?? "") } }); refresh(); return { ok: true, message: "운영자 모드로 들어왔어요." }; }
  catch (e) { return fail(errorMessage(e)); }
}
export async function closeNow(cardId: string) { await api(`/api/operator/cards/${encodeURIComponent(cardId)}/close`, { method: "POST" }); refresh(cardId); }
export async function moderate(flagId: string, action: "hide" | "keep", form: FormData) { await api(`/api/operator/flags/${encodeURIComponent(flagId)}/${action}`, { method: "POST", body: { note: String(form.get("note") ?? "").trim() } }); refresh(); }
