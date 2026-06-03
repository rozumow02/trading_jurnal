-- MT5 API Keys jadvali
-- Har user uchun bir yoki bir nechta API key saqlaydi.
-- EA shu keyni Authorization headerida yuboradi.

CREATE TABLE IF NOT EXISTS mt5_api_keys (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key     text        UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  label       text        NOT NULL DEFAULT 'MT5 Account',
  last_used   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Faqat key egasi o'qiy/yoza oladi
ALTER TABLE mt5_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner select" ON mt5_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner insert" ON mt5_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner delete" ON mt5_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- mt5_ticket_id ustunini trades jadvaliga qo'shamiz (duplicate oldini olish uchun)
ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS mt5_ticket bigint,
  ADD COLUMN IF NOT EXISTS mt5_imported_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS trades_mt5_ticket_user
  ON trades (user_id, mt5_ticket)
  WHERE mt5_ticket IS NOT NULL;
