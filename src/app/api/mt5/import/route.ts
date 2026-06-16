import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Encoding helper ──────────────────────────────────────────────────────────

async function readFileText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // UTF-16 LE BOM: FF FE
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buffer);
  }
  // UTF-16 BE BOM: FE FF
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buffer);
  }
  // Default UTF-8
  return new TextDecoder("utf-8").decode(buffer);
}

// ─── Number helper ────────────────────────────────────────────────────────────

// "10 687.95" → 10687.95  |  "-0.76" → -0.76
function parseNum(s: string): number {
  return parseFloat(s.replace(/\s/g, "")) || 0;
}

function isDate(s: string): boolean {
  return /^\d{4}[.\-]\d{2}[.\-]\d{2}/.test(s);
}

function normaliseDate(dt: string): string {
  if (!dt) return new Date().toISOString();
  if (dt.includes("T")) return dt;
  return dt.replace(/\./g, "-").replace(" ", "T");
}

// Ticket topilmaganda savdoning o'zgarmas atributlaridan barqaror (deterministik)
// ID yasaymiz. Bir xil savdo har doim bir xil son beradi → qayta import qilinganda
// (user_id, mt5_ticket) unique index dublikatni to'sadi. Date.now() ishlatilsa
// har import da boshqa son chiqib, dublikat savdo yaratardi.
function stableTicket(symbol: string, openTime: string, volume: number, price: number): number {
  const key = `${symbol}|${openTime}|${volume}|${price}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) % Number.MAX_SAFE_INTEGER;
  }
  return h;
}

// ─── HTML Parser ──────────────────────────────────────────────────────────────

function parseHtml(html: string): ParsedTrade[] {
  const trades: ParsedTrade[] = [];

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];

    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
    }

    if (cells.length < 12) continue;

    const type = cells[3]?.toLowerCase();
    if (type !== "buy" && type !== "sell") continue;

    let trade: ParsedTrade | null = null;

    // Format A — "Trade History Report" (PrimaX/standard):
    // [0]OpenTime [1]PosID [2]Symbol [3]Type [4]Comment [5]Vol [6]OpenPrice
    // [7]SL [8]TP [9]CloseTime [10]ClosePrice [11]Comm [12]Swap [13]Profit
    if (cells.length >= 14 && isDate(cells[0]) && isDate(cells[9])) {
      trade = {
        symbol:      cells[2].toUpperCase(),
        direction:   type === "buy" ? "long" : "short",
        volume:      parseNum(cells[5]),
        open_price:  parseNum(cells[6]),
        close_price: parseNum(cells[10]),
        open_time:   normaliseDate(cells[0]),
        close_time:  normaliseDate(cells[9]),
        profit:      parseNum(cells[13]),
        commission:  parseNum(cells[11]),
        swap:        parseNum(cells[12]),
        position_id: parseInt(cells[1]) || stableTicket(cells[2], normaliseDate(cells[0]), parseNum(cells[5]), parseNum(cells[6])),
      };
    }
    // Format B — "Account Statement" (no comment column):
    // [0]OpenTime [1]PosID [2]Symbol [3]Type [4]Vol [5]OpenPrice
    // [6]SL [7]TP [8]CloseTime [9]ClosePrice [10]Comm [11]Swap [12]Profit
    else if (cells.length >= 13 && isDate(cells[0]) && isDate(cells[8])) {
      trade = {
        symbol:      cells[2].toUpperCase(),
        direction:   type === "buy" ? "long" : "short",
        volume:      parseNum(cells[4]),
        open_price:  parseNum(cells[5]),
        close_price: parseNum(cells[9]),
        open_time:   normaliseDate(cells[0]),
        close_time:  normaliseDate(cells[8]),
        profit:      parseNum(cells[12]),
        commission:  parseNum(cells[10]),
        swap:        parseNum(cells[11]),
        position_id: parseInt(cells[1]) || stableTicket(cells[2], normaliseDate(cells[0]), parseNum(cells[4]), parseNum(cells[5])),
      };
    }

    if (trade && trade.volume > 0 && trade.open_price > 0) {
      trades.push(trade);
    }
  }

  return trades;
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCsv(text: string): ParsedTrade[] {
  const trades: ParsedTrade[] = [];
  const lines = text.split(/\r?\n/).filter(Boolean);

  const headerIdx = lines.findIndex(
    (l) => /time/i.test(l) && /symbol/i.test(l) && /profit/i.test(l)
  );
  if (headerIdx < 0) return trades;

  const sep = lines[headerIdx].includes(";") ? ";" : ",";
  const headers = lines[headerIdx].split(sep).map((h) => h.trim().toLowerCase());

  const col = (row: string[], name: string) => {
    const i = headers.findIndex((h) => h.includes(name));
    return i >= 0 ? (row[i] ?? "").trim() : "";
  };

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = lines[i].split(sep);
    const direction = col(row, "direction").toLowerCase();
    if (direction !== "out" && direction !== "in/out") continue;

    const type   = col(row, "type").toLowerCase();
    const volume = parseNum(col(row, "volume"));
    const price  = parseNum(col(row, "price"));
    const profit = parseNum(col(row, "profit"));
    const symbol = col(row, "symbol").toUpperCase();
    const time   = col(row, "time");
    const posId  = parseInt(col(row, "deal") || col(row, "position")) || stableTicket(symbol, normaliseDate(time), volume, price);

    if (!symbol || volume <= 0 || price <= 0) continue;

    trades.push({
      symbol,
      direction:   type === "buy" ? "long" : "short",
      volume,
      open_price:  price,
      close_price: price,
      open_time:   normaliseDate(time),
      close_time:  normaliseDate(time),
      profit,
      swap:        parseNum(col(row, "swap")),
      commission:  parseNum(col(row, "commission")),
      position_id: posId,
    });
  }

  return trades;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const accountId = (formData.get("account_id") as string | null) || null;

  // account_id egaligini tekshiramiz — pastda admin (service-role) client RLS ni
  // chetlab o'tib yozadi, shuning uchun bu yerda foydalanuvchi shu akkaunt egasi
  // ekanini RLS-li client bilan tasdiqlash shart (IDOR oldini olish).
  if (accountId) {
    const { data: acc } = await supabase
      .from("prop_accounts")
      .select("id")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();
    if (!acc) return NextResponse.json({ error: "Invalid account" }, { status: 403 });
  }

  // Encoding-aware file read
  const text = await readFileText(file);
  const fileName = file.name.toLowerCase();

  let parsed: ParsedTrade[] = [];
  if (fileName.endsWith(".csv")) {
    parsed = parseCsv(text);
  } else {
    parsed = parseHtml(text);
    if (parsed.length === 0) parsed = parseCsv(text);
  }

  if (parsed.length === 0) {
    return NextResponse.json(
      { error: "No trades found. Export as 'Account Statement' (HTML) or CSV from MT5 History tab." },
      { status: 422 }
    );
  }

  const rows = parsed.map((t) => ({
    user_id:         user.id,
    symbol:          t.symbol,
    direction:       t.direction,
    quantity:        t.volume,
    buy_price:       t.direction === "long" ? t.open_price  : t.close_price,
    sell_price:      t.direction === "long" ? t.close_price : t.open_price,
    entry_date:      t.open_time,
    exit_date:       t.close_time,
    pnl_amount:      parseFloat(t.profit.toFixed(2)),
    pnl_percentage:  t.open_price > 0 ? (t.profit / (t.open_price * t.volume)) * 100 : 0,
    is_pending:      false,
    account_id:      accountId,
    mt5_ticket:      t.position_id,
    mt5_imported_at: new Date().toISOString(),
  }));

  const { data, error } = await supabaseAdmin
    .from("trades")
    .upsert(rows, { onConflict: "user_id,mt5_ticket", ignoreDuplicates: true })
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ imported: data?.length ?? 0, total: parsed.length });
}
