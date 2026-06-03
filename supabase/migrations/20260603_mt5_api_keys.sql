-- MT5 API Keys jadvali + trades ga mt5 ustunlar
-- Idempotent: necha marta ishlatsa ham xato bermaydi

-- ─── mt5_api_keys jadvali ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mt5_api_keys (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key             text        UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  label               text        NOT NULL DEFAULT 'MT5 Account',
  default_account_id  uuid        REFERENCES prop_accounts(id) ON DELETE SET NULL,
  last_used           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- default_account_id ustunini qo'shamiz (eski migration da yo'q bo'lishi mumkin)
ALTER TABLE mt5_api_keys
  ADD COLUMN IF NOT EXISTS default_account_id uuid REFERENCES prop_accounts(id) ON DELETE SET NULL;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE mt5_api_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "owner select" ON mt5_api_keys
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "owner insert" ON mt5_api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "owner delete" ON mt5_api_keys
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── trades jadvaliga mt5 ustunlar ───────────────────────────────────────────

ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS mt5_ticket      bigint,
  ADD COLUMN IF NOT EXISTS mt5_imported_at timestamptz;

-- Partial index o'rniga to'liq unique index (Supabase upsert bilan ishlaydi)
-- NULL != NULL Postgres da, shuning uchun qo'lda kiritilgan tradelar to'qnashmaydi
DROP INDEX IF EXISTS trades_mt5_ticket_user;

CREATE UNIQUE INDEX IF NOT EXISTS trades_mt5_ticket_user
  ON trades (user_id, mt5_ticket);
