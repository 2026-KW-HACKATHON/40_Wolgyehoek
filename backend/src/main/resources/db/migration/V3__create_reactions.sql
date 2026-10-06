CREATE TABLE reactions (
    id              text PRIMARY KEY,
    card_id         text NOT NULL REFERENCES cards (id),
    device_id       text NOT NULL,
    step            smallint NOT NULL CHECK (step BETWEEN 1 AND 4),
    price           integer CHECK (price IS NULL OR (price >= 0 AND price <= 1000000)),
    respondent_type text NOT NULL,
    geo_inside      boolean,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT reactions_card_device UNIQUE (card_id, device_id)
);