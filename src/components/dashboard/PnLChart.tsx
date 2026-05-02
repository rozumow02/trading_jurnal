"use client";

import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Trade } from "@/lib/data";

interface PnLChartProps {
  trades: Trade[];
}

export function PnLChart({ trades }: PnLChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-xl border border-white/10" />;

  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#A1A1AA" : "#71717A";
  const splitLineColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const lineColor = "#10B981";
  const areaColorStart = "rgba(16, 185, 129, 0.4)";
  const areaColorEnd = "rgba(16, 185, 129, 0)";

  // Build cumulative equity curve from sorted trades
  const sorted = [...trades].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let cumulative = 0;
  const chartData = sorted.map((t) => {
    cumulative += t.pnl_amount ?? 0;
    return {
      name: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(cumulative.toFixed(2)),
    };
  });

  // If no trades, show placeholder
  const xData = chartData.length > 0 ? chartData.map(d => d.name) : ["No data"];
  const yData = chartData.length > 0 ? chartData.map(d => d.value) : [0];

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.9)",
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      textStyle: { color: isDark ? "#fff" : "#000" },
      formatter: (params: any) => {
        const val = params[0].value;
        const sign = val >= 0 ? "+" : "";
        return `
          <div style="font-family:monospace;font-size:13px;padding:4px">
            <div style="color:#71717A;margin-bottom:4px">${params[0].name}</div>
            <div style="color:${val >= 0 ? '#10B981' : '#EF4444'};font-weight:700">${sign}$${val.toFixed(2)}</div>
          </div>
        `;
      }
    },
    grid: { left: "0%", right: "0%", top: "10%", bottom: "0%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xData,
      axisLabel: { color: textColor, margin: 16 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      position: "right",
      axisLabel: {
        color: textColor,
        margin: 16,
        formatter: (v: number) => `$${v}`,
      },
      splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
    },
    series: [
      {
        data: yData,
        type: "line",
        smooth: 0.4,
        symbol: "none",
        lineStyle: { color: lineColor, width: 2.5 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: areaColorStart },
              { offset: 1, color: areaColorEnd },
            ],
          },
        },
      },
    ],
  };

  return (
    <Card className="bg-white/2 border-white/5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] glass col-span-1 md:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-wider uppercase text-muted-foreground">
          Equity Curve
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ReactECharts option={option} style={{ height: 320, width: "100%" }} />
      </CardContent>
    </Card>
  );
}
