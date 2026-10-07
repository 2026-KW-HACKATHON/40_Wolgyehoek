ALTER TABLE credit_campaigns ADD COLUMN returned integer NOT NULL DEFAULT 0 CHECK(returned >= 0);
ALTER TABLE credit_campaigns ADD CONSTRAINT campaign_budget_conserved CHECK(funded >= remaining + returned);
