export type PropAccount = {
  id: string;
  account_type: "prop" | "personal";
  firm_name: string;
  account_size: number;
  status: string;
  profit_target_pct: number;
  daily_dd_pct: number;
  max_dd_pct: number;
  total_payouts: number;
  created_at: string;
};

export type Trade = {
  id: number;
  trade_type: number;
  symbol: string;
  direction: "long" | "short";
  quantity: string;
  entry_date: string;
  exit_date: string;
  buy_price: string;
  sell_price: string;
  trade_link: string;
  trade_image: string | null;
  tags: string[];
  trade_setup_notes: string;
  ml_notes: string | null;
  is_pending: boolean;
  pnl_amount: number;       // NET (gross - fee)
  pnl_percentage: number;   // deprecated — account-% endi display vaqtida hisoblanadi
  fee: number;
  current_price: number | null;
  unrealized_pnl_amount: number | null;
  unrealized_pnl_percentage: number | null;
  created_at: string;
  updated_at: string;
  account_id: string | null;
  prop_accounts?: PropAccount | null; // For joined queries
};
