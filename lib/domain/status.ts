import type { CardStatus, Decision } from "./types";

export const STALE_DAYS = 28;
const DAY = 24 * 60 * 60 * 1000;

export function cardStatus(endsAt: Date, latestDecision: Decision | null, now: Date = new Date()): CardStatus {
  if (latestDecision) return latestDecision;
  if (now.getTime() < endsAt.getTime()) return "open";
  if (now.getTime() - endsAt.getTime() >= STALE_DAYS * DAY) return "stale";
  return "closed";
}

export function canTakeOver(status: CardStatus): boolean {
  return status === "hold" || status === "stop" || status === "stale";
}

export function periodEnd(start: Date, weeks: number): Date {
  const w = Math.min(8, Math.max(1, Math.round(weeks)));
  return new Date(start.getTime() + w * 7 * DAY);
}
