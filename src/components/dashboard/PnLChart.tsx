"use client";

import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PnLChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-xl border border-white/10" />;

  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#A1A1AA" : "#71717A"; // text-muted-foreground
  const splitLineColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const lineColor = "#10B981"; // emerald-500
  const areaColorStart = "rgba(16, 185, 129, 0.4)";
  const areaColorEnd = "rgba(16, 185, 129, 0)";

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.9)",
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      textStyle: { color: isDark ? "#fff" : "#000" },
      formatter: (params: any) => {
        const val = params[0].value;
        return `
          <div class="font-sans font-medium text-sm">
            <div class="text-zinc-500 mb-1">${params[0].name}</div>
            <div class="text-emerald-500">$${val.toFixed(2)}</div>
          </div>
        `;
      }
    },
    grid: {
      left: "0%",
      right: "0%",
      top: "10%",
      bottom: "0%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Apr 22", "Apr 23", "Apr 24", "Apr 25", "Apr 26", "Apr 27", "Apr 28", "Apr 29", "Apr 30"],
      axisLabel: { color: textColor, margin: 16 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      position: "right",
      axisLabel: { color: textColor, margin: 16 },
      splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1100, 1220, 1248.5],
        type: "line",
        smooth: 0.4,
        symbol: "none",
        lineStyle: { color: lineColor, width: 3 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
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
        <CardTitle className="text-sm font-medium tracking-wider uppercase text-muted-foreground">Equity Curve</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ReactECharts option={option} style={{ height: 320, width: "100%" }} />
      </CardContent>
    </Card>
  );
}
