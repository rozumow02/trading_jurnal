// Client-side trade mutations — uses browser client (safe in Client Components)
import { createClient } from "@/lib/supabase/client";
import type { Trade, PropAccount } from "./data";
import type { TradePayload } from "./trades-api";

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createTrade(payload: TradePayload): Promise<Trade> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const qty = payload.quantity;
  const entry = payload.buy_price;
  const exit = payload.sell_price ?? 0;
  const pnl_amount =
    payload.direction === "long" ? (exit - entry) * qty : (entry - exit) * qty;
  const pnl_percentage = entry > 0 ? (pnl_amount / (entry * qty)) * 100 : 0;

  const { data, error } = await supabase
    .from("trades")
    .insert([{ ...payload, pnl_amount, pnl_percentage, user_id: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Trade;
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export async function updateTrade(
  id: number,
  payload: Partial<TradePayload>
): Promise<Trade> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

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
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Trade;
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function deleteTrade(id: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);
}

// ─── PROP ACCOUNT MUTATIONS ───────────────────────────────────────────────────
export async function createPropAccount(
  payload: Omit<PropAccount, "id" | "created_at">
): Promise<PropAccount> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // account_type ustuni bazada yo'qligi uchun vaqtinchalik olib tashlaymiz
  const { account_type, ...dbPayload } = payload as any;

  const { data, error } = await supabase
    .from("prop_accounts")
    .insert([{ ...dbPayload, user_id: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PropAccount;
}

export async function updatePropAccount(
  id: string,
  payload: Partial<PropAccount>
): Promise<PropAccount> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // account_type ustuni bazada yo'qligi uchun vaqtinchalik olib tashlaymiz
  const { account_type, ...dbPayload } = payload as any;

  const { data, error } = await supabase
    .from("prop_accounts")
    .update(dbPayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PropAccount;
}

export async function deletePropAccount(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("prop_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
