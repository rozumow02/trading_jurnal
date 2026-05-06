import { TradesTable } from "@/components/trades/TradesTable";
import { AddTradeModal } from "@/components/trades/AddTradeModal";
import { getTrades } from "@/lib/trades-api";
import { Button } from "@/components/ui/button";
import type { Trade } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations();
  let trades: Trade[] = [];

  try {
    trades = await getTrades();
  } catch (error) {
    console.error("Failed to fetch trades:", error);
    trades = [];
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
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Trades Table only */}
      <TradesTable data={trades} />
    </div>
  );
}
