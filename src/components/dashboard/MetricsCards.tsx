"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* Metric 1 */}
      <Card className="bg-white/2 border-white/5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] glass overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Total P&L</p>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-foreground tracking-tight">+$1,248.50</h3>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              12.4%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric 2 */}
      <Card className="bg-white/2 border-white/5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] glass overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Win Rate</p>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-foreground tracking-tight">68.5%</h3>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              4.2%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric 3 */}
      <Card className="bg-white/2 border-white/5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] glass overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Total Trades</p>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-foreground tracking-tight">142</h3>
            <span className="text-xs font-medium text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
              This Month
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
