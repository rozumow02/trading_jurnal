import { NextResponse } from "next/server";

// Benchmark price series: BTC and US500 (S&P 500)
// To connect to a real data source, replace this with an external API call.
// Example: CoinGecko for BTC, Alpha Vantage for US500
const BENCHMARKS = {
  BTC: [
    { date: "2026-04-28", close: 76342.77 },
    { date: "2026-04-29", close: 75780.0 },
    { date: "2026-04-30", close: 76346.57 },
    { date: "2026-05-01", close: 78231.13 },
    { date: "2026-05-02", close: 78302.02 },
  ],
  US500: [
    { date: "2026-04-28", close: 7138.8 },
    { date: "2026-04-29", close: 7135.95 },
    { date: "2026-04-30", close: 7209.01 },
    { date: "2026-05-01", close: 7230.12 },
  ],
};

export async function GET() {
  return NextResponse.json({ series: BENCHMARKS });
}
