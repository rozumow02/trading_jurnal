// Client-side trade mutations — uses browser client (safe in Client Components)
import { createClient } from "@/lib/supabase/client";
import type { Trade, PropAccount } from "./data";
import type { TradePayload } from "./trades-api";

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createTrade(payload: TradePayload): Promise<Trade> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Ochiq pozitsiya (hali yopilmagan) — PnL hisoblanmaydi, savdo yopilganda
  // (EditTradeModal orqali is_pending=false bo'lganda) hisoblanadi.
  const qty = payload.quantity;
  const entry = payload.buy_price;
  const exit = payload.sell_price ?? 0;
  const fee = payload.fee ?? 0;
  const gross = payload.direction === "long" ? (exit - entry) * qty : (entry - exit) * qty;
  // Net = gross - fee. Account-% display vaqtida hisoblanadi → pnl_percentage = 0.
  const pnl_amount = payload.is_pending ? 0 : gross - fee;
  const pnl_percentage = 0;

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
  const fee = payload.fee ?? 0;

  if (payload.is_pending === true) {
    // Ochiq pozitsiyaga o'tkazilsa — PnL nollanadi
    extraFields = { pnl_amount: 0, pnl_percentage: 0 };
  } else if (qty !== undefined && entry !== undefined && exit !== undefined && exit > 0 && dir !== undefined) {
    const gross = dir === "long" ? (exit - entry) * qty : (entry - exit) * qty;
    // Net = gross - fee; account-% display vaqtida hisoblanadi.
    extraFields = { pnl_amount: gross - fee, pnl_percentage: 0 };
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { account_type, ...dbPayload } = payload as Record<string, unknown>;

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { account_type, ...dbPayload } = payload as Record<string, unknown>;

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

  // Cascade: avval shu account'ga bog'langan barcha savdolarni o'chiramiz,
  // keyin account'ni. (trades FK xatti-harakati DB da kafolatlanmagani uchun
  // ilova darajasida ishonchli o'chiramiz.)
  const { error: tradesErr } = await supabase
    .from("trades")
    .delete()
    .eq("account_id", id)
    .eq("user_id", user.id);

  if (tradesErr) throw new Error(tradesErr.message);

  const { error } = await supabase
    .from("prop_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
