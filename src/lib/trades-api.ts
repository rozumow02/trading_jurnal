import { createClient } from "./supabase/server";
import type { Trade, PropAccount } from "./data";

export type TradePayload = {
  trade_type?: number;
  symbol: string;
  direction: "long" | "short";
  quantity: number;
  entry_date: string;
  exit_date?: string;
  buy_price: number;
  sell_price?: number;
  trade_link?: string;
  trade_setup_notes?: string;
  is_pending?: boolean;
  account_id?: string | null;
  trade_image?: string | null;
  tags?: string[];
  fee?: number;
};

// ─── READ ────────────────────────────────────────────────────────────────────
export async function getTrades(): Promise<Trade[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from("trades")
    .select("*, prop_accounts(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Trade[];
}

export type Benchmarks = {
  series: {
    BTC?: { date: string; close: number }[];
    US500?: { date: string; close: number }[];
  };
};

export async function getBenchmarks(): Promise<Benchmarks> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("benchmarks")
    .select("symbol, date, close")
    .order("date", { ascending: true });

  const series: Record<string, { date: string; close: number }[]> = {};

  if (!error && data) {
    for (const row of data) {
      if (!series[row.symbol]) {
        series[row.symbol] = [];
      }
      series[row.symbol].push({
        date: row.date,
        close: Number(row.close),
      });
    }
  }

  return { series };
}

// ─── PROP ACCOUNTS (READ) ─────────────────────────────────────────────────────
export async function getPropAccounts(): Promise<PropAccount[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("prop_accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as PropAccount[];
}
