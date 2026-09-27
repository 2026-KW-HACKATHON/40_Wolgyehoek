"use server";

import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/lib/db";
import { makeDraft } from "@/lib/ai";
import { requireDevice } from "@/lib/device";
import { canConclude, canTakeOver, periodEnd } from "@/lib/domain/status";
import { similarCards } from "@/lib/domain/similarity";
import { cardInput, conclusionInput, opinionInput, validatePrice } from "@/lib/domain/validation";
import { allVisibleCards, summarize } from "@/lib/queries";

export type ActionState = { ok: boolean; error?: string; message?: string };
const fail = (error: string): ActionState => ({ ok: false, error });

async function loadCard(id: string) {
  const db = await getDb();
  const [card] = await db.select().from(schema.cards).where(eq(schema.cards.id, id));
  if (!card) throw new Error("카드를 찾을 수 없어요.");
  const [s] = await summarize([card]);
  return { db, card, status: s.status };
}

export async function createDraft(text: string) {
  const clean = String(text ?? "").trim();
  if (clean.length < 10) return { ok: false as const, error: "아이디어를 10자 이상 적어 주세요." };
  const draft = await makeDraft(clean);
  const cards = await allVisibleCards();
  const sims = await summarize(similarCards({ title: draft.title, body: clean }, cards).map((x) => x.card));
  return {
    ok: true as const,
    draft,
    similar: sims.map((s) => ({ id: s.card.id, title: s.card.title, status: s.status, reactionCount: s.reactionCount, reason: s.latest?.reason ?? null })),
  };
}

export async function publishCard(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const parsed = cardInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const v = parsed.data;
  const parentId = String(form.get("parentId") ?? "") || null;
  const takeoverNote = String(form.get("takeoverNote") ?? "").trim();
  const db = await getDb();
  if (parentId) {
    const { status } = await loadCard(parentId);
    if (!canTakeOver(status)) return fail("보류·중단·정체된 카드만 이어받을 수 있어요.");
    if (takeoverNote.length < 5) return fail("멈춘 사유에 대해 무엇이 달라졌는지 적어 주세요.");
  }
  const id = nanoid(12);
  const now = new Date();
  await db.insert(schema.cards).values({
    id, title: v.title, body: v.body, target: v.target, place: v.place, effect: v.effect,
    proposerId: me.id, proposerName: me.nickname, startsAt: now, endsAt: periodEnd(now, v.weeks),
    parentId, takeoverNote: parentId ? takeoverNote : null,
  });
  if (parentId) {
    const rIds = await db.select({ d: schema.reactions.deviceId }).from(schema.reactions).where(eq(schema.reactions.cardId, parentId));
    const oIds = await db.select({ d: schema.opinions.deviceId }).from(schema.opinions).where(eq(schema.opinions.cardId, parentId));
    const targets = [...new Set([...rIds, ...oIds].map((x) => x.d))].filter((d) => d !== me.id);
    if (targets.length) await db.insert(schema.notices).values(targets.map((d) => ({ id: nanoid(12), deviceId: d, cardId: id, kind: "restart" })));
  }
  revalidatePath("/");
  redirect(`/cards/${id}`);
}

export async function upsertReaction(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const { db, status } = await loadCard(cardId);
  if (status !== "open") return fail("검증 기간이 끝난 카드에는 반응을 남길 수 없어요.");
  const step = Number(form.get("step"));
  if (![1, 2, 3, 4].includes(step)) return fail("반응 단계를 골라 주세요.");
  const respondentType = String(form.get("respondentType") ?? "");
  if (!["resident", "work_study", "visitor"].includes(respondentType)) return fail("거주 / 직장·학교 / 방문 중 하나를 골라 주세요.");
  let price: number | null = null;
  if (step === 3) {
    const p = validatePrice(form.get("price"));
    if (!p.ok) return fail(p.error);
    price = p.value;
  }
  const geoRaw = String(form.get("geoInside") ?? "");
  const geoInside = geoRaw === "true" ? true : geoRaw === "false" ? false : null;
  await db
    .insert(schema.reactions)
    .values({ id: nanoid(12), cardId, deviceId: me.id, step, price, respondentType, geoInside })
    .onConflictDoUpdate({ target: [schema.reactions.cardId, schema.reactions.deviceId], set: { step, price, respondentType, geoInside, updatedAt: new Date() } });
  revalidatePath(`/cards/${cardId}`);
  return { ok: true, message: "반응을 남겼어요. 결론이 나면 알려 드릴게요." };
}

export async function addOpinion(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const { db, status } = await loadCard(cardId);
  if (status !== "open") return fail("검증 기간이 끝난 카드에는 의견을 남길 수 없어요.");
  const parsed = opinionInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  await db.insert(schema.opinions).values({ id: nanoid(12), cardId, deviceId: me.id, authorName: me.nickname, ...parsed.data });
  revalidatePath(`/cards/${cardId}`);
  return { ok: true, message: "의견을 남겼어요." };
}

