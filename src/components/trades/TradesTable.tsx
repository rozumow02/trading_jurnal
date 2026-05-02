"use client";

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
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ${trade.symbol} trade?`)) return;
    setLoading(true);
    try {
      await deleteTrade(trade.id);
      router.refresh();
    } catch (e) {
      alert("Failed to delete trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-blue-400 transition-colors border border-transparent hover:border-white/10">
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: "symbol",
    header: "TICKER",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground tracking-wide">
        {row.getValue("symbol")}
      </div>
    ),
  },
  {
    accessorKey: "direction",
    header: "DIR",
    cell: ({ row }) => {
      const dir = row.getValue("direction") as string;
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
          dir === 'long'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {dir.toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: "trade_type",
    header: "TYPE",
    cell: ({ row }) => {
      const type = row.getValue("trade_type");
      return (
        <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">
          {type === 1 ? "Crypto" : "Other"}
        </span>
      );
    },
  },
  {
    accessorKey: "entry_date",
    header: "ENTRY DATE",
    cell: ({ row }) => {
      const date = new Date(row.getValue("entry_date"));
      return <div className="text-muted-foreground whitespace-nowrap">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>;
    },
  },
  {
    accessorKey: "exit_date",
    header: "EXIT DATE",
    cell: ({ row }) => {
      const val = row.getValue("exit_date");
      if (!val) return <span className="text-muted-foreground/40">—</span>;
      const date = new Date(val as string);
      return <div className="text-muted-foreground whitespace-nowrap">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>;
    },
  },
  {
    accessorKey: "buy_price",
    header: "ENTRY PRICE",
    cell: ({ row }) => {
      const val = parseFloat(row.getValue("buy_price"));
      return <div className="font-mono text-muted-foreground">{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</div>;
    },
  },
  {
    accessorKey: "sell_price",
    header: "EXIT PRICE",
    cell: ({ row }) => {
      const val = row.getValue("sell_price");
      if (!val) return <span className="text-muted-foreground/40">—</span>;
      return <div className="font-mono text-muted-foreground">{parseFloat(val as string).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "QTY",
    cell: ({ row }) => {
      const val = parseFloat(row.getValue("quantity"));
      return <div className="font-mono text-muted-foreground">{val}</div>;
    },
  },
  {
    id: "pnl",
    header: "P/L",
    cell: ({ row }) => {
      const amount = row.original.pnl_amount ?? 0;
      const percentage = row.original.pnl_percentage ?? 0;
      const isPositive = amount >= 0;
      const colorClass = isPositive ? "text-pnl-up" : "text-pnl-down";
      return (
        <div className="flex flex-col font-mono items-start">
          <span className={colorClass}>
            {isPositive ? "+" : ""}${Math.abs(amount).toFixed(2)}
          </span>
          <span className={`text-xs ${colorClass}`}>
            {isPositive ? "+" : ""}{percentage.toFixed(2)}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "trade_link",
    header: "LINK",
    cell: ({ row }) => {
      const link = row.getValue("trade_link") as string;
      if (!link) return <span className="text-muted-foreground/40">—</span>;
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-white/5 inline-flex">
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => <TradeActions trade={row.original} />,
  },
];

interface TradesTableProps {
  data: Trade[];
}

export function TradesTable({ data }: TradesTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/2 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-x-16 -translate-y-16 pointer-events-none" />
      <Table>
        <TableHeader className="bg-black/20 hover:bg-black/20 border-b border-white/5">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-0">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-[10px] uppercase text-muted-foreground/70 font-semibold tracking-wider pb-3 pt-4">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-white/5 hover:bg-white/3 transition-colors bg-transparent border-0"
              >
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
                No trades found. Add your first trade!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
