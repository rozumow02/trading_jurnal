import { CalendarView } from "@/components/calendar/CalendarView";
import { getTrades } from "@/lib/trades-api";
import { mockTrades } from "@/lib/data";
import type { Trade } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function CalendarPage() {
  const t = await getTranslations();
  let trades: Trade[] = [];
  let usingMock = false;

  try {
    trades = await getTrades();
  } catch {
    trades = mockTrades;
    usingMock = true;
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-mono">
            {t("nav.calendar")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("calendar.subtitle")}
            {usingMock && (
              <span className="ml-2 text-yellow-500 text-xs">
                [{t("trades.mock")}]
              </span>
            )}
          </p>
        </div>
      </div>

      <CalendarView trades={trades} />
    </div>
  );
}
