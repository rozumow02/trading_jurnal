"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { ExternalLink, Edit2, Trash2 } from "lucide-react";
import { deleteTrade } from "@/lib/trades-api";
import { useRouter } from "@/i18n/routing";

function TradeActions({ trade }: { trade: Trade }) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

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
    <div className="flex items-center gap-2">
      <button className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-blue-400 transition-colors">
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function useColumns(): ColumnDef<Trade>[] {
  const t = useTranslations("table");
  return [
    {
      accessorKey: "symbol",
      header: t("ticker"),
      cell: ({ row }) => (
        <div className="font-semibold text-foreground tracking-wide">{row.getValue("symbol")}</div>
      ),
    },
    {
      accessorKey: "direction",
      header: t("direction"),
      cell: ({ row }) => {
        const dir = row.getValue("direction") as string;
        const isLong = dir === "long";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
            isLong ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
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
          {new Date(row.getValue("entry_date")).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
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
            {new Date(val as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        );
      },
    },
    {
      accessorKey: "buy_price",
      header: t("entryPrice"),
      cell: ({ row }) => {
        const val = parseFloat(row.getValue("buy_price"));
        return <div className="font-mono text-muted-foreground">{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>;
      },
    },
    {
      accessorKey: "sell_price",
      header: t("exitPrice"),
      cell: ({ row }) => {
        const val = row.getValue("sell_price");
        if (!val) return <span className="text-muted-foreground/40">—</span>;
        return <div className="font-mono text-muted-foreground">{parseFloat(val as string).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>;
      },
    },
    {
      accessorKey: "quantity",
      header: t("quantity"),
      cell: ({ row }) => <div className="font-mono text-muted-foreground">{parseFloat(row.getValue("quantity"))}</div>,
    },
    {
      id: "pnl",
      header: t("pnl"),
      cell: ({ row }) => {
        const amount = row.original.pnl_amount ?? 0;
        const pct = row.original.pnl_percentage ?? 0;
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
      accessorKey: "trade_link",
      header: t("link"),
      cell: ({ row }) => {
        const link = row.getValue("trade_link") as string;
        if (!link) return <span className="text-muted-foreground/40">—</span>;
        return (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-2 inline-flex rounded-full hover:bg-white/5">
            <ExternalLink className="w-4 h-4" />
          </a>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => <TradeActions trade={row.original} />,
    },
  ];
}

export function TradesTable({ data }: { data: Trade[] }) {
  const t = useTranslations("trades");
  const columns = useColumns();
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/2 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-x-16 -translate-y-16 pointer-events-none" />
      <Table>
        <TableHeader className="bg-black/20 border-b border-white/5">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent border-0">
              {hg.headers.map((header) => (
                <TableHead key={header.id} className="text-[10px] uppercase text-muted-foreground/70 font-semibold tracking-wider pb-3 pt-4">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-b border-white/5 hover:bg-white/3 transition-colors border-0">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {t("noTrades")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
