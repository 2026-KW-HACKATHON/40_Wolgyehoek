export const DDL = `
CREATE TABLE IF NOT EXISTS devices (
  id text PRIMARY KEY,
  nickname text NOT NULL,
  is_operator boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cards (
  id text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  target text NOT NULL DEFAULT '',
  place text NOT NULL DEFAULT '',
  effect text NOT NULL DEFAULT '',
  proposer_id text NOT NULL,
  proposer_name text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  parent_id text,
  takeover_note text,
  is_seed boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  report_published_at timestamptz,
  report_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reactions (
  id text PRIMARY KEY,
  card_id text NOT NULL,
  device_id text NOT NULL,
  step smallint NOT NULL CHECK (step BETWEEN 1 AND 4),
  price integer CHECK (price IS NULL OR (price >= 0 AND price <= 1000000)),
  respondent_type text NOT NULL,
  geo_inside boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reactions_card_device UNIQUE (card_id, device_id)
);
CREATE TABLE IF NOT EXISTS opinions (
  id text PRIMARY KEY,
  card_id text NOT NULL,
  device_id text NOT NULL,
  author_name text NOT NULL,
  stance text NOT NULL,
  body text NOT NULL,
  condition text NOT NULL DEFAULT '',
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS conclusions (
  id text PRIMARY KEY,
  card_id text NOT NULL,
  decision text NOT NULL,
  reason_tags text[] NOT NULL DEFAULT '{}',
  reason text NOT NULL DEFAULT '',
  decided_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notices (
  id text PRIMARY KEY,
  device_id text NOT NULL,
  card_id text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE TABLE IF NOT EXISTS flags (
  id text PRIMARY KEY,
  target_type text NOT NULL,
  target_id text NOT NULL,
  device_id text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz,
  CONSTRAINT flags_target_device UNIQUE (target_type, target_id, device_id)
);
CREATE TABLE IF NOT EXISTS moderation_logs (
  id text PRIMARY KEY,
  actor_device_id text NOT NULL,
  action text NOT NULL,
  target text NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reactions_card ON reactions (card_id);
CREATE INDEX IF NOT EXISTS idx_opinions_card ON opinions (card_id);
CREATE INDEX IF NOT EXISTS idx_conclusions_card ON conclusions (card_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notices_device ON notices (device_id, created_at);
`;
