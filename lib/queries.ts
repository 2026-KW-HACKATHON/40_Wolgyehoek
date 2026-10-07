import "server-only";
import { api, ApiError } from "./api";
import type { CardStatus, Decision, Media, Stance, RespondentType } from "./domain/types";
import type { Report } from "./domain/report";

export interface Card {
  id: string; title: string; body: string; target: string; place: string; effect: string;
  proposerName: string; startsAt: Date; endsAt: Date; parentId: string | null; takeoverNote: string | null;
  isSeed: boolean; hidden: boolean; reportPublishedAt: Date | null; reportSummary: string | null; createdAt: Date;
  media: Media[]; goal: number; succeededAt: string | null; successNote: string | null; pledges: number;
  problem: string; topic: string;
}
export interface Conclusion { id: string; decision: Decision; reasonTags: string[]; reason: string; createdAt: Date }
export interface Opinion { id: string; stance: Stance; body: string; condition: string; authorName: string; createdAt: Date; hidden: boolean }
export interface CardSummary { card: Card; status: CardStatus; reactionCount: number; opinionCount: number; latest: Conclusion | null }
export type NoticeKindView = "conclusion" | "restart" | "success" | "schedule";
export interface Notice { id: string; kind: NoticeKindView; cardId: string; cardTitle: string; createdAt: Date; readAt: Date | null }
interface RawSummary extends Omit<CardSummary, "card" | "latest"> { card: Card; latest: Conclusion | null }
interface RawValidation {
  stepCounts: number[]; canManage: boolean;
  myReaction: { step: number; price: number | null; respondentType: RespondentType } | null;
  report: { reactions: Omit<Report, "opinions" | "respondents"> & { respondents: { resident: number; workStudy: number; visitor: number } }; opinions: Report["opinions"] } | null;
}
const date = (v: Date | string) => new Date(v);
const card = (c: Card): Card => ({ ...c, startsAt: date(c.startsAt), endsAt: date(c.endsAt), createdAt: date(c.createdAt), reportPublishedAt: c.reportPublishedAt ? date(c.reportPublishedAt) : null });
const conclusion = (c: Conclusion): Conclusion => ({ ...c, decision: c.decision.toLowerCase() as Decision, createdAt: date(c.createdAt) });
const summary = (s: RawSummary): CardSummary => ({ ...s, card: card(s.card), status: s.status.toLowerCase() as CardStatus, latest: s.latest ? conclusion(s.latest) : null });

export async function listCards(opts: { q?: string; tab?: "open" | "done" | "all" }) {
  const query = new URLSearchParams({ q: opts.q ?? "", tab: opts.tab ?? "all" });
  return (await api<RawSummary[]>(`/api/views/cards?${query}`)).map(summary);
}
export async function getCard(id: string) {
  try {
    const d = await api<{ summary: RawSummary; validation: RawValidation; opinions: Opinion[]; conclusions: Conclusion[]; parent: Card | null; children: Card[] }>(`/api/views/cards/${encodeURIComponent(id)}`);
    const r = d.validation.report;
    const report: Report | null = r ? { ...r.reactions, opinions: r.opinions, respondents: { resident: r.reactions.respondents.resident, work_study: r.reactions.respondents.workStudy, visitor: r.reactions.respondents.visitor } } : null;
    return { ...summary(d.summary), canManage: d.validation.canManage, mine: d.validation.myReaction, stepCounts: d.validation.stepCounts, report,
      opinions: d.opinions.map(o => ({ ...o, stance: o.stance.toLowerCase() as Stance, createdAt: date(o.createdAt), hidden: false })),
      conclusions: d.conclusions.map(conclusion), parent: d.parent ? card(d.parent) : null, children: d.children.map(card) };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
const NOTICE_KINDS: Record<string, NoticeKindView> = { CONCLUSION: "conclusion", TAKEOVER: "restart", SUCCESS: "success", SUCCESS_NOTE: "schedule" };
export async function myActivity() {
  const a = await api<{ mine: RawSummary[]; joined: RawSummary[]; notices: Notice[] }>("/api/views/me");
  return { mine: a.mine.map(summary), joined: a.joined.map(summary), notices: a.notices.map(n => ({ ...n, kind: NOTICE_KINDS[n.kind.toUpperCase()] ?? "restart", createdAt: date(n.createdAt), readAt: n.readAt ? date(n.readAt) : null })) };
}
export async function unreadCount() { return (await api<{ count: number }>("/api/me/notices/unread-count")).count; }
export async function openFlags() {
  const flags = await api<{ id: string; targetType: string; targetId: string; reason: string; createdAt: Date }[]>("/api/operator/flags");
  return flags.map(f => ({ ...f, targetType: f.targetType.toLowerCase(), createdAt: date(f.createdAt) }));
}
