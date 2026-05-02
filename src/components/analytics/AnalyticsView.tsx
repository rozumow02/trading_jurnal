"use client";

import { useState, useMemo, useEffect } from "react";
import type { Trade } from "@/lib/data";
import { filterTrades, computeStats } from "@/lib/stats";
import { SummaryCards } from "./SummaryCards";
import { PerformanceCharts } from "./PerformanceCharts";
import { StatsTables } from "./StatsTables";

type TypeFilter = "total" | "stock" | "crypto";
type TimeFilter = "all" | "30d" | "7d" | "month";

const TYPE_TABS: { key: TypeFilter; label: string }[] = [
  { key: "total", label: "Total" },
  { key: "stock", label: "Stock" },
  { key: "crypto", label: "Crypto" },
];

const TIME_OPTIONS: { key: TimeFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "month", label: "This Month" },
  { key: "30d", label: "Last 30 Days" },
  { key: "7d", label: "Last 7 Days" },
];

interface Benchmarks {
  series: {
    BTC?: { date: string; close: number }[];
    US500?: { date: string; close: number }[];
  };
}

export function AnalyticsView({ trades }: { trades: Trade[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("total");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [benchmarks, setBenchmarks] = useState<Benchmarks | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/benchmarks")
      .then((r) => r.json())
      .then(setBenchmarks)
      .catch(() => {/* silently fail */});
  }, []);

  const filtered = useMemo(
    () => filterTrades(trades, typeFilter, timeFilter),
    [trades, typeFilter, timeFilter]
  );

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  return (
    <div className="space-y-8">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Type tabs */}
        <div className="flex bg-white/5 border border-white/8 rounded-xl p-1 gap-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                typeFilter === tab.key
                  ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Time select */}
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/40 cursor-pointer"
        >
          {TIME_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Stats summary label */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-4">Your statistics summary</p>
        <SummaryCards stats={stats} />
      </div>

      {/* Charts — only render client-side */}
      {mounted ? (
        <PerformanceCharts stats={stats} trades={filtered} benchmarks={benchmarks} />
      ) : (
        <div className="h-[600px] rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      )}

      {/* Tables */}
      <StatsTables stats={stats} />
    </div>
  );
}
