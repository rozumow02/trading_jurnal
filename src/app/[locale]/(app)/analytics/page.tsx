import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { getTrades, getBenchmarks, getPropAccounts } from "@/lib/trades-api";

export default async function AnalyticsPage() {
  const [trades, benchmarks, accounts] = await Promise.all([
    getTrades(),
    getBenchmarks(),
    getPropAccounts(),
  ]);

  return (
    <div className="p-8">
      <AnalyticsView trades={trades} benchmarks={benchmarks} accounts={accounts} />
    </div>
  );
}
