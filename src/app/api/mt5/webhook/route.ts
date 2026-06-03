import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — RLS ni bypass qiladi, faqat server da ishlatiladi
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MT5TradePayload {
  ticket: number;
  symbol: string;
  type: "buy" | "sell";         // MT5 ORDER_TYPE
  volume: number;
  open_price: number;
  close_price: number;
  open_time: string;            // "YYYY.MM.DD HH:MM:SS" yoki ISO
  close_time: string;
  profit: number;
  swap?: number;
  commission?: number;
  comment?: string;
  magic?: number;
}

export async function POST(req: NextRequest) {
  // 1. API key tekshirish
  const apiKey = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const { data: keyRow, error: keyErr } = await supabaseAdmin
    .from("mt5_api_keys")
    .select("id, user_id")
    .eq("api_key", apiKey)
    .single();

  if (keyErr || !keyRow) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // 2. Body parse
  let body: MT5TradePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { ticket, symbol, type, volume, open_price, close_price, open_time, close_time, profit, comment } = body;

  if (!ticket || !symbol || !type || !volume || !open_price || !close_price || !open_time || !close_time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 3. MT5 → jurnal formatiga o'tkazish
  const direction = type === "buy" ? "long" : "short";
  const pnl_amount = Number(profit.toFixed(2));
  const cost_basis = open_price * volume;
  const pnl_percentage = cost_basis > 0 ? (pnl_amount / cost_basis) * 100 : 0;

  const tradeData = {
    user_id:          keyRow.user_id,
    symbol:           symbol.toUpperCase(),
    direction,
    quantity:         volume,
    buy_price:        direction === "long" ? open_price : close_price,
    sell_price:       direction === "long" ? close_price : open_price,
    entry_date:       normaliseDate(open_time),
    exit_date:        normaliseDate(close_time),
    pnl_amount,
    pnl_percentage,
    trade_setup_notes: comment ?? "",
    is_pending:       false,
    mt5_ticket:       ticket,
    mt5_imported_at:  new Date().toISOString(),
  };

  // 4. Upsert — bir trade ikki marta importlanmaydi
  const { data: saved, error: saveErr } = await supabaseAdmin
    .from("trades")
    .upsert(tradeData, { onConflict: "user_id,mt5_ticket", ignoreDuplicates: false })
    .select()
    .single();

  if (saveErr) {
    console.error("[mt5/webhook] save error:", saveErr);
    return NextResponse.json({ error: saveErr.message }, { status: 500 });
  }

  // 5. last_used yangilash
  await supabaseAdmin
    .from("mt5_api_keys")
    .update({ last_used: new Date().toISOString() })
    .eq("id", keyRow.id);

  return NextResponse.json({ ok: true, trade_id: saved.id });
}

// MT5 "YYYY.MM.DD HH:MM:SS" yoki ISO formatini ISO ga o'tkazadi
function normaliseDate(dt: string): string {
  if (dt.includes("T")) return dt;
  // "2026.06.02 14:30:00" → "2026-06-02T14:30:00"
  return dt.replace(/\./g, "-").replace(" ", "T");
}
