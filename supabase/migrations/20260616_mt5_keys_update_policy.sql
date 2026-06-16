-- mt5_api_keys uchun UPDATE policy
-- Avvalgi migration (20260603) da SELECT/INSERT/DELETE bor edi, lekin UPDATE yo'q edi.
-- Shuning uchun PATCH /api/mt5/keys (default_account_id yangilash) RLS ostida
-- jim turib 0 qator yangilar va xato qaytarmas edi.
-- Idempotent: necha marta ishlatsa ham xato bermaydi.

DO $$ BEGIN
  CREATE POLICY "owner update" ON mt5_api_keys
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
