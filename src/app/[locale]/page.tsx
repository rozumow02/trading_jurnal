import { TradesTable } from "@/components/trades/TradesTable";
import { AddTradeModal } from "@/components/trades/AddTradeModal";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { getTrades } from "@/lib/trades-api";
import { mockTrades } from "@/lib/data";
import { Button } from "@/components/ui/button";
import type { Trade } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations();
  let trades: Trade[] = [];
  let usingMock = false;

  try {
    trades = await getTrades();
    console.log("[Supabase] trades fetched:", trades.length);
  } catch (err) {
    console.error("[Supabase] Error:", err);
    trades = mockTrades;
    usingMock = true;
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-mono">
            {t("trades.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("trades.subtitle")}
            {usingMock && (
              <span className="ml-2 text-yellow-500 text-xs">
                [{t("trades.mock")}]
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            <button className="px-4 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              {t("trades.table")}
            </button>
            <button className="px-4 py-1.5 rounded-md text-muted-foreground hover:text-foreground text-xs font-medium">
              {t("trades.monthly")}
            </button>
          </div>

          <Button
            variant="outline"
            className="bg-transparent border-[#DB9F35]/30 text-[#DB9F35] hover:bg-[#DB9F35]/10 hover:text-[#DB9F35] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DB9F35] animate-pulse" />
              {t("header.addBinance")}
            </span>
          </Button>

          <AddTradeModal />
        </div>
      </div>

      <MetricsCards trades={trades} />

      <div className="pt-2">
        <PnLChart trades={trades} />
      </div>

      <div className="pt-4">
        <TradesTable data={trades} />
      </div>

    </div>
  );
}
