"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { Trade, PropAccount } from "@/lib/data";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { TradesTable } from "@/components/trades/TradesTable";
import { RiskCalculator } from "@/components/trades/RiskCalculator";

interface Props {
  trades: Trade[];
  accounts: PropAccount[];
}

// Wallet filtri — tanlangan account metrika kartalariga ham, jadvalaga ham ta'sir qiladi.
// Default: "" = barcha walletlar.
export function DashboardClient({ trades, accounts }: Props) {
  const t = useTranslations("trades");
  const [accountId, setAccountId] = React.useState<string>("");

  const filtered = React.useMemo(
    () => (accountId ? trades.filter((tr) => tr.account_id === accountId) : trades),
    [trades, accountId]
  );

  return (
    <div className="space-y-8">
      {accounts.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            {t("filterByWallet")}:
          </span>
          <button
            onClick={() => setAccountId("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              accountId === ""
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-white/5 text-muted-foreground border-white/10 hover:text-foreground"
            }`}
          >
            {t("allWallets")}
          </button>
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setAccountId(acc.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                accountId === acc.id
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-foreground"
              }`}
            >
              {acc.firm_name}
            </button>
          ))}
        </div>
      )}

      <MetricsCards trades={filtered} />
      <RiskCalculator />
      <TradesTable data={filtered} accounts={accounts} />
    </div>
  );
}
