-- 노원구 조례(ORDINANCE)와 구의회 회의록·감사 기록(COUNCIL)을 공개 기록의 출처 종류로 받는다.
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_origin_check;
ALTER TABLE cards ADD CONSTRAINT cards_origin_check
    CHECK (origin IN ('', 'STUDENT', 'POLICY', 'RESIDENT', 'PLEDGE', 'ORDINANCE', 'COUNCIL'));
