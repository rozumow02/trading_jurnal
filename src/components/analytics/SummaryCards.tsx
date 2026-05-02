"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Target, Activity, Clock, BarChart3 } from "lucide-react";
import type { TradeStats } from "@/lib/stats";

interface Props { stats: TradeStats; }

const fmtUsd = (v: number) => `${v >= 0 ? "+" : ""}$${Math.abs(v).toFixed(2)}`;
const fmtPct = (v: number) => `${v.toFixed(2)}%`;

export function SummaryCards({ stats }: Props) {
  const cards = [
    {
      label: "Total P&L",
      value: fmtUsd(stats.totalPnL),
      positive: stats.totalPnL >= 0,
      icon: Activity,
      glow: stats.totalPnL >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
      iconBg: stats.totalPnL >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      iconColor: stats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
      valueColor: stats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Win Rate",
      value: fmtPct(stats.winRate),
      icon: Target,
      glow: "rgba(139,92,246,0.15)",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
      valueColor: "text-foreground",
    },
    {
      label: "Risk/Reward",
      value: stats.riskReward.toFixed(2),
      icon: BarChart3,
      glow: "rgba(59,130,246,0.15)",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      valueColor: "text-foreground",
    },
    {
      label: "Avg Win",
      value: fmtUsd(stats.avgWin),
      positive: true,
      icon: TrendingUp,
      glow: "rgba(16,185,129,0.12)",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      label: "Avg Loss",
      value: fmtUsd(stats.avgLoss),
      positive: false,
      icon: TrendingDown,
      glow: "rgba(239,68,68,0.12)",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      valueColor: "text-red-400",
    },
    {
      label: "Avg Hold",
      value: `${stats.avgHoldTime.toFixed(1)} days`,
      icon: Clock,
      glow: "rgba(245,158,11,0.12)",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      valueColor: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 group hover:border-white/10 transition-all duration-300 overflow-hidden"
          style={{ boxShadow: `0 0 20px ${card.glow}` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
            <card.icon className={`w-4 h-4 ${card.iconColor}`} />
          </div>
          <p className={`text-xl font-bold font-mono ${card.valueColor}`}>{card.value}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
