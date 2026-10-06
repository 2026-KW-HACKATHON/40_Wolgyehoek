CREATE TABLE opinions (
                          id          text PRIMARY KEY,
                          card_id     text NOT NULL REFERENCES cards (id),
                          device_id   text NOT NULL,
                          author_name text NOT NULL,
                          stance      text NOT NULL CHECK (stance IN ('PRO', 'CON', 'CONDITIONAL')),
                          body        text NOT NULL,
                          condition   text NOT NULL DEFAULT '',
                          hidden      boolean NOT NULL DEFAULT false,
                          created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_opinions_card_created ON opinions (card_id, created_at);