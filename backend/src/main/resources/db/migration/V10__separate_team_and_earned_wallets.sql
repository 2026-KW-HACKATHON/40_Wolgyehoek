ALTER TABLE credit_wallets ADD COLUMN team_balance integer NOT NULL DEFAULT 0 CHECK(team_balance >= 0);
-- Move any unspent prototype team funding into its own wallet; never turn new top-ups into earned rewards.
WITH old_team AS (
 SELECT device_id, SUM(amount)::integer AS amount FROM credit_ledger WHERE kind IN ('DEMO_TOPUP','FUND','RETURN') GROUP BY device_id
)
UPDATE credit_wallets w SET balance=w.balance-t.amount,team_balance=t.amount
FROM old_team t WHERE w.device_id=t.device_id AND t.amount>=0 AND w.balance>=t.amount;
