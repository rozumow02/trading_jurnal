import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── MT5 HTML/CSV parser ──────────────────────────────────────────────────────

type ParsedTrade = {
  symbol: string;
  direction: "long" | "short";
  volume: number;
  open_price: number;
  close_price: number;
  open_time: string;
  close_time: string;
  profit: number;
  swap: number;
  commission: number;
  position_id: number;
};

// MT5 "Account Statement" HTML reportini parse qiladi
// Columns: Open Time | Position | Symbol | Type | Volume | Price | S/L | T/P | Close Time | Close Price | Commission | Swap | Profit
function parseHtml(html: string): ParsedTrade[] {
  const trades: ParsedTrade[] = [];

  // Barcha <tr> larni olish
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];

    let cellMatch: RegExpExecArray | null;
    const cellRe = new RegExp(cellRegex.source, "gi");
    while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
      // HTML taglarni olib, bo'sh joylarni tozalaymiz
      cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
    }

    if (cells.length < 10) continue;

    const trade = tryParseStatementRow(cells) ?? tryParseDealsRow(cells);
    if (trade) trades.push(trade);
  }

  return trades;
}

// MT5 Statement (positions) format: Open Time | Position | Symbol | Type | Volume | Open Price | S/L | T/P | Close Time | Close Price | Commission | Swap | Profit
function tryParseStatementRow(cells: string[]): ParsedTrade | null {
  // Open Time: "2026.06.01 10:30:00" yoki "2026-06-01 10:30:00"
  if (!/^\d{4}[.\-]\d{2}[.\-]\d{2}/.test(cells[0])) return null;
  // Close Time ham mavjud bo'lishi kerak (8-indeks)
  if (!/^\d{4}[.\-]\d{2}[.\-]\d{2}/.test(cells[8])) return null;

  const type = cells[3]?.toLowerCase();
  if (type !== "buy" && type !== "sell") return null;

  const volume     = parseFloat(cells[4]);
  const openPrice  = parseFloat(cells[5]);
  const closePrice = parseFloat(cells[9]);
  const commission = parseFloat(cells[10]) || 0;
  const swap       = parseFloat(cells[11]) || 0;
  const profit     = parseFloat(cells[12]);
  const positionId = parseInt(cells[1]) || 0;

  if (isNaN(volume) || isNaN(openPrice) || isNaN(closePrice) || isNaN(profit)) return null;

  return {
    symbol:      cells[2].toUpperCase(),
    direction:   type === "buy" ? "long" : "short",
    volume,
    open_price:  openPrice,
    close_price: closePrice,
    open_time:   normaliseDate(cells[0]),
    close_time:  normaliseDate(cells[8]),
    profit,
    swap,
    commission,
    position_id: positionId,
  };
}

// MT5 Deals format (juftlashtirilgan IN+OUT): Time | Deal | Symbol | Type | Direction | Volume | Price | ... | Profit
function tryParseDealsRow(cells: string[]): ParsedTrade | null {
  if (!/^\d{4}[.\-]\d{2}[.\-]\d{2}/.test(cells[0])) return null;
  const direction = cells[4]?.toLowerCase();
  if (direction !== "out" && direction !== "in/out") return null;

  const type    = cells[3]?.toLowerCase();
  const volume  = parseFloat(cells[5]);
  const price   = parseFloat(cells[6]);
  const profit  = parseFloat(cells[10]) || parseFloat(cells[9]) || 0;

  if (isNaN(volume) || isNaN(price)) return null;

  return {
    symbol:      cells[2].toUpperCase(),
    direction:   type === "buy" ? "long" : "short",
    volume,
    open_price:  price,
    close_price: price,
    open_time:   normaliseDate(cells[0]),
    close_time:  normaliseDate(cells[0]),
    profit,
    swap:        0,
    commission:  0,
    position_id: parseInt(cells[1]) || Date.now(),
  };
}

// MT5 CSV: # ; Time ; Deal ; Symbol ; Type ; Direction ; Volume ; Price ; Order ; Commission ; Swap ; Profit ; Balance ; Comment
function parseCsv(text: string): ParsedTrade[] {
  const trades: ParsedTrade[] = [];
  const lines = text.split(/\r?\n/).filter(Boolean);

  // Header qatorini toping
  const headerIdx = lines.findIndex(l =>
    /time/i.test(l) && /symbol/i.test(l) && /profit/i.test(l)
  );
  if (headerIdx < 0) return trades;

  const sep = lines[headerIdx].includes(";") ? ";" : ",";
  const headers = lines[headerIdx].split(sep).map(h => h.trim().toLowerCase());

  const col = (row: string[], name: string) => {
    const i = headers.findIndex(h => h.includes(name));
    return i >= 0 ? (row[i] ?? "").trim() : "";
  };

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = lines[i].split(sep);
    const direction = col(row, "direction").toLowerCase();
    if (direction !== "out" && direction !== "in/out") continue;

    const type   = col(row, "type").toLowerCase();
    const volume = parseFloat(col(row, "volume"));
    const price  = parseFloat(col(row, "price"));
    const profit = parseFloat(col(row, "profit"));
    const symbol = col(row, "symbol").toUpperCase();
    const time   = col(row, "time");
    const posId  = parseInt(col(row, "deal") || col(row, "position")) || Date.now();

    if (!symbol || isNaN(volume) || isNaN(price)) continue;

    trades.push({
      symbol,
      direction: type === "buy" ? "long" : "short",
      volume,
      open_price:  price,
      close_price: price,
      open_time:   normaliseDate(time),
      close_time:  normaliseDate(time),
      profit,
      swap:        parseFloat(col(row, "swap")) || 0,
      commission:  parseFloat(col(row, "commission")) || 0,
      position_id: posId,
    });
  }

  return trades;
}

function normaliseDate(dt: string): string {
  if (!dt) return new Date().toISOString();
  if (dt.includes("T")) return dt;
  return dt.replace(/\./g, "-").replace(" ", "T");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const fileName = file.name.toLowerCase();

  let parsed: ParsedTrade[] = [];
  if (fileName.endsWith(".csv")) {
    parsed = parseCsv(text);
  } else {
    // .htm / .html
    parsed = parseHtml(text);
    if (parsed.length === 0) {
      // HTML bo'lishi mumkin lekin CSV formatdagi content bilan
      parsed = parseCsv(text);
    }
  }

  if (parsed.length === 0) {
    return NextResponse.json({ error: "No trades found in file. Make sure to export as Account Statement (HTML) or CSV from MT5 History tab." }, { status: 422 });
  }

  // Supabase ga upsert
  const rows = parsed.map(t => ({
    user_id:          user.id,
    symbol:           t.symbol,
    direction:        t.direction,
    quantity:         t.volume,
    buy_price:        t.direction === "long" ? t.open_price : t.close_price,
    sell_price:       t.direction === "long" ? t.close_price : t.open_price,
    entry_date:       t.open_time,
    exit_date:        t.close_time,
    pnl_amount:       parseFloat(t.profit.toFixed(2)),
    pnl_percentage:   t.open_price > 0 ? (t.profit / (t.open_price * t.volume)) * 100 : 0,
    is_pending:       false,
    mt5_ticket:       t.position_id,
    mt5_imported_at:  new Date().toISOString(),
  }));

  const { data, error } = await supabaseAdmin
    .from("trades")
    .upsert(rows, { onConflict: "user_id,mt5_ticket", ignoreDuplicates: true })
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ imported: data?.length ?? 0, total: parsed.length });
}
