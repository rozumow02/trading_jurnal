"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createTrade, type TradePayload } from "@/lib/trades-api";
import { useRouter } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptyForm = (): TradePayload => ({
  symbol: "",
  direction: "long",
  quantity: 0,
  buy_price: 0,
  sell_price: 0,
  entry_date: new Date().toISOString().split("T")[0],
  exit_date: new Date().toISOString().split("T")[0],
  trade_link: "",
  trade_setup_notes: "",
  trade_type: 1,
});

export function AddTradeModal() {
  const t = useTranslations("modal");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TradePayload>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createTrade(form);
      setOpen(false);
      setForm(emptyForm());
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          buttonVariants(),
          "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("newTrade")}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] bg-background/95 backdrop-blur-xl border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">{t("newTrade")}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t("newTradeDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("symbol")}</Label>
              <Input name="symbol" placeholder="BTC" value={form.symbol} onChange={handleChange} required className="bg-white/5 border-white/10 uppercase font-mono" />
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("quantity")}</Label>
              <Input name="quantity" type="number" step="any" placeholder="0.10" value={form.quantity || ""} onChange={handleChange} required className="bg-white/5 border-white/10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("entryPrice")}</Label>
              <Input name="buy_price" type="number" step="any" placeholder="76478" value={form.buy_price || ""} onChange={handleChange} required className="bg-white/5 border-white/10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("exitPrice")}</Label>
              <Input name="sell_price" type="number" step="any" placeholder="76760" value={form.sell_price || ""} onChange={handleChange} className="bg-white/5 border-white/10 font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("entryDate")}</Label>
              <Input name="entry_date" type="date" value={form.entry_date} onChange={handleChange} required className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("exitDate")}</Label>
              <Input name="exit_date" type="date" value={form.exit_date} onChange={handleChange} className="bg-white/5 border-white/10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("tradingViewLink")}</Label>
            <Input name="trade_link" placeholder="https://..." value={form.trade_link} onChange={handleChange} className="bg-white/5 border-white/10" />
          </div>

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

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: "outline" }), "bg-transparent border-white/10 hover:bg-white/5")}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                buttonVariants(),
                "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 disabled:opacity-60"
              )}
            >
              {loading ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
