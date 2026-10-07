-- 아이디어가 어떤 동네 문제를 푸는지(problem)와 문제 분야(topic)를 카드에 남긴다.
ALTER TABLE cards ADD COLUMN problem text NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN topic text NOT NULL DEFAULT '' CHECK (topic IN ('', 'CARE', 'COMMERCE', 'SAFETY', 'ENVIRONMENT', 'YOUTH', 'NEIGHBOR'));
