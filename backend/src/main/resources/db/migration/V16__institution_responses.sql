CREATE TABLE institutions (
    id text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    code_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

ALTER TABLE devices ADD COLUMN institution_id text REFERENCES institutions(id);

CREATE TABLE institution_responses (
    id text PRIMARY KEY,
    card_id text NOT NULL REFERENCES cards(id),
    institution_id text NOT NULL REFERENCES institutions(id),
    device_id text NOT NULL,
    stance text NOT NULL CHECK (stance IN ('EMPATHY', 'SUPPORT', 'PARTNER')),
    comment text NOT NULL CHECK (char_length(comment) BETWEEN 2 AND 500),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (card_id, institution_id)
);
ALTER TABLE institution_responses ENABLE ROW LEVEL SECURITY;
