"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, Target, BarChart3 } from "lucide-react";
import type { Trade } from "@/lib/data";
import { accountPct } from "@/lib/stats";
import { useTranslations, useFormatter, useLocale } from "next-intl";

interface CalendarViewProps {
  trades: Trade[];
}

type DayData = {
  date: Date;
  trades: Trade[];
  totalPnL: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function getDaysInMonth(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Monday (1), adjust so week starts on Mon
  let startDow = firstDay.getDay(); // 0=Sun, 1=Mon, ...
  startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Mon=0

  const days: DayData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Prev month padding
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    days.push({ date: d, trades: [], totalPnL: 0, isCurrentMonth: false, isToday: dt.getTime() === today.getTime() });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dt = new Date(date);
    dt.setHours(0, 0, 0, 0);
    days.push({ date, trades: [], totalPnL: 0, isCurrentMonth: true, isToday: dt.getTime() === today.getTime() });
  }

  // Next month padding to complete last row
  const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const dt = new Date(date);
    dt.setHours(0, 0, 0, 0);
    days.push({ date, trades: [], totalPnL: 0, isCurrentMonth: false, isToday: dt.getTime() === today.getTime() });
  }

  return days;
}

// Sanani LOCAL kalendar bo'yicha "YYYY-MM-DD" kalitga aylantiradi.
// toISOString() ishlatilsa local yarim tun UTC ga o'tib, UTC+ mintaqalarda
// sana bir kun oldinga siljiydi (14-savdo 15-katakda ko'rinishi shundan edi).
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// entry_date "YYYY-MM-DD" (qo'lda) yoki to'liq timestamp (MT5) bo'lishi mumkin.
// Date-only string'ni new Date() UTC deb o'qiydi va siljitadi — shuning uchun uni
// to'g'ridan-to'g'ri ishlatamiz; aks holda local sana kalitiga keltiramiz.
function tradeDateKey(entryDate: string): string {
  const dateOnly = /^(\d{4}-\d{2}-\d{2})/.exec(entryDate);
  if (dateOnly && !entryDate.includes("T")) return dateOnly[1];
  return toDateKey(new Date(entryDate));
}

