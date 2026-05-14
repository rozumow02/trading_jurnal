"use client";

import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TradeStats } from "@/lib/stats";
import type { Trade } from "@/lib/data";
import { useTranslations } from "next-intl";

type BenchmarkSeries = { date: string; close: number }[];
type Benchmarks = { series: { BTC?: BenchmarkSeries; US500?: BenchmarkSeries } } | null;

interface Props {
  stats: TradeStats;
  trades: Trade[];
  benchmarks: Benchmarks;
}

export function PerformanceCharts({ stats, trades, benchmarks }: Props) {
  const t = useTranslations("analytics");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const text = isDark ? "#71717A" : "#52525B";
  const grid = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const tooltipBg = isDark ? "rgba(18,18,21,0.95)" : "rgba(255,255,255,0.95)";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // ── Donut 1: Win/Loss/BreakEven ──────────────────────────────────────────
  const winLossOption = {
    tooltip: { trigger: "item", backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: isDark ? "#fff" : "#000" } },
    series: [{
      type: "pie", radius: ["55%", "80%"], center: ["50%", "50%"],
      label: { show: false },
      data: [
        { value: stats.wins, name: "Wins", itemStyle: { color: "#10B981" } },
        { value: stats.losses, name: "Losses", itemStyle: { color: "#EF4444" } },
        { value: stats.breakEven, name: "Break Even", itemStyle: { color: "#6B7280" } },
      ],
    }],
    graphic: [{ type: "text", left: "center", top: "center", style: { text: `${stats.winRate.toFixed(0)}%\nWin Rate`, fill: isDark ? "#fff" : "#111", fontSize: 14, fontWeight: "bold", fontFamily: "monospace", textAlign: "center", lineHeight: 22 } }],
  };

  // ── Donut 2: Trade Type ───────────────────────────────────────────────────
  const cryptoCount = trades.filter((t) => t.trade_type === 1).length;
  const stockCount = trades.filter((t) => t.trade_type !== 1).length;
  const typeOption = {
    tooltip: { trigger: "item", backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: isDark ? "#fff" : "#000" } },
    series: [{
      type: "pie", radius: ["55%", "80%"], center: ["50%", "50%"],
      label: { show: false },
      data: [
        { value: cryptoCount, name: "Crypto", itemStyle: { color: "#F59E0B" } },
        { value: stockCount, name: "Stock", itemStyle: { color: "#8B5CF6" } },
      ],
    }],
    graphic: [{ type: "text", left: "center", top: "center", style: { text: `${trades.length}\nTrades`, fill: isDark ? "#fff" : "#111", fontSize: 14, fontWeight: "bold", fontFamily: "monospace", textAlign: "center", lineHeight: 22 } }],
  };

  // ── Bar: Individual trade PnL ──────────────────────────────────────────────
  const closedSorted = trades.filter((t) => !t.is_pending).sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
  const barOption = {
    tooltip: {
      trigger: "axis", backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: isDark ? "#fff" : "#000" },
      formatter: (params: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ => {
        const p = params[0];
        const v = p.value as number;
        return `<div style="font-family:monospace;padding:4px"><div style="color:#71717A;margin-bottom:2px">${p.name}</div><div style="color:${v >= 0 ? "#10B981" : "#EF4444"};font-weight:700">${v >= 0 ? "+" : ""}$${Math.abs(v).toFixed(2)}</div></div>`;
      },
    },
    grid: { left: "2%", right: "2%", top: "12%", bottom: "14%", containLabel: true },
    xAxis: { type: "category", data: closedSorted.map((t) => t.symbol), axisLabel: { color: text, interval: 0, rotate: 30, fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { color: text, formatter: (v: number) => `$${v}` }, splitLine: { lineStyle: { color: grid, type: "dashed" } } },
    series: [{
      type: "bar", barMaxWidth: 40,
      data: closedSorted.map((t) => ({
        value: t.pnl_amount ?? 0,
        itemStyle: { color: (t.pnl_amount ?? 0) >= 0 ? "rgba(16,185,129,0.8)" : "rgba(239,68,68,0.8)", borderRadius: (t.pnl_amount ?? 0) >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4] },
      })),
    }],
  };

  // ── Line: Equity Curve vs Benchmark ──────────────────────────────────────
  const equityCurve = closedSorted.reduce((acc, t) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].value : 0;
    const value = parseFloat((prev + (t.pnl_amount ?? 0)).toFixed(2));
    acc.push({ date: t.entry_date, value });
    return acc;
  }, [] as { date: string; value: number }[]);

  const normalizeToBase = (arr: { date: string; close: number }[]) => {
    if (!arr.length) return [];
    const base = arr[0].close;
    return arr.map((p) => ({ date: p.date, pct: parseFloat(((p.close / base - 1) * 100).toFixed(2)) }));
  };

  const btcNorm = normalizeToBase(benchmarks?.series?.BTC ?? []);
  const us500Norm = normalizeToBase(benchmarks?.series?.US500 ?? []);

  const allDates = [...new Set([...equityCurve.map((d) => d.date), ...btcNorm.map((d) => d.date), ...us500Norm.map((d) => d.date)])].sort();

  const benchmarkOption = {
    tooltip: { trigger: "axis", backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: isDark ? "#fff" : "#000" } },
    legend: { data: ["Equity ($)", "BTC (%)", "US500 (%)"], textStyle: { color: text, fontSize: 11 }, top: 8 },
    grid: { left: "2%", right: "5%", top: "14%", bottom: "10%", containLabel: true },
    xAxis: { type: "category", boundaryGap: false, data: allDates, axisLabel: { color: text, fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: [
      { type: "value", name: "$", nameTextStyle: { color: text }, axisLabel: { color: text, formatter: (v: number) => `$${v}` }, splitLine: { lineStyle: { color: grid, type: "dashed" } } },
      { type: "value", name: "%", nameTextStyle: { color: text }, axisLabel: { color: text, formatter: (v: number) => `${v}%` }, splitLine: { show: false } },
    ],
    series: [
      {
        name: "Equity ($)", type: "line", smooth: 0.3, symbol: "none", yAxisIndex: 0,
        lineStyle: { color: "#10B981", width: 2.5 },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(16,185,129,0.25)" }, { offset: 1, color: "rgba(16,185,129,0)" }] } },
        data: allDates.map((d) => equityCurve.find((e) => e.date === d)?.value ?? null),
      },
      {
        name: "BTC (%)", type: "line", smooth: 0.3, symbol: "none", yAxisIndex: 1,
        lineStyle: { color: "#F59E0B", width: 2 },
        data: allDates.map((d) => btcNorm.find((e) => e.date === d)?.pct ?? null),
      },
      {
        name: "US500 (%)", type: "line", smooth: 0.3, symbol: "none", yAxisIndex: 1,
        lineStyle: { color: "#8B5CF6", width: 2 },
        data: allDates.map((d) => us500Norm.find((e) => e.date === d)?.pct ?? null),
      },
    ],
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("performanceCharts")}</h2>

      {/* Row 1: two donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("winLossRatio")}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6 items-center px-5 pb-4">
            <ReactECharts option={winLossOption} style={{ height: 180, width: 180, flexShrink: 0 }} />
            <div className="space-y-2 text-sm">
              {[
                { label: t("winning"), count: stats.wins, color: "bg-emerald-400" },
                { label: t("losing"), count: stats.losses, color: "bg-red-400" },
                { label: t("breakEven"), count: stats.breakEven, color: "bg-gray-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-muted-foreground text-xs">{item.label}</span>
                  <span className="ml-auto font-mono font-bold text-foreground text-xs">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("tradeTypeDistribution")}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6 items-center px-5 pb-4">
            <ReactECharts option={typeOption} style={{ height: 180, width: 180, flexShrink: 0 }} />
            <div className="space-y-2 text-sm">
              {[
                { label: t("crypto"), count: cryptoCount, color: "bg-amber-400" },
                { label: t("stock"), count: stockCount, color: "bg-violet-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-muted-foreground text-xs">{item.label}</span>
                  <span className="ml-auto font-mono font-bold text-foreground text-xs">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Bar chart */}
      <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl">
        <CardHeader className="pb-0 pt-4 px-5">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("individualTradePnl")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <ReactECharts option={barOption} style={{ height: 220, width: "100%" }} />
        </CardContent>
      </Card>

      {/* Row 3: Benchmark line chart */}
      <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl">
        <CardHeader className="pb-0 pt-4 px-5">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("equityCurveVsBenchmark")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <ReactECharts option={benchmarkOption} style={{ height: 260, width: "100%" }} />
        </CardContent>
      </Card>
    </div>
  );
}
