import { supabase } from "./supabase";
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
};

// ─── READ ────────────────────────────────────────────────────────────────────
export async function getTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*, prop_accounts(*)")
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

// ─── PROP ACCOUNTS ───────────────────────────────────────────────────────────
export async function getPropAccounts(): Promise<PropAccount[]> {
  const { data, error } = await supabase
    .from("prop_accounts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as PropAccount[];
}

export async function createPropAccount(
  payload: Omit<PropAccount, "id" | "created_at">
): Promise<PropAccount> {
  const { data, error } = await supabase
    .from("prop_accounts")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PropAccount;
}

export async function updatePropAccount(
  id: string,
  payload: Partial<PropAccount>
): Promise<PropAccount> {
  const { data, error } = await supabase
    .from("prop_accounts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PropAccount;
}

export async function deletePropAccount(id: string): Promise<void> {
  const { error } = await supabase.from("prop_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createTrade(payload: TradePayload): Promise<Trade> {
  // Calculate PnL
  const qty = payload.quantity;
  const entry = payload.buy_price;
  const exit = payload.sell_price ?? 0;
  const pnl_amount =
    payload.direction === "long" ? (exit - entry) * qty : (entry - exit) * qty;
  const pnl_percentage = entry > 0 ? (pnl_amount / (entry * qty)) * 100 : 0;

  const { data, error } = await supabase
    .from("trades")
    .insert([{ ...payload, pnl_amount, pnl_percentage }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Trade;
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export async function updateTrade(
  id: number,
  payload: Partial<TradePayload>,
): Promise<Trade> {
  // Recalculate PnL if price-related fields are present
  let extraFields: Record<string, number> = {};
  const qty = payload.quantity;
  const entry = payload.buy_price;
  const exit = payload.sell_price;
  const dir = payload.direction;

  if (qty !== undefined && entry !== undefined && exit !== undefined && exit > 0 && dir !== undefined) {
    const pnl_amount = dir === "long" ? (exit - entry) * qty : (entry - exit) * qty;
    const pnl_percentage = entry > 0 ? (pnl_amount / (entry * qty)) * 100 : 0;
    extraFields = { pnl_amount, pnl_percentage };
  }

  const { data, error } = await supabase
    .from("trades")
    .update({ ...payload, ...extraFields })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Trade;
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function deleteTrade(id: number): Promise<void> {
  const { error } = await supabase.from("trades").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
