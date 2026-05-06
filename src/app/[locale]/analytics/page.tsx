import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { getTrades, getBenchmarks } from "@/lib/trades-api";
import type { Benchmarks } from "@/lib/trades-api";
import type { Trade } from "@/lib/data";

export default async function AnalyticsPage() {
  let trades: Trade[] = [];
  let benchmarks: Benchmarks | null = null;
  try {
    trades = await getTrades();
    benchmarks = await getBenchmarks();
  } catch (error) {
    console.error("Failed to fetch data:", error);
    trades = [];
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-mono">
          Trading Statistics
        </h1>
        <p className="text-muted-foreground text-sm">
          Deep dive into your trading performance metrics.
        </p>
      </div>

      <AnalyticsView trades={trades} benchmarks={benchmarks} />
    </div>
  );
}
