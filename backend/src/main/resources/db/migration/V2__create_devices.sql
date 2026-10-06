CREATE TABLE devices (
    id          text PRIMARY KEY,
    nickname    text NOT NULL,
    is_operator boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);