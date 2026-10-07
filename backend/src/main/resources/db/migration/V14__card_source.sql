-- 공개 자료에서 옮겨 온 지난 아이디어의 출처. 동네서랍에서 직접 올라온 카드는 origin이 비어 있다.
ALTER TABLE cards ADD COLUMN origin text NOT NULL DEFAULT '' CHECK (origin IN ('', 'STUDENT', 'POLICY', 'RESIDENT', 'PLEDGE'));
ALTER TABLE cards ADD COLUMN source_title text NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN source_url text NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN source_year integer;
