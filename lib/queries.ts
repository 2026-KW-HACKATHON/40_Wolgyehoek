import "server-only";
import { and, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { getDb, schema } from "./db";
import { cardStatus } from "./domain/status";
import type { CardStatus, Decision } from "./domain/types";
import type { Card, Conclusion } from "./db/schema";

export interface CardSummary {
  card: Card;
  status: CardStatus;
  reactionCount: number;
  opinionCount: number;
  latest: Conclusion | null;
}

async function latestConclusions(cardIds: string[]) {
  if (cardIds.length === 0) return new Map<string, Conclusion>();
  const db = await getDb();
  const rows = await db.select().from(schema.conclusions).where(inArray(schema.conclusions.cardId, cardIds)).orderBy(desc(schema.conclusions.createdAt));
  const m = new Map<string, Conclusion>();
  for (const r of rows) if (!m.has(r.cardId)) m.set(r.cardId, r);
  return m;
}

async function counts(cardIds: string[]) {
  const db = await getDb();
  const rc = new Map<string, number>();
  const oc = new Map<string, number>();
  if (cardIds.length === 0) return { rc, oc };
  const r = await db.select({ id: schema.reactions.cardId, n: sql<number>`count(*)::int` }).from(schema.reactions).where(inArray(schema.reactions.cardId, cardIds)).groupBy(schema.reactions.cardId);
  const o = await db.select({ id: schema.opinions.cardId, n: sql<number>`count(*)::int` }).from(schema.opinions).where(and(inArray(schema.opinions.cardId, cardIds), eq(schema.opinions.hidden, false))).groupBy(schema.opinions.cardId);
  for (const x of r) rc.set(x.id, Number(x.n));
  for (const x of o) oc.set(x.id, Number(x.n));
  return { rc, oc };
}

export async function summarize(cards: Card[], now = new Date()): Promise<CardSummary[]> {
  const ids = cards.map((c) => c.id);
  const [lat, { rc, oc }] = await Promise.all([latestConclusions(ids), counts(ids)]);
  return cards.map((card) => {
    const latest = lat.get(card.id) ?? null;
    return { card, latest, status: cardStatus(card.endsAt, (latest?.decision as Decision) ?? null, now), reactionCount: rc.get(card.id) ?? 0, opinionCount: oc.get(card.id) ?? 0 };
  });
}

export async function listCards(opts: { q?: string; tab?: "open" | "done" | "all" }) {
  const db = await getDb();
  const q = opts.q?.trim();
  const where = q ? and(eq(schema.cards.hidden, false), or(ilike(schema.cards.title, `%${q}%`), ilike(schema.cards.body, `%${q}%`), ilike(schema.cards.place, `%${q}%`))) : eq(schema.cards.hidden, false);
  const cards = await db.select().from(schema.cards).where(where).orderBy(desc(schema.cards.createdAt)).limit(100);
  const all = await summarize(cards);
  if (opts.tab === "open") return all.filter((s) => s.status === "open");
  if (opts.tab === "done") return all.filter((s) => s.status !== "open");
  return all;
}

export async function allVisibleCards() {
  const db = await getDb();
  return db.select().from(schema.cards).where(eq(schema.cards.hidden, false));
}

export async function getCard(id: string) {
  const db = await getDb();
  const [card] = await db.select().from(schema.cards).where(eq(schema.cards.id, id));
  if (!card) return null;
  const [summary] = await summarize([card]);
  const [reactions, opinions, conclusionRows, parent, children] = await Promise.all([
    db.select().from(schema.reactions).where(eq(schema.reactions.cardId, id)),
    db.select().from(schema.opinions).where(eq(schema.opinions.cardId, id)).orderBy(desc(schema.opinions.createdAt)),
    db.select().from(schema.conclusions).where(eq(schema.conclusions.cardId, id)).orderBy(desc(schema.conclusions.createdAt)),
    card.parentId ? db.select().from(schema.cards).where(eq(schema.cards.id, card.parentId)) : Promise.resolve([] as Card[]),
    db.select().from(schema.cards).where(eq(schema.cards.parentId, id)),
  ]);
  return { ...summary, reactions, opinions, conclusions: conclusionRows, parent: parent[0] ?? null, children };
}

export async function myActivity(deviceId: string) {
  const db = await getDb();
  const mine = await db.select().from(schema.cards).where(eq(schema.cards.proposerId, deviceId)).orderBy(desc(schema.cards.createdAt));
  const rIds = (await db.select({ id: schema.reactions.cardId }).from(schema.reactions).where(eq(schema.reactions.deviceId, deviceId))).map((x) => x.id);
  const oIds = (await db.select({ id: schema.opinions.cardId }).from(schema.opinions).where(eq(schema.opinions.deviceId, deviceId))).map((x) => x.id);
  const joinedIds = [...new Set([...rIds, ...oIds])];
  const joined = joinedIds.length ? await db.select().from(schema.cards).where(inArray(schema.cards.id, joinedIds)) : [];
  const notices = await db.select().from(schema.notices).where(eq(schema.notices.deviceId, deviceId)).orderBy(desc(schema.notices.createdAt));
  return { mine: await summarize(mine), joined: await summarize(joined), notices };
}

export async function unreadCount(deviceId: string) {
  const db = await getDb();
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.notices).where(and(eq(schema.notices.deviceId, deviceId), isNull(schema.notices.readAt)));
  return Number(r?.n ?? 0);
}

export async function openFlags() {
  const db = await getDb();
  return db.select().from(schema.flags).where(eq(schema.flags.status, "open")).orderBy(desc(schema.flags.createdAt));
}