export async function publishReport(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const { db, card, status } = await loadCard(cardId);
  if (card.proposerId !== me.id && !me.isOperator) return fail("제안자나 운영자만 리포트를 공개할 수 있어요.");
  if (status === "open") return fail("검증 기간이 끝난 뒤에 공개할 수 있어요.");
  const summary = String(form.get("summary") ?? "").trim().slice(0, 500);
  await db.update(schema.cards).set({ reportPublishedAt: new Date(), reportSummary: summary || null }).where(eq(schema.cards.id, cardId));
  revalidatePath(`/cards/${cardId}`);
  return { ok: true, message: "리포트를 공개했어요." };
}

export async function recordConclusion(cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const { db, card, status } = await loadCard(cardId);
  if (card.proposerId !== me.id && !me.isOperator) return fail("제안자나 운영자만 결론을 기록할 수 있어요.");
  if (!canConclude(status)) return fail("검증 기간이 끝난 뒤에 결론을 기록할 수 있어요.");
  const parsed = conclusionInput.safeParse({ decision: form.get("decision"), reasonTags: form.getAll("reasonTags"), reason: form.get("reason") ?? "" });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  await db.insert(schema.conclusions).values({ id: nanoid(12), cardId, decidedBy: me.id, ...parsed.data });
  const rIds = await db.select({ d: schema.reactions.deviceId }).from(schema.reactions).where(eq(schema.reactions.cardId, cardId));
  const oIds = await db.select({ d: schema.opinions.deviceId }).from(schema.opinions).where(eq(schema.opinions.cardId, cardId));
  const targets = [...new Set([...rIds, ...oIds].map((x) => x.d))].filter((d) => d !== me.id);
  if (targets.length) await db.insert(schema.notices).values(targets.map((d) => ({ id: nanoid(12), deviceId: d, cardId, kind: "conclusion" })));
  revalidatePath(`/cards/${cardId}`);
  revalidatePath("/");
  return { ok: true, message: `결론을 기록하고 응답자 ${targets.length}명에게 알렸어요.` };
}

export async function flagTarget(targetType: "card" | "opinion", targetId: string, cardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const reason = String(form.get("reason") ?? "").trim();
  if (reason.length < 2) return fail("신고 사유를 적어 주세요.");
  const db = await getDb();
  await db.insert(schema.flags).values({ id: nanoid(12), targetType, targetId, deviceId: me.id, reason }).onConflictDoNothing();
  revalidatePath(`/cards/${cardId}`);
  return { ok: true, message: "신고가 접수됐어요. 운영자가 확인할게요." };
}

export async function setNickname(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const nickname = String(form.get("nickname") ?? "").trim();
  if (nickname.length < 2 || nickname.length > 20) return fail("닉네임은 2~20자로 적어 주세요.");
  const db = await getDb();
  await db.update(schema.devices).set({ nickname }).where(eq(schema.devices.id, me.id));
  revalidatePath("/me");
  return { ok: true, message: "닉네임을 바꿨어요." };
}

export async function markNoticesRead() {
  const me = await requireDevice();
  const db = await getDb();
  await db.update(schema.notices).set({ readAt: new Date() }).where(and(eq(schema.notices.deviceId, me.id), isNull(schema.notices.readAt)));
  revalidatePath("/me");
  revalidatePath("/", "layout");
}

export async function enterOperator(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireDevice();
  const code = process.env.OPERATOR_CODE;
  if (!code) return fail("운영 코드가 설정되지 않았어요(OPERATOR_CODE).");
  if (String(form.get("code") ?? "") !== code) return fail("운영 코드가 맞지 않아요.");
  const db = await getDb();
  await db.update(schema.devices).set({ isOperator: true }).where(eq(schema.devices.id, me.id));
  revalidatePath("/admin");
  return { ok: true, message: "운영자 모드로 들어왔어요." };
}

async function requireOperator() {
  const me = await requireDevice();
  if (!me.isOperator) throw new Error("운영자만 할 수 있어요.");
  return me;
}

export async function closeNow(cardId: string) {
  const me = await requireOperator();
  const db = await getDb();
  await db.update(schema.cards).set({ endsAt: new Date() }).where(eq(schema.cards.id, cardId));
  await db.insert(schema.moderationLogs).values({ id: nanoid(12), actorDeviceId: me.id, action: "close_now", target: `card:${cardId}` });
  revalidatePath(`/cards/${cardId}`);
  revalidatePath("/");
}

export async function moderate(flagId: string, action: "hide" | "keep", form: FormData) {
  const me = await requireOperator();
  const db = await getDb();
  const [flag] = await db.select().from(schema.flags).where(eq(schema.flags.id, flagId));
  if (!flag) return;
  const note = String(form.get("note") ?? "").trim();
  if (action === "hide") {
    if (flag.targetType === "card") await db.update(schema.cards).set({ hidden: true }).where(eq(schema.cards.id, flag.targetId));
    else await db.update(schema.opinions).set({ hidden: true }).where(eq(schema.opinions.id, flag.targetId));
  }
  await db.update(schema.flags).set({ status: action === "hide" ? "hidden" : "kept", note, handledAt: new Date() }).where(and(eq(schema.flags.targetType, flag.targetType), eq(schema.flags.targetId, flag.targetId)));
  await db.insert(schema.moderationLogs).values({ id: nanoid(12), actorDeviceId: me.id, action, target: `${flag.targetType}:${flag.targetId}`, reason: note });
  revalidatePath("/admin");
}
