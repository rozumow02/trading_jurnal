"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { updateTrade, type TradePayload } from "@/lib/trades-api";
import { useRouter } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Trade } from "@/lib/data";

interface EditTradeModalProps {
  trade: Trade;
  open: boolean;
  onClose: () => void;
}

export function EditTradeModal({ trade, open, onClose }: EditTradeModalProps) {
  const t = useTranslations("modal");
  const [form, setForm] = useState<TradePayload>({
    symbol: "",
    direction: "long",
    quantity: 0,
    buy_price: 0,
    sell_price: 0,
    entry_date: "",
    exit_date: "",
    trade_link: "",
    trade_setup_notes: "",
    trade_type: 1,
    is_pending: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Pre-fill form when trade changes
  useEffect(() => {
    if (trade) {
      setForm({
        symbol: trade.symbol,
        direction: trade.direction,
        quantity: parseFloat(trade.quantity),
        buy_price: parseFloat(trade.buy_price),
        sell_price: trade.sell_price ? parseFloat(trade.sell_price) : 0,
        entry_date: trade.entry_date,
        exit_date: trade.exit_date ?? "",
        trade_link: trade.trade_link ?? "",
        trade_setup_notes: trade.trade_setup_notes ?? "",
        trade_type: trade.trade_type,
        is_pending: trade.is_pending,
      });
      setError(null);
    }
  }, [trade]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateTrade(trade.id, form);
      onClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-background/95 backdrop-blur-xl border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            {t("editTrade")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t("editTradeDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2 mt-1">
          {/* Symbol + Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("symbol")}</Label>
              <Input
                name="symbol"
                placeholder="BTC"
                value={form.symbol}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/10 uppercase font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("direction")}</Label>
              <select
                name="direction"
                value={form.direction}
                onChange={handleChange}
                className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="long">{t("long")}</option>
                <option value="short">{t("short")}</option>
              </select>
            </div>
          </div>

          {/* Qty + Entry Price + Exit Price */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("quantity")}</Label>
              <Input
                name="quantity"
                type="number"
                step="any"
                placeholder="0.10"
                value={form.quantity || ""}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("entryPrice")}</Label>
              <Input
                name="buy_price"
                type="number"
                step="any"
                placeholder="76478"
                value={form.buy_price || ""}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("exitPrice")}</Label>
              <Input
                name="sell_price"
                type="number"
                step="any"
                placeholder="76760"
                value={form.sell_price || ""}
                onChange={handleChange}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
          </div>

          {/* Entry Date + Exit Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("entryDate")}</Label>
              <Input
                name="entry_date"
                type="date"
                value={form.entry_date}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("exitDate")}</Label>
              <Input
                name="exit_date"
                type="date"
                value={form.exit_date}
                onChange={handleChange}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          {/* Trade Link */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("tradingViewLink")}</Label>
            <Input
              name="trade_link"
              placeholder="https://..."
              value={form.trade_link}
              onChange={handleChange}
              className="bg-white/5 border-white/10"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("notes")}</Label>
            <textarea
              name="trade_setup_notes"
              rows={2}
              value={form.trade_setup_notes}
              onChange={handleChange}
              placeholder={t("notesPlaceholder")}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          {/* Pending toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="is_pending"
                checked={form.is_pending}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-10 h-5 rounded-full bg-white/10 border border-white/10 peer-checked:bg-amber-500/30 peer-checked:border-amber-500/40 transition-all" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40 peer-checked:bg-amber-400 peer-checked:translate-x-5 transition-all" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {t("isPending")}
            </span>
            {form.is_pending && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 ml-auto">
                {t("pendingBadge")}
              </span>
            )}
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(buttonVariants({ variant: "outline" }), "bg-transparent border-white/10 hover:bg-white/5")}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                buttonVariants(),
                "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 disabled:opacity-60"
              )}
            >
              {loading ? t("saving") : t("saveChanges")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
