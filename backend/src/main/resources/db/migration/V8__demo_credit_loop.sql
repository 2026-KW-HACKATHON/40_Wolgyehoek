CREATE TABLE credit_wallets (
 device_id text PRIMARY KEY REFERENCES devices(id), balance integer NOT NULL DEFAULT 0 CHECK(balance >= 0)
);
CREATE TABLE credit_campaigns (
 card_id text PRIMARY KEY REFERENCES cards(id), remaining integer NOT NULL CHECK(remaining >= 0), funded integer NOT NULL CHECK(funded >= remaining)
);
CREATE TABLE idea_swipes (
 id text PRIMARY KEY, card_id text NOT NULL REFERENCES cards(id), device_id text NOT NULL REFERENCES devices(id),
 direction text NOT NULL CHECK(direction IN ('RIGHT','LEFT')), reason text NOT NULL DEFAULT '',
 reward integer NOT NULL CHECK(reward IN (10,30)), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(card_id, device_id)
);
CREATE TABLE credit_ledger (
 id text PRIMARY KEY, device_id text NOT NULL REFERENCES devices(id), amount integer NOT NULL,
 kind text NOT NULL, description text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE demo_vouchers (
 id text PRIMARY KEY, device_id text NOT NULL REFERENCES devices(id), product_id text NOT NULL,
 title text NOT NULL, cost integer NOT NULL CHECK(cost > 0), request_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), used_at timestamptz, UNIQUE(device_id, request_id)
);
CREATE INDEX idea_swipes_device_idx ON idea_swipes(device_id);
CREATE INDEX credit_ledger_device_idx ON credit_ledger(device_id, created_at DESC);
