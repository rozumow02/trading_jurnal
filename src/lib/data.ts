export type PropAccount = {
  id: string;
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
  pnl_amount: number;
  pnl_percentage: number;
  current_price: number | null;
  unrealized_pnl_amount: number | null;
  unrealized_pnl_percentage: number | null;
  created_at: string;
  updated_at: string;
  account_id: string | null;
  prop_accounts?: PropAccount | null; // For joined queries
};

export const mockTrades: Trade[] = [
  {
    id: 217326,
    trade_type: 1,
    symbol: "TON",
    direction: "long",
    quantity: "1.00000000",
    entry_date: "2026-04-29",
    exit_date: "2026-04-29",
    buy_price: "1.34100000",
    sell_price: "1.33700000",
    trade_link: "",
    trade_image: null,
    tags: [],
    trade_setup_notes: "HBS academi signal ucin kirdim",
    ml_notes: null,
    is_pending: false,
    pnl_amount: -0.004,
    pnl_percentage: -0.29828486204325133,
    current_price: null,
    unrealized_pnl_amount: null,
    unrealized_pnl_percentage: null,
    created_at: "2026-04-30T12:38:36.045472+05:00",
    updated_at: "2026-04-30T12:38:36.045486+05:00",
  },
  {
    id: 216973,
    trade_type: 1,
    symbol: "BTC",
    direction: "long",
    quantity: "0.10000000",
    entry_date: "2026-04-29",
    exit_date: "2026-04-29",
    buy_price: "76478.00000000",
    sell_price: "76760.00000000",
    trade_link: "https://www.tradingview.com/x/mhNuhrgb/",
    trade_image: null,
    tags: [],
    trade_setup_notes:
      "ozum girdim trend sell gidip durdy limitga goydym yenede sell gider dp",
    ml_notes: null,
    is_pending: false,
    pnl_amount: 28.2,
    pnl_percentage: 0.368733491984623,
    current_price: null,
    unrealized_pnl_amount: null,
    unrealized_pnl_percentage: null,
    created_at: "2026-04-29T11:29:17.194550+05:00",
    updated_at: "2026-04-29T11:29:17.194566+05:00",
  },
  {
    id: 216964,
    trade_type: 1,
    symbol: "BTC",
    direction: "long",
    quantity: "0.30000000",
    entry_date: "2026-04-28",
    exit_date: "2026-04-28",
    buy_price: "76262.00000000",
    sell_price: "76343.00000000",
    trade_link: "https://www.tradingview.com/x/I7sDbK27/",
    trade_image: null,
    tags: [],
    trade_setup_notes:
      "ozim trend gora girdim iki gezek sell gitdi 3 gezek yenede sell gidya dp acyldy",
    ml_notes: null,
    is_pending: false,
    pnl_amount: 24.3,
    pnl_percentage: 0.10621279274081456,
    current_price: null,
    unrealized_pnl_amount: null,
    unrealized_pnl_percentage: null,
    created_at: "2026-04-28T17:49:12.405984+05:00",
    updated_at: "2026-04-28T17:49:12.406000+05:00",
  },
  {
    id: 216962,
    trade_type: 1,
    symbol: "BTC",
    direction: "long",
    quantity: "0.10000000",
    entry_date: "2026-04-28",
    exit_date: "2026-04-29",
    buy_price: "77172.00000000",
    sell_price: "76971.00000000",
    trade_link: "https://www.tradingview.com/x/ZlR2DKHc/",
    trade_image: null,
    tags: [],
    trade_setup_notes:
      "ozum girdim sell gider oytdum (abdurahmon crypdo maslhati bilan) ocdim",
    ml_notes: null,
    is_pending: false,
    pnl_amount: -20.1,
    pnl_percentage: -0.2604571606282071,
    current_price: null,
    unrealized_pnl_amount: null,
    unrealized_pnl_percentage: null,
    created_at: "2026-04-28T13:37:22.191751+05:00",
    updated_at: "2026-04-29T11:25:09.825860+05:00",
  },
];
