-- 성사: 목표 인원만큼 '함께해요'가 모이면 아이디어가 실제로 열린다.
ALTER TABLE cards ADD COLUMN goal integer NOT NULL DEFAULT 30 CHECK (goal BETWEEN 1 AND 1000);
ALTER TABLE cards ADD COLUMN succeeded_at timestamptz;
ALTER TABLE cards ADD COLUMN success_note text;

ALTER TABLE notices DROP CONSTRAINT notices_kind_check;
ALTER TABLE notices ADD CONSTRAINT notices_kind_check CHECK (kind IN ('CONCLUSION', 'TAKEOVER', 'SUCCESS', 'SUCCESS_NOTE'));
