-- 넘기기는 무보상(0), 이유 기록만 포인트를 받는다. 이전 기록(10·30)은 그대로 둔다.
ALTER TABLE idea_swipes DROP CONSTRAINT idea_swipes_reward_check;
ALTER TABLE idea_swipes ADD CONSTRAINT idea_swipes_reward_check CHECK (reward IN (0, 10, 30));
