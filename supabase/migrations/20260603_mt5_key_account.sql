-- mt5_api_keys jadvaliga default account qo'shamiz
ALTER TABLE mt5_api_keys
  ADD COLUMN IF NOT EXISTS default_account_id uuid REFERENCES prop_accounts(id) ON DELETE SET NULL;
