CREATE TABLE cards (
    id                  text PRIMARY KEY,
    title               text NOT NULL,
    body                text NOT NULL,
    target              text NOT NULL DEFAULT '',
    place               text NOT NULL DEFAULT '',
    effect              text NOT NULL DEFAULT '',
    proposer_id         text NOT NULL,
    proposer_name       text NOT NULL,
    starts_at           timestamptz NOT NULL,
    ends_at             timestamptz NOT NULL,
    parent_id           text,
    takeover_note       text,
    is_seed             boolean NOT NULL DEFAULT false,
    hidden              boolean NOT NULL DEFAULT false,
    report_published_at timestamptz,
    report_summary      text,
    created_at          timestamptz NOT NULL DEFAULT now()
);