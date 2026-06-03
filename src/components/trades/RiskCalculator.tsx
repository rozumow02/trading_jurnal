"use client";

import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RiskCalculator() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState<number | "">("");
  const [stopLoss, setStopLoss] = useState<number | "">("");
  const [takeProfit, setTakeProfit] = useState<number | "">("");

  const riskAmount = (balance * riskPct) / 100;
  const entryNum = Number(entry) || 0;
  const slNum = Number(stopLoss) || 0;
  const tpNum = Number(takeProfit) || 0;
  const priceDiff = Math.abs(entryNum - slNum);
  const positionSize = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const positionValue = positionSize * entryNum;
  const potentialGain = tpNum > 0 && positionSize > 0 ? Math.abs(tpNum - entryNum) * positionSize : 0;
  const rrRatio = potentialGain > 0 && riskAmount > 0 ? potentialGain / riskAmount : 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold font-mono text-foreground/80 uppercase tracking-wider">
            Risk Calculator
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-white/5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mt-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance ($)</Label>
              <Input
                type="number"
                value={balance}
                onChange={(e) => setBalance(+e.target.value || 0)}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk %</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={riskPct}
                onChange={(e) => setRiskPct(+e.target.value || 1)}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Entry Price</Label>
              <Input
                type="number"
                step="any"
                value={entry}
                onChange={(e) => setEntry(e.target.value === "" ? "" : +e.target.value)}
                placeholder="0.00"
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stop Loss</Label>
              <Input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value === "" ? "" : +e.target.value)}
                placeholder="0.00"
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Take Profit</Label>
              <Input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value === "" ? "" : +e.target.value)}
                placeholder="0.00"
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Risk Amount</p>
              <p className="font-mono text-base font-bold text-red-400">${riskAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Position Size</p>
              <p className="font-mono text-base font-bold text-emerald-400">
                {positionSize > 0 ? positionSize.toFixed(6) : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/8 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Position Value</p>
              <p className="font-mono text-base font-bold text-foreground">
                {positionValue > 0 ? `$${positionValue.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">R:R Ratio</p>
              <p className={`font-mono text-base font-bold ${rrRatio >= 2 ? "text-emerald-400" : rrRatio > 0 ? "text-amber-400" : "text-muted-foreground"}`}>
                {rrRatio > 0 ? `1 : ${rrRatio.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
