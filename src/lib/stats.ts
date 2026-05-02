import type { Trade } from "./data";

export type TradeStats = {
  totalPnL: number;
  avgPnL: number;
  winRate: number;
  riskReward: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgHoldTime: number;
  avgHoldTimeWins: number;
  avgHoldTimeLosses: number;
  sharpe: number;
  sortino: number;
  total: number;
  wins: number;
  losses: number;
  breakEven: number;
  maxConsecWins: number;
  maxConsecLosses: number;
};

function getHoldDays(t: Trade): number {
  if (!t.exit_date || !t.entry_date) return 0;
  const diff = new Date(t.exit_date).getTime() - new Date(t.entry_date).getTime();
  return Math.max(0, diff / 86_400_000);
}

export function filterTrades(
  trades: Trade[],
  type: "total" | "stock" | "crypto",
  time: "all" | "30d" | "7d" | "month"
): Trade[] {
  const now = new Date();
  let result = [...trades];

  if (type === "crypto") result = result.filter((t) => t.trade_type === 1);
  else if (type === "stock") result = result.filter((t) => t.trade_type !== 1);

  if (time !== "all") {
    const cutoff = new Date();
    if (time === "7d") cutoff.setDate(now.getDate() - 7);
    else if (time === "30d") cutoff.setDate(now.getDate() - 30);
    else if (time === "month") cutoff.setDate(1);
    result = result.filter((t) => new Date(t.entry_date) >= cutoff);
  }
  return result;
}

export function computeStats(trades: Trade[]): TradeStats {
  const closed = trades.filter((t) => !t.is_pending);
  const wins = closed.filter((t) => (t.pnl_amount ?? 0) > 0);
  const losses = closed.filter((t) => (t.pnl_amount ?? 0) < 0);
  const breakEven = closed.filter((t) => (t.pnl_amount ?? 0) === 0);

  const totalPnL = closed.reduce((s, t) => s + (t.pnl_amount ?? 0), 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl_amount ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl_amount ?? 0), 0) / losses.length : 0;
  const riskReward = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl_amount ?? 0)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl_amount ?? 0)) : 0;
  const avgPnL = closed.length > 0 ? totalPnL / closed.length : 0;

  const holdTimes = closed.map(getHoldDays);
  const avgHoldTime = holdTimes.length > 0 ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length : 0;
  const avgHoldTimeWins = wins.length > 0 ? wins.map(getHoldDays).reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgHoldTimeLosses = losses.length > 0 ? losses.map(getHoldDays).reduce((a, b) => a + b, 0) / losses.length : 0;

  // Returns for Sharpe/Sortino
  const returns = closed.map((t) => {
    const notional = parseFloat(t.buy_price) * parseFloat(t.quantity);
    return notional > 0 ? (t.pnl_amount ?? 0) / notional : 0;
  });
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1 ? returns.reduce((s, r) => s + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const sharpe = stdDev > 0 ? meanReturn / stdDev : 0;
  const downsideVar = returns.length > 1 ? returns.reduce((s, r) => s + Math.pow(Math.min(r, 0), 2), 0) / (returns.length - 1) : 0;
  const sortino = Math.sqrt(downsideVar) > 0 ? meanReturn / Math.sqrt(downsideVar) : 0;

  // Max consecutive
  const sorted = [...closed].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
  let maxConsecWins = 0, maxConsecLosses = 0, cur = 0, prev = 0;
  for (const t of sorted) {
    const pnl = t.pnl_amount ?? 0;
    if (pnl > 0) { cur = prev === 1 ? cur + 1 : 1; maxConsecWins = Math.max(maxConsecWins, cur); prev = 1; }
    else if (pnl < 0) { cur = prev === -1 ? cur + 1 : 1; maxConsecLosses = Math.max(maxConsecLosses, cur); prev = -1; }
    else { cur = 0; prev = 0; }
  }

  return {
    totalPnL, avgPnL, winRate, riskReward,
    avgWin, avgLoss, largestWin, largestLoss,
    avgHoldTime, avgHoldTimeWins, avgHoldTimeLosses,
    sharpe, sortino,
    total: closed.length, wins: wins.length, losses: losses.length, breakEven: breakEven.length,
    maxConsecWins, maxConsecLosses,
  };
}

export function buildEquityCurve(trades: Trade[]): { date: string; value: number }[] {
  const sorted = [...trades]
    .filter((t) => !t.is_pending)
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
  let cumulative = 0;
  return sorted.map((t) => {
    cumulative += t.pnl_amount ?? 0;
    return { date: t.entry_date, value: parseFloat(cumulative.toFixed(2)) };
  });
}
