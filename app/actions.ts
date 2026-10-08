"use server";

import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Draft } from "@/lib/domain/draft";
import type { IdeaCheck } from "@/lib/domain/ideas";
import { cardInput, conclusionInput, opinionInput, validatePrice } from "@/lib/domain/validation";

export type ActionState = { ok: boolean; error?: string; message?: string };
const fail = (error: string): ActionState => ({ ok: false, error });
const localizedMessage = async (message: string) => {
  const { t } = await getT();
  const prefix = Object.keys(t.system.errors).find((key) => key.endsWith(": ") && message.startsWith(key));
  return prefix ? t.system.errors[prefix] + message.slice(prefix.length) : pick(t.system.errors, message, message);
};
const errorMessage = async (e: unknown) => { const { t } = await getT(); return e instanceof ApiError ? localizedMessage(e.message) : t.system.requestFailed; };
const refresh = (id?: string) => { revalidatePath("/", "layout"); if (id) revalidatePath(`/cards/${id}`); };

export async function createDraft(text: string) {
  const { t } = await getT();
  const clean = String(text ?? "").trim();
  if (clean.length < 10 || clean.length > 2000) return { ok: false as const, error: t.system.draftLength };
  try {
    const draft = await api<Draft>("/api/assist/draft", { method: "POST", body: { text: clean } });
    const check = await api<IdeaCheck>("/api/ideas/check", { method: "POST", body: { title: draft.title, body: clean, place: draft.place } });
    return { ok: true as const, draft: { ...draft, source: draft.source.toLowerCase() as Draft["source"] }, check };
  } catch (e) { return { ok: false as const, error: await errorMessage(e) }; }
}

export async function publishCard(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = cardInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(await localizedMessage(parsed.error.issues[0].message));
  const parentId = String(form.get("parentId") ?? "");
  const card = { ...parsed.data, mediaIds: form.getAll("mediaIds").map(String).filter(Boolean) };
  let id: string;
  try {
    if (parentId) {
      const result = await api<{ card: { id: string } }>(`/api/cards/${encodeURIComponent(parentId)}/takeover`, { method: "POST", body: { card, takeoverNote: String(form.get("takeoverNote") ?? "").trim() } });
      id = result.card.id;
    } else { id = (await api<{ id: string }>("/api/cards", { method: "POST", body: card })).id; }
  } catch (e) { return fail(await errorMessage(e)); }
  refresh(parentId || id);
  redirect(`/cards/${id}`);
}

export async function upsertReaction(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  const step = Number(form.get("step"));
  let price: number | null = null;
  if (step === 3) { const p = validatePrice(form.get("price")); if (!p.ok) return fail(await localizedMessage(p.error)); price = p.value; }
  const raw = form.get("geoInside");
  try {
    await api(`/api/cards/${encodeURIComponent(cardId)}/reaction`, { method: "PUT", body: { step, price, respondentType: String(form.get("respondentType") ?? ""), geoInside: raw === "true" ? true : raw === "false" ? false : null } });
    refresh(cardId); return { ok: true, message: t.system.reactionSaved };
  } catch (e) { return fail(await errorMessage(e)); }
}
export async function addOpinion(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  const parsed = opinionInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(await localizedMessage(parsed.error.issues[0].message));
  try { await api(`/api/cards/${encodeURIComponent(cardId)}/opinions`, { method: "POST", body: { ...parsed.data, stance: parsed.data.stance.toUpperCase() } }); refresh(cardId); return { ok: true, message: t.system.opinionSaved }; }
  catch (e) { return fail(await errorMessage(e)); }
}
export async function publishReport(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  try { await api(`/api/cards/${encodeURIComponent(cardId)}/report`, { method: "POST", body: { summary: String(form.get("summary") ?? "").trim() } }); refresh(cardId); return { ok: true, message: t.system.reportPublished }; }
  catch (e) { return fail(await errorMessage(e)); }
}
export async function recordConclusion(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  const parsed = conclusionInput.safeParse({ decision: form.get("decision"), reasonTags: form.getAll("reasonTags"), reason: form.get("reason") ?? "" });
  if (!parsed.success) return fail(await localizedMessage(parsed.error.issues[0].message));
  try { const r = await api<{ notifiedCount: number }>(`/api/cards/${encodeURIComponent(cardId)}/conclusions`, { method: "POST", body: { ...parsed.data, decision: parsed.data.decision.toUpperCase() } }); refresh(cardId); return { ok: true, message: t.system.conclusionNotified(r.notifiedCount) }; }
  catch (e) { return fail(await errorMessage(e)); }
}
export async function flagTarget(type: "card" | "opinion", id: string, cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  try { await api(`/api/${type === "card" ? "cards" : "opinions"}/${encodeURIComponent(id)}/flags`, { method: "POST", body: { reason: String(form.get("reason") ?? "").trim() } }); refresh(cardId); return { ok: true, message: t.system.flagReceived }; }
  catch (e) { return fail(await errorMessage(e)); }
}
export async function setNickname(_: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  try { await api("/api/me/nickname", { method: "PATCH", body: { nickname: String(form.get("nickname") ?? "").trim() } }); refresh(); return { ok: true, message: t.system.nicknameChanged }; }
  catch (e) { return fail(await errorMessage(e)); }
}
export async function markNoticesRead() { await api("/api/me/notices/read-all", { method: "POST" }); refresh(); }
export async function enterOperator(_: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  try { await api("/api/operator/enter", { method: "POST", body: { code: String(form.get("code") ?? "") } }); refresh(); return { ok: true, message: t.system.operatorEntered }; }
  catch (e) { return fail(await errorMessage(e)); }
}
export async function closeNow(cardId: string) { await api(`/api/operator/cards/${encodeURIComponent(cardId)}/close`, { method: "POST" }); refresh(cardId); }
export async function moderate(flagId: string, action: "hide" | "keep", form: FormData) { await api(`/api/operator/flags/${encodeURIComponent(flagId)}/${action}`, { method: "POST", body: { note: String(form.get("note") ?? "").trim() } }); refresh(); }
