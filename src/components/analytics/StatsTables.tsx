"use client";

import type { TradeStats } from "@/lib/stats";
import { TrendingUp, Activity } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props { stats: TradeStats }

const row = (label: string, value: string, color?: string) => (
  <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-mono font-semibold ${color ?? "text-foreground"}`}>{value}</span>
  </div>
);

export function StatsTables({ stats }: Props) {
  const t = useTranslations("analytics");
  const fmtUsd = (v: number) => `${v >= 0 ? "+" : ""}$${Math.abs(v).toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Profitability */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{t("profitability")}</h3>
        </div>
        {[
          [t("totalPnL"), fmtUsd(stats.totalPnL), stats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"],
          [t("averagePnL"), fmtUsd(stats.avgPnL), stats.avgPnL >= 0 ? "text-emerald-400" : "text-red-400"],
          [t("avgWinningTrade"), fmtUsd(stats.avgWin), "text-emerald-400"],
          [t("avgLosingTrade"), fmtUsd(stats.avgLoss), "text-red-400"],
          [t("largestProfit"), fmtUsd(stats.largestWin), "text-emerald-400"],
          [t("largestLoss"), fmtUsd(stats.largestLoss), "text-red-400"],
          [t("riskRewardRatio"), stats.riskReward.toFixed(2), undefined],
          [t("winRate"), `${stats.winRate.toFixed(2)}%`, undefined],
          [t("sortinoRatio"), stats.sortino.toFixed(2), undefined],
          [t("sharpeRatio"), stats.sharpe.toFixed(2), undefined],
        ].map(([label, value, color]) => row(label as string, value as string, color as string))}
      </div>

      {/* Trade Analysis */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{t("tradeAnalysis")}</h3>
        </div>
        {[
          [t("totalTrades"), String(stats.total)],
          [t("winningTrades"), String(stats.wins)],
          [t("losingTrades"), String(stats.losses)],
          [t("breakEvenTrades"), String(stats.breakEven)],
          [t("maxConsecWins"), String(stats.maxConsecWins)],
          [t("maxConsecLosses"), String(stats.maxConsecLosses)],
          [t("avgHoldTimeAll"), `${stats.avgHoldTime.toFixed(1)} ${t("days")}`],
          [t("avgHoldTimeWins"), `${stats.avgHoldTimeWins.toFixed(1)} ${t("days")}`],
          [t("avgHoldTimeLosses"), `${stats.avgHoldTimeLosses.toFixed(1)} ${t("days")}`],
        ].map(([label, value]) => row(label, value))}
      </div>
    </div>
  );
}
