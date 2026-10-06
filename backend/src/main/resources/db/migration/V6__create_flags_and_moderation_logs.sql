CREATE TABLE flags (
                       id          text PRIMARY KEY,
                       target_type text NOT NULL CHECK (target_type IN ('CARD', 'OPINION')),
                       target_id   text NOT NULL,
                       device_id   text NOT NULL,
                       reason      text NOT NULL,
                       status      text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'HIDDEN', 'KEPT')),
                       note        text,
                       created_at  timestamptz NOT NULL DEFAULT now(),
                       handled_at  timestamptz,
                       CONSTRAINT flags_target_device UNIQUE (target_type, target_id, device_id)
);

CREATE INDEX idx_flags_status_created ON flags (status, created_at);

CREATE TABLE moderation_logs (
                                 id              text PRIMARY KEY,
                                 actor_device_id text NOT NULL,
                                 action          text NOT NULL CHECK (action IN ('ENTER_OPERATOR', 'HIDE', 'KEEP', 'CLOSE_NOW')),
    target          text NOT NULL,
    reason          text NOT NULL DEFAULT '',
    created_at      timestamptz NOT NULL DEFAULT now()
);