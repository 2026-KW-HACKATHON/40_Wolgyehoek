import { boolean, integer, pgTable, smallint, text, timestamp, unique } from "drizzle-orm/pg-core";

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const devices = pgTable("devices", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull(),
  isOperator: boolean("is_operator").notNull().default(false),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  target: text("target").notNull().default(""),
  place: text("place").notNull().default(""),
  effect: text("effect").notNull().default(""),
  proposerId: text("proposer_id").notNull(),
  proposerName: text("proposer_name").notNull(),
  startsAt: ts("starts_at").notNull(),
  endsAt: ts("ends_at").notNull(),
  parentId: text("parent_id"),
  takeoverNote: text("takeover_note"),
  isSeed: boolean("is_seed").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  reportPublishedAt: ts("report_published_at"),
  reportSummary: text("report_summary"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const reactions = pgTable(
  "reactions",
  {
    id: text("id").primaryKey(),
    cardId: text("card_id").notNull(),
    deviceId: text("device_id").notNull(),
    step: smallint("step").notNull(),
    price: integer("price"),
    respondentType: text("respondent_type").notNull(),
    geoInside: boolean("geo_inside"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("reactions_card_device").on(t.cardId, t.deviceId)],
);

export const opinions = pgTable("opinions", {
  id: text("id").primaryKey(),
  cardId: text("card_id").notNull(),
  deviceId: text("device_id").notNull(),
  authorName: text("author_name").notNull(),
  stance: text("stance").notNull(),
  body: text("body").notNull(),
  condition: text("condition").notNull().default(""),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const conclusions = pgTable("conclusions", {
  id: text("id").primaryKey(),
  cardId: text("card_id").notNull(),
  decision: text("decision").notNull(),
  reasonTags: text("reason_tags").array().notNull().default([]),
  reason: text("reason").notNull().default(""),
  decidedBy: text("decided_by").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const notices = pgTable("notices", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  cardId: text("card_id").notNull(),
  kind: text("kind").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
  readAt: ts("read_at"),
});

export const flags = pgTable(
  "flags",
  {
    id: text("id").primaryKey(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    deviceId: text("device_id").notNull(),
    reason: text("reason").notNull(),
    status: text("status").notNull().default("open"),
    note: text("note"),
    createdAt: ts("created_at").notNull().defaultNow(),
    handledAt: ts("handled_at"),
  },
  (t) => [unique("flags_target_device").on(t.targetType, t.targetId, t.deviceId)],
);

export const moderationLogs = pgTable("moderation_logs", {
  id: text("id").primaryKey(),
  actorDeviceId: text("actor_device_id").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  reason: text("reason").notNull().default(""),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export type Card = typeof cards.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type Opinion = typeof opinions.$inferSelect;
export type Conclusion = typeof conclusions.$inferSelect;
