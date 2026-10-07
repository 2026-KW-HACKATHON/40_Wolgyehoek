-- 카드에 첨부하는 사진·영상. 업로드 직후에는 card_id가 비어 있고 카드 게시 때 연결된다.
CREATE TABLE card_media (
    id              text PRIMARY KEY,
    card_id         text REFERENCES cards(id) ON DELETE CASCADE,
    owner_device_id text NOT NULL,
    kind            text NOT NULL CHECK (kind IN ('IMAGE', 'VIDEO')),
    content_type    text NOT NULL,
    size_bytes      bigint NOT NULL CHECK (size_bytes > 0),
    position        integer NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX card_media_card_idx ON card_media (card_id, position);
