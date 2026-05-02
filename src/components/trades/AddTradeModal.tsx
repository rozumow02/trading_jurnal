"use client";

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

const defaultForm: TradePayload = {
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
};

export function AddTradeModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TradePayload>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
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
      setForm(defaultForm);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to save trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(
        buttonVariants(),
        "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
      )}>
        <Plus className="w-4 h-4 mr-2" />
        Add Trade
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] bg-background/95 backdrop-blur-xl border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-mono">New Trade</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Fill in the trade details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2 mt-2">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="symbol" className="text-xs uppercase tracking-wider text-muted-foreground">Symbol</Label>
              <Input id="symbol" name="symbol" placeholder="BTC" value={form.symbol} onChange={handleChange} required className="bg-white/5 border-white/10 uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="direction" className="text-xs uppercase tracking-wider text-muted-foreground">Direction</Label>
              <select
                name="direction"
                id="direction"
                value={form.direction}
                onChange={handleChange}
                className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-xs uppercase tracking-wider text-muted-foreground">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" step="any" placeholder="0.10" value={form.quantity || ""} onChange={handleChange} required className="bg-white/5 border-white/10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buy_price" className="text-xs uppercase tracking-wider text-muted-foreground">Entry Price</Label>
              <Input id="buy_price" name="buy_price" type="number" step="any" placeholder="76478" value={form.buy_price || ""} onChange={handleChange} required className="bg-white/5 border-white/10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sell_price" className="text-xs uppercase tracking-wider text-muted-foreground">Exit Price</Label>
              <Input id="sell_price" name="sell_price" type="number" step="any" placeholder="76760" value={form.sell_price || ""} onChange={handleChange} className="bg-white/5 border-white/10 font-mono" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="entry_date" className="text-xs uppercase tracking-wider text-muted-foreground">Entry Date</Label>
              <Input id="entry_date" name="entry_date" type="date" value={form.entry_date} onChange={handleChange} required className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exit_date" className="text-xs uppercase tracking-wider text-muted-foreground">Exit Date</Label>
              <Input id="exit_date" name="exit_date" type="date" value={form.exit_date} onChange={handleChange} className="bg-white/5 border-white/10" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="space-y-1.5">
            <Label htmlFor="trade_link" className="text-xs uppercase tracking-wider text-muted-foreground">TradingView Link</Label>
            <Input id="trade_link" name="trade_link" placeholder="https://..." value={form.trade_link} onChange={handleChange} className="bg-white/5 border-white/10" />
          </div>

          {/* Row 5 */}
          <div className="space-y-1.5">
            <Label htmlFor="trade_setup_notes" className="text-xs uppercase tracking-wider text-muted-foreground">Notes</Label>
            <textarea
              id="trade_setup_notes"
              name="trade_setup_notes"
              rows={2}
              value={form.trade_setup_notes}
              onChange={handleChange}
              placeholder="Setup notes..."
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                buttonVariants(),
                "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 disabled:opacity-60"
              )}
            >
              {loading ? "Saving..." : "Save Trade"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
