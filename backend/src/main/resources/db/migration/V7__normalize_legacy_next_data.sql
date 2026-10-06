ALTER TABLE cards ADD COLUMN IF NOT EXISTS latest_decision text;
UPDATE opinions SET stance = upper(stance);
UPDATE conclusions SET decision = upper(decision);
UPDATE notices SET kind = CASE WHEN lower(kind) IN ('restart', 'takeover') THEN 'TAKEOVER' ELSE upper(kind) END;
UPDATE flags SET target_type = upper(target_type), status = upper(status);
ALTER TABLE flags ALTER COLUMN status SET DEFAULT 'OPEN';
UPDATE moderation_logs SET action = CASE WHEN lower(action) = 'seed' THEN 'SEED' ELSE upper(action) END;
UPDATE cards c SET latest_decision = latest.decision
FROM (SELECT DISTINCT ON (card_id) card_id, decision FROM conclusions ORDER BY card_id, created_at DESC, id DESC) latest
WHERE c.id = latest.card_id;
CREATE INDEX IF NOT EXISTS idx_reactions_card ON reactions(card_id);
CREATE INDEX IF NOT EXISTS idx_opinions_card_created ON opinions(card_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conclusions_card_created ON conclusions(card_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notices_device_created ON notices(device_id, created_at);
CREATE INDEX IF NOT EXISTS idx_flags_status_created ON flags(status, created_at);
