"use client";

import { useTranslations, useFormatter } from "next-intl";
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trade } from "@/lib/data";
import { ExternalLink, Edit2, Trash2, Clock, ImageIcon, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteTrade } from "@/lib/trades-mutations";
import { useRouter } from "@/i18n/routing";
import { EditTradeModal } from "./EditTradeModal";
import type { PropAccount } from "@/lib/data";

const PAGE_SIZE = 20;

function exportToCSV(trades: Trade[]) {
  const headers = [
    "Symbol", "Direction", "Type", "Entry Date", "Exit Date",
    "Entry Price", "Exit Price", "Qty", "PnL ($)", "PnL (%)", "Tags", "Notes",
  ];
  const rows = trades.map((t) => [
    t.symbol,
    t.direction,
    t.trade_type === 1 ? "Crypto" : "Other",
    t.entry_date,
    t.exit_date || "",
    t.buy_price,
    t.sell_price || "",
    t.quantity,
    t.is_pending ? "" : (t.pnl_amount?.toFixed(2) ?? ""),
    t.is_pending ? "" : (t.pnl_percentage?.toFixed(2) ?? ""),
    (t.tags ?? []).join(";"),
    t.trade_setup_notes || "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trades-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function TradeActions({ trade, accounts }: { trade: Trade; accounts: PropAccount[] }) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm", { symbol: trade.symbol }))) return;
    setLoading(true);
    try {
      await deleteTrade(trade.id);
      router.refresh();
    } catch {
      alert(t("deleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditOpen(true)}
          className="p-2 rounded-full hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors"
          title="Edit trade"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-2 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
          title="Delete trade"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <EditTradeModal
        trade={trade}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        accounts={accounts}
      />
    </>
  );
}

function useColumns(accounts: PropAccount[]): ColumnDef<Trade>[] {
  const t = useTranslations("table");
  const format = useFormatter();
  return [
    {
      accessorKey: "symbol",
      header: t("ticker"),
      cell: ({ row }) => {
        const isPending = row.original.is_pending;
        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground tracking-wide">
                {row.getValue("symbol")}
              </span>
              {row.original.account_id && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {accounts.find((a) => a.id === row.original.account_id)?.firm_name || "Account"}
                </span>
              )}
            </div>
            {isPending && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                <Clock className="w-2.5 h-2.5" />
                {t("pending")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "direction",
      header: t("direction"),
      cell: ({ row }) => {
        const dir = row.getValue("direction") as string;
        const isLong = dir === "long";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold border ${
              isLong
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {isLong ? t("long") : t("short")}
          </span>
        );
      },
    },
    {
      accessorKey: "trade_type",
      header: t("type"),
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">
          {row.getValue("trade_type") === 1 ? t("crypto") : t("other")}
        </span>
      ),
    },
    {
      accessorKey: "entry_date",
      header: t("entryDate"),
      cell: ({ row }) => (
        <div className="text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("entry_date")).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      accessorKey: "exit_date",
      header: t("exitDate"),
      cell: ({ row }) => {
        const val = row.getValue("exit_date");
        if (!val) return <span className="text-muted-foreground/40">—</span>;
        return (
          <div className="text-muted-foreground whitespace-nowrap">
            {new Date(val as string).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "buy_price",
      header: t("entryPrice"),
      cell: ({ row }) => {
        const val = parseFloat(row.getValue("buy_price"));
        return (
          <div className="font-mono text-muted-foreground">
            {format.number(val, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </div>
        );
      },
    },
    {
      accessorKey: "sell_price",
      header: t("exitPrice"),
      cell: ({ row }) => {
        const trade = row.original;
        if (trade.is_pending) {
          if (trade.current_price) {
            return (
              <div className="flex flex-col">
                <span className="font-mono text-amber-400 text-xs">
                  {format.number(trade.current_price, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className="text-[10px] text-amber-400/60">{t("currentPrice")}</span>
              </div>
            );
          }
          return <span className="text-amber-400/40 text-xs italic">{t("open")}</span>;
        }
        const val = row.getValue("sell_price");
        if (!val) return <span className="text-muted-foreground/40">—</span>;
        return (
          <div className="font-mono text-muted-foreground">
            {format.number(parseFloat(val as string), { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t("quantity"),
      cell: ({ row }) => (
        <div className="font-mono text-muted-foreground">{parseFloat(row.getValue("quantity"))}</div>
      ),
    },
    {
      id: "pnl",
      header: t("pnl"),
      cell: ({ row }) => {
        const trade = row.original;
        if (trade.is_pending) {
          const uPnL = trade.unrealized_pnl_amount;
          const uPct = trade.unrealized_pnl_percentage;
          if (uPnL !== null && uPnL !== undefined) {
            const isPos = uPnL >= 0;
            const cls = isPos ? "text-amber-400" : "text-red-400";
            return (
              <div className="flex flex-col font-mono">
                <span className={cls}>{isPos ? "+" : ""}${Math.abs(uPnL).toFixed(2)}</span>
                {uPct !== null && uPct !== undefined && (
                  <span className={`text-xs ${cls} opacity-70`}>{isPos ? "+" : ""}{uPct.toFixed(2)}%</span>
                )}
                <span className="text-[10px] text-amber-400/50 mt-0.5">{t("unrealized")}</span>
              </div>
            );
          }
          return <div className="flex flex-col font-mono"><span className="text-amber-400/50 text-xs italic">{t("open")}</span></div>;
        }
        const amount = trade.pnl_amount ?? 0;
        const pct = trade.pnl_percentage ?? 0;
        const isPos = amount >= 0;
        const cls = isPos ? "text-pnl-up" : "text-pnl-down";
        return (
          <div className="flex flex-col font-mono">
            <span className={cls}>{isPos ? "+" : ""}${Math.abs(amount).toFixed(2)}</span>
            <span className={`text-xs ${cls}`}>{isPos ? "+" : ""}{pct.toFixed(2)}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      header: t("tags"),
      cell: ({ row }) => {
        const tags = (row.original.tags ?? []) as string[];
        if (!tags.length) return <span className="text-muted-foreground/40">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-medium whitespace-nowrap"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "trade_link",
      header: t("link"),
      cell: ({ row }) => {
        const link = row.getValue("trade_link") as string;
        const image = row.original.trade_image;
        if (!link && !image) return <span className="text-muted-foreground/40">—</span>;
        return (
          <div className="flex items-center gap-1">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 inline-flex rounded-full hover:bg-white/5"
                title="TradingView Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {image && (
              <a
                href={image}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors p-2 inline-flex rounded-full hover:bg-blue-500/10"
                title="View Screenshot"
              >
                <ImageIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => <TradeActions trade={row.original} accounts={accounts} />,
    },
  ];
}

export function TradesTable({ data, accounts = [] }: { data: Trade[]; accounts?: PropAccount[] }) {
  const t = useTranslations("trades");
  const tTable = useTranslations("table");
  const columns = useColumns(accounts);
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    data.forEach((trade) => (trade.tags ?? []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [data]);

  const filteredData = React.useMemo(() => {
    const base = [...data].sort((a, b) => {
      if (a.is_pending && !b.is_pending) return -1;
      if (!a.is_pending && b.is_pending) return 1;
      return 0;
    });
    if (!activeTag) return base;
    return base.filter((t) => (t.tags ?? []).includes(activeTag));
  }, [data, activeTag]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE, pageIndex: 0 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = filteredData.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-4">
      {/* Tag filter + Export bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {allTags.length > 0 && (
            <>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                {tTable("filterByTag")}:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    activeTag === tag
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                      : "bg-white/5 text-muted-foreground border-white/10 hover:border-violet-500/20 hover:text-violet-300"
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors underline"
                >
                  {tTable("clearFilter")}
                </button>
              )}
            </>
          )}
        </div>
        <button
          onClick={() => exportToCSV(filteredData)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-muted-foreground hover:text-foreground transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          {t("exportCSV")}
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/2 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-x-16 -translate-y-16 pointer-events-none" />
        <Table>
          <TableHeader className="bg-black/20 border-b border-white/5">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-0">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[10px] uppercase text-muted-foreground/70 font-semibold tracking-wider pb-3 pt-4"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isPending = row.original.is_pending;
                return (
                  <TableRow
                    key={row.id}
                    className={`border-b border-white/5 transition-colors border-0 ${
                      isPending ? "hover:bg-amber-500/5 bg-amber-500/[0.02]" : "hover:bg-white/3"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t("noTrades")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalRows > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-black/10">
            <span className="text-xs text-muted-foreground">
              {from}–{to} / {totalRows}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground px-2">
                {pageIndex + 1} / {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
