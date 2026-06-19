-- Har savdoga fee (komissiya) ustuni
-- pnl_amount endi NET (gross - fee) saqlanadi; fee alohida ham saqlanadi.
-- Idempotent.

ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS fee numeric NOT NULL DEFAULT 0;
