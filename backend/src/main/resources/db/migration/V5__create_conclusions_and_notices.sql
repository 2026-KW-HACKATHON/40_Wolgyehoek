CREATE TABLE conclusions (
                             id          text PRIMARY KEY,
                             card_id     text NOT NULL REFERENCES cards (id),
                             decision    text NOT NULL CHECK (decision IN ('GO', 'HOLD', 'STOP')),
                             reason_tags text[] NOT NULL DEFAULT '{}',
                             reason      text NOT NULL DEFAULT '',
                             decided_by  text NOT NULL,
                             created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conclusions_card_created ON conclusions (card_id, created_at);

CREATE TABLE notices (
                         id         text PRIMARY KEY,
                         device_id  text NOT NULL,
                         card_id    text NOT NULL REFERENCES cards (id),
                         kind       text NOT NULL CHECK (kind IN ('CONCLUSION', 'TAKEOVER')),
                         created_at timestamptz NOT NULL DEFAULT now(),
                         read_at    timestamptz
);

CREATE INDEX idx_notices_device_created ON notices (device_id, created_at);

ALTER TABLE cards ADD COLUMN latest_decision text CHECK (latest_decision IN ('GO', 'HOLD', 'STOP'));