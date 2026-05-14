"use client";

import { useMemo } from "react";
import type { PropAccount, Trade } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingDown, AlertTriangle, Briefcase, Plus, MoreVertical } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

interface Props {
  account: PropAccount;
  trades: Trade[];
}

export function AccountCard({ account, trades }: Props) {
  const format = useFormatter();
  const t = useTranslations("wallet");
  
  // Compute PnL for this account
  const accountTrades = trades.filter((t) => t.account_id === account.id);
  const totalPnL = accountTrades.reduce((sum, t) => sum + (t.pnl_amount ?? 0), 0);
  const currentEquity = account.account_size + totalPnL;

  const pnlPercent = (totalPnL / account.account_size) * 100;
  
  // Progress calculations (only relevant for Prop Firm)
  const isProp = account.account_type === "prop";
  const targetVal = isProp ? account.account_size * (account.profit_target_pct / 100) : 0;
  const maxDdVal = isProp ? account.account_size * (account.max_dd_pct / 100) : 0;
  const dailyDdVal = isProp ? account.account_size * (account.daily_dd_pct / 100) : 0;

  const isFunded = account.status.toLowerCase() === "funded";
  const isFailed = account.status.toLowerCase() === "failed";

  const targetProgress = Math.min(100, Math.max(0, (totalPnL / targetVal) * 100));
  // Drawdown progress: 0% means no loss. 100% means breached.
  const maxDdProgress = Math.min(100, Math.max(0, (Math.abs(Math.min(0, totalPnL)) / maxDdVal) * 100));
  
  // For daily DD, we'd ideally calculate based on the day's starting equity, but for a simple display:
  const todayTrades = accountTrades.filter(
    (t) => new Date(t.entry_date).toDateString() === new Date().toDateString()
  );
  const todayPnL = todayTrades.reduce((sum, t) => sum + (t.pnl_amount ?? 0), 0);
  const dailyDdProgress = Math.min(100, Math.max(0, (Math.abs(Math.min(0, todayPnL)) / dailyDdVal) * 100));

  const fmtUsd = (v: number) => `$${format.number(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${!isProp ? "bg-purple-500" : isFunded ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-blue-500"}`} />
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              {account.firm_name}
            </CardTitle>
            <p className="text-sm font-mono text-muted-foreground mt-1">{fmtUsd(account.account_size)}</p>
          </div>
          {isProp ? (
            <Badge 
              variant="outline" 
              className={`
                ${isFunded ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : ""}
                ${isFailed ? "border-red-500/30 text-red-400 bg-red-500/10" : ""}
                ${!isFunded && !isFailed ? "border-blue-500/30 text-blue-400 bg-blue-500/10" : ""}
              `}
            >
              {account.status}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
              Personal
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("equity")}</p>
            <p className={`text-2xl font-mono font-bold ${totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {fmtUsd(currentEquity)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("totalPnl")}</p>
            <p className={`text-sm font-mono font-medium ${totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}{fmtUsd(totalPnL)} ({pnlPercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        {isProp && (
          <div className="space-y-4">
            {/* Target */}
            {!isFunded && !isFailed && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><Target className="w-3 h-3" /> {t("profitTarget")}</span>
                  <span className="font-mono text-emerald-400">{fmtUsd(Math.max(0, totalPnL))} / {fmtUsd(targetVal)}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${targetProgress}%` }} />
                </div>
              </div>
            )}

            {/* Max DD */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><TrendingDown className="w-3 h-3" /> {t("maxDrawdown")}</span>
                <span className={`font-mono ${maxDdProgress > 80 ? "text-red-400" : "text-amber-400"}`}>
                  {fmtUsd(Math.abs(Math.min(0, totalPnL)))} / {fmtUsd(maxDdVal)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${maxDdProgress > 80 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${maxDdProgress}%` }} />
              </div>
            </div>

            {/* Daily DD */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><AlertTriangle className="w-3 h-3" /> {t("dailyDrawdown")}</span>
                <span className={`font-mono ${dailyDdProgress > 80 ? "text-red-400" : "text-amber-400"}`}>
                  {fmtUsd(Math.abs(Math.min(0, todayPnL)))} / {fmtUsd(dailyDdVal)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${dailyDdProgress > 80 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${dailyDdProgress}%` }} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {isProp && isFunded && (
        <CardFooter className="pt-2 pb-4 border-t border-white/5">
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-muted-foreground">{t("totalPayouts")}</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{fmtUsd(account.total_payouts)}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
