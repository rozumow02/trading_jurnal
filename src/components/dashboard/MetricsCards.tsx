"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import type { Trade } from "@/lib/data";

export function MetricsCards({ trades }: { trades: Trade[] }) {
  const t = useTranslations("metrics");

  // Ochiq pozitsiyalar (is_pending) PnL/win-rate hisobiga kirmaydi — faqat yopilgan savdolar
  const closed = trades.filter((t) => !t.is_pending);
  const pendingCount = trades.length - closed.length;
  const totalPnL = closed.reduce((sum, t) => sum + (t.pnl_amount ?? 0), 0);
  const wins = closed.filter((t) => (t.pnl_amount ?? 0) > 0).length;
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0;
  const isProfit = totalPnL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <Card className="bg-white/2 border-white/5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">{t("totalPnl")}</p>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-bold font-mono tracking-tight ${isProfit ? "text-pnl-up" : "text-pnl-down"}`}>
              {isProfit ? "+" : ""}${totalPnL.toFixed(2)}
            </h3>
            <span className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${isProfit ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
              {isProfit ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {t("allTime")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/2 border-white/5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">{t("winRate")}</p>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-foreground tracking-tight">{winRate.toFixed(1)}%</h3>
            <span className="text-xs font-medium text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
              {wins}/{closed.length}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/2 border-white/5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">{t("totalTrades")}</p>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-foreground tracking-tight">{closed.length}</h3>
            {pendingCount > 0 ? (
              <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                +{pendingCount} open
              </span>
            ) : (
              <span className="text-xs font-medium text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">{t("allTime")}</span>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