function assignTrades(days: DayData[], trades: Trade[]): DayData[] {
  const map = new Map<string, Trade[]>();

  trades.forEach((trade) => {
    const key = tradeDateKey(trade.entry_date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(trade);
  });

  return days.map((day) => {
    const key = toDateKey(day.date);
    const dayTrades = map.get(key) ?? [];
    const totalPnL = dayTrades.reduce((sum, t) => {
      if (t.is_pending && t.unrealized_pnl_amount !== null && t.unrealized_pnl_amount !== undefined) {
        return sum + t.unrealized_pnl_amount;
      }
      return sum + (t.pnl_amount ?? 0);
    }, 0);
    return { ...day, trades: dayTrades, totalPnL };
  });
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayCellProps {
  day: DayData;
  onClick: (day: DayData) => void;
}

function DayCell({ day, onClick }: DayCellProps) {
  const hasTrades = day.trades.length > 0;
  const isProfit = day.totalPnL > 0;
  const isLoss = day.totalPnL < 0;
  const isPending = day.trades.some((t) => t.is_pending);

  let glowClass = "";
  let bgClass = "bg-white/[0.02] hover:bg-white/5";
  let borderClass = "border-white/5";
  let pnlColor = "";

  if (hasTrades) {
    if (isPending && !isProfit && !isLoss) {
      bgClass = "bg-amber-500/5 hover:bg-amber-500/10";
      borderClass = "border-amber-500/15";
      glowClass = "";
      pnlColor = "text-amber-400";
    } else if (isProfit) {
      bgClass = "bg-emerald-500/5 hover:bg-emerald-500/10";
      borderClass = "border-emerald-500/15";
      glowClass = "shadow-[0_0_12px_rgba(16,185,129,0.08)]";
      pnlColor = "text-emerald-400";
    } else if (isLoss) {
      bgClass = "bg-red-500/5 hover:bg-red-500/10";
      borderClass = "border-red-500/15";
      glowClass = "shadow-[0_0_12px_rgba(239,68,68,0.08)]";
      pnlColor = "text-red-400";
    }
  }

  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

  return (
    <div
      onClick={() => hasTrades && onClick(day)}
      className={`
        relative min-h-[100px] lg:min-h-[120px] rounded-xl border p-2 lg:p-3 transition-all duration-200
        ${bgClass} ${borderClass} ${glowClass}
        ${!day.isCurrentMonth ? "opacity-30" : ""}
        ${hasTrades ? "cursor-pointer" : "cursor-default"}
        group
      `}
    >
      {/* Date number */}
      <div className="flex items-start justify-between mb-2">
        <span
          className={`
            text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
            ${day.isToday
              ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              : isWeekend
              ? "text-emerald-400/60"
              : "text-muted-foreground"
            }
          `}
        >
          {day.date.getDate()}
        </span>

        {hasTrades && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            isProfit ? "bg-emerald-500/15 text-emerald-400" :
            isLoss ? "bg-red-500/15 text-red-400" :
            "bg-amber-500/15 text-amber-400"
          }`}>
            {day.trades.length}
          </span>
        )}
      </div>

      {/* PnL display */}
      {hasTrades && (
        <div className="space-y-1">
          <div className={`text-xs font-bold font-mono ${pnlColor}`}>
            {day.totalPnL >= 0 ? "+" : ""}${Math.abs(day.totalPnL).toFixed(2)}
          </div>

          {/* Mini trade chips */}
          <div className="flex flex-wrap gap-1 mt-1">
            {day.trades.slice(0, 3).map((trade, i) => {
              const tp = trade.is_pending
                ? trade.unrealized_pnl_amount
                : trade.pnl_amount;
              const tpPos = (tp ?? 0) >= 0;
              return (
                <span
                  key={i}
                  className={`text-[9px] font-mono px-1 py-0.5 rounded truncate max-w-[60px] ${
                    trade.is_pending
                      ? "bg-amber-500/10 text-amber-400"
                      : tpPos
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {trade.symbol}
                </span>
              );
            })}
            {day.trades.length > 3 && (
              <span className="text-[9px] text-muted-foreground/60 font-mono px-1">
                +{day.trades.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hover glow overlay */}
      {hasTrades && (
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
          isProfit ? "bg-gradient-to-br from-emerald-500/5 to-transparent" :
          isLoss ? "bg-gradient-to-br from-red-500/5 to-transparent" :
          "bg-gradient-to-br from-amber-500/5 to-transparent"
        }`} />
      )}
    </div>
  );
}

interface DayDetailPanelProps {
  day: DayData | null;
  onClose: () => void;
}

function DayDetailPanel({ day, onClose }: DayDetailPanelProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();
    const format = useFormatter();

  if (!day) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-foreground font-mono">
              {day.date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {day.trades.length} {day.trades.length !== 1 ? t("trades") : t("trade")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Day total */}
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${
          day.totalPnL >= 0 ? "bg-emerald-500/10 border border-emerald-500/15" : "bg-red-500/10 border border-red-500/15"
        }`}>
          {day.totalPnL >= 0
            ? <TrendingUp className="w-4 h-4 text-emerald-400" />
            : <TrendingDown className="w-4 h-4 text-red-400" />
          }
          <span className="text-sm text-muted-foreground">{t("dayTotal")}</span>
          <span className={`font-bold font-mono text-lg ml-auto ${day.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {day.totalPnL >= 0 ? "+" : ""}${Math.abs(day.totalPnL).toFixed(2)}
          </span>
        </div>

        {/* Trades list */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {day.trades.map((trade) => {
            const pnl = trade.is_pending ? (trade.unrealized_pnl_amount ?? 0) : (trade.pnl_amount ?? 0);
            const isPos = pnl >= 0;
            const isLong = trade.direction === "long";

            return (
              <div key={trade.id} className={`p-3 rounded-xl border transition-colors ${
                trade.is_pending
                  ? "bg-amber-500/5 border-amber-500/15"
                  : isPos
                  ? "bg-emerald-500/5 border-emerald-500/10"
                  : "bg-red-500/5 border-red-500/10"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground font-mono">{trade.symbol}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${
                      isLong
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {trade.direction.toUpperCase()}
                    </span>
                    {trade.is_pending && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        OPEN
                      </span>
                    )}
                  </div>
                  <span className={`font-bold font-mono ${
                    trade.is_pending ? "text-amber-400" : isPos ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>{t("entry")} <span className="font-mono text-foreground/70">${format.number(parseFloat(trade.buy_price))}</span></span>
                  {trade.sell_price && !trade.is_pending && (
                    <span>{t("exit")} <span className="font-mono text-foreground/70">${format.number(parseFloat(trade.sell_price))}</span></span>
                  )}
                  <span>{t("qty")} <span className="font-mono text-foreground/70">{parseFloat(trade.quantity)}</span></span>
                  {!trade.is_pending && (() => {
                    const accPct = accountPct(trade.pnl_amount ?? 0, trade.prop_accounts?.account_size);
                    if (accPct === null) return null;
                    return (
                      <span>%: <span className={`font-mono font-semibold ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                        {accPct >= 0 ? "+" : ""}{accPct.toFixed(2)}%
                      </span></span>
                    );
                  })()}
                </div>

                {trade.trade_setup_notes && (
                  <p className="mt-2 text-xs text-muted-foreground/70 italic border-t border-white/5 pt-2">
                    {trade.trade_setup_notes}
                  </p>
                )}

                {trade.trade_link && (
                  <a
                    href={trade.trade_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 block"
                  >
                    View Chart →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CalendarView({ trades }: { trades: Trade[] }) {
  const t = useTranslations("calendar");
  const locale = useLocale();
    const format = useFormatter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const days = useMemo(() => {
    const raw = getDaysInMonth(year, month);
    return assignTrades(raw, trades);
  }, [year, month, trades]);

  // Monthly stats
  const monthTrades = useMemo(() => {
    return trades.filter((t) => {
      const d = new Date(t.entry_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [trades, year, month]);

  const totalPnL = monthTrades.reduce((sum, t) => {
    if (t.is_pending && t.unrealized_pnl_amount !== null && t.unrealized_pnl_amount !== undefined) return sum + t.unrealized_pnl_amount;
    return sum + (t.pnl_amount ?? 0);
  }, 0);

  const winCount = monthTrades.filter((t) => !t.is_pending && (t.pnl_amount ?? 0) > 0).length;
  const lossCount = monthTrades.filter((t) => !t.is_pending && (t.pnl_amount ?? 0) < 0).length;
  const closedCount = monthTrades.filter((t) => !t.is_pending).length;
  const winRate = closedCount > 0 ? (winCount / closedCount) * 100 : 0;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Monthly Stats Header */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/3 blur-3xl rounded-full translate-x-32 -translate-y-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/3 blur-3xl rounded-full -translate-x-24 translate-y-24 pointer-events-none" />

        <div className="p-6 relative">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <h2 className="text-lg font-bold text-foreground font-mono capitalize">
              {new Date(year, month).toLocaleDateString(locale, { month: "long" })} {year}
            </h2>
            {isCurrentMonth && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-medium">
                {t("current")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Total Trades */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground/70">
                <BarChart3 className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold uppercase tracking-wider">{t("totalTrades")}</p>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{monthTrades.length}</p>
            </div>

            {/* Total P&L */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground/70">
                <Activity className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold uppercase tracking-wider">{t("totalPnl")}</p>
              </div>
              <p className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toFixed(2)}
              </p>
            </div>

            {/* Win Rate */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground/70">
                <Target className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold uppercase tracking-wider">{t("winRate")}</p>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{winRate.toFixed(1)}%</p>
            </div>

            {/* Winning */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400/60">
                <TrendingUp className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold uppercase tracking-wider">{t("winning")}</p>
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400">{winCount}</p>
            </div>

            {/* Losing */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-red-400/60">
                <TrendingDown className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold uppercase tracking-wider">{t("losing")}</p>
              </div>
              <p className="text-2xl font-bold font-mono text-red-400">{lossCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-foreground font-mono flex items-center gap-2 capitalize">
            <span className="text-emerald-400">{new Date(year, month).toLocaleDateString(locale, { month: "long" })}</span>
            <span className="text-muted-foreground">{year}</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/3 hover:bg-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}
              className={`px-3 h-8 rounded-lg border text-xs font-medium transition-all ${
                isCurrentMonth
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-white/3 text-muted-foreground hover:text-foreground hover:bg-white/8"
              }`}
            >
              {t("today")}
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/3 hover:bg-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 px-4 pt-3 pb-2 gap-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className={`text-center text-[11px] font-semibold uppercase tracking-wider ${
              d === "Sat" || d === "Sun" ? "text-emerald-400/50" : "text-muted-foreground/50"
            }`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-2 p-4 pt-0">
          {days.map((day, i) => (
            <DayCell key={i} day={day} onClick={setSelectedDay} />
          ))}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-white/5 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-muted-foreground/50 font-medium">{t("legend")}</span>
          {[
            { color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400", label: t("winning", { fallback: "Profit" }) },
            { color: "bg-red-500/20 border-red-500/30 text-red-400", label: t("losing", { fallback: "Loss" }) },
            { color: "bg-amber-500/20 border-amber-500/30 text-amber-400", label: "Open / Pending" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm border ${item.color}`} />
              <span className={`text-xs font-medium ${item.color.split(" ").find(c => c.startsWith("text-"))}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <DayDetailPanel day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </div>
  );
}
