"use client";

import type { TradeStats } from "@/lib/stats";
import { TrendingUp, Activity } from "lucide-react";

interface Props { stats: TradeStats }

const row = (label: string, value: string, color?: string) => (
  <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-mono font-semibold ${color ?? "text-foreground"}`}>{value}</span>
  </div>
);

export function StatsTables({ stats }: Props) {
  const fmtUsd = (v: number) => `${v >= 0 ? "+" : ""}$${Math.abs(v).toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Profitability */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Profitability</h3>
        </div>
        {[
          ["Total Profit/Loss", fmtUsd(stats.totalPnL), stats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"],
          ["Average Profit/Loss", fmtUsd(stats.avgPnL), stats.avgPnL >= 0 ? "text-emerald-400" : "text-red-400"],
          ["Avg. Winning Trade", fmtUsd(stats.avgWin), "text-emerald-400"],
          ["Avg. Losing Trade", fmtUsd(stats.avgLoss), "text-red-400"],
          ["Largest Profit", fmtUsd(stats.largestWin), "text-emerald-400"],
          ["Largest Loss", fmtUsd(stats.largestLoss), "text-red-400"],
          ["Risk/Reward Ratio", stats.riskReward.toFixed(2), undefined],
          ["Win Rate", `${stats.winRate.toFixed(2)}%`, undefined],
          ["Sortino Ratio", stats.sortino.toFixed(2), undefined],
          ["Sharpe Ratio", stats.sharpe.toFixed(2), undefined],
        ].map(([label, value, color]) => row(label as string, value as string, color as string))}
      </div>

      {/* Trade Analysis */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Trade Analysis</h3>
        </div>
        {[
          ["Total Trades", String(stats.total)],
          ["Winning Trades", String(stats.wins)],
          ["Losing Trades", String(stats.losses)],
          ["Break Even Trades", String(stats.breakEven)],
          ["Max Consecutive Wins", String(stats.maxConsecWins)],
          ["Max Consecutive Losses", String(stats.maxConsecLosses)],
          ["Avg Hold Time (All)", `${stats.avgHoldTime.toFixed(1)} days`],
          ["Avg Hold Time (Winners)", `${stats.avgHoldTimeWins.toFixed(1)} days`],
          ["Avg Hold Time (Losers)", `${stats.avgHoldTimeLosses.toFixed(1)} days`],
        ].map(([label, value]) => row(label, value))}
      </div>
    </div>
  );
}
