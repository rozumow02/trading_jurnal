"use client";

import { useTranslations, useFormatter } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { updateTrade } from "@/lib/trades-mutations";
import { type TradePayload } from "@/lib/trades-api";
import { createClient } from "@/lib/supabase/client";
import { TagInput } from "./TagInput";
import { useRouter } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Trade, PropAccount } from "@/lib/data";

interface EditTradeModalProps {
  trade: Trade;
  open: boolean;
  onClose: () => void;
  accounts?: PropAccount[];
}

export function EditTradeModal({ trade, open, onClose, accounts = [] }: EditTradeModalProps) {
  const t = useTranslations("modal");
  const format = useFormatter();
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
    account_id: "",
    trade_image: null,
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  // Pre-fill form when trade changes
  useEffect(() => {
    if (trade) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        account_id: trade.account_id || "",
        trade_image: trade.trade_image || null,
        tags: trade.tags ?? [],
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setUploadingImage(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${ext}`;
      const filePath = `trades/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("trade_images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("trade_images").getPublicUrl(filePath);
      
      setForm((prev) => ({ ...prev, trade_image: data.publicUrl }));
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setError("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageUpload(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_id) {
      setError("Please select an account or wallet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form };
      if (!payload.account_id) {
        payload.account_id = null; // Convert empty string to null
      }
      await updateTrade(trade.id, payload);
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

        {accounts.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10">
            <p className="text-sm">{t("needWallet")}</p>
            <button
              onClick={() => { onClose(); router.push("/wallet"); }}
              className="mt-4 text-emerald-400 hover:text-emerald-300 underline underline-offset-4 text-sm font-medium transition-colors"
            >
              Go to Wallet Page
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 font-bold">{t("selectAccount")}</Label>
            <div className="relative group">
              <select
                name="account_id"
                value={form.account_id || ""}
                onChange={handleChange}
                required
                className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all cursor-pointer appearance-none hover:bg-white/[0.06]"
              >
                <option value="" disabled className="bg-[#0A0A0B]">{t("selectAccountPlaceholder")}</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-[#0A0A0B] py-2">
                    {acc.account_type === 'prop' ? '🏢' : '💳'} {acc.firm_name} (${format.number(acc.account_size)})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-blue-400 transition-colors">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} onPaste={handlePaste} className="grid gap-5 py-2 mt-2 max-h-[75vh] overflow-y-auto px-1 scrollbar-hide">
          {/* Account selector is handled above */}
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

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("tags")}</Label>
            <TagInput
              tags={form.tags ?? []}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
              placeholder={t("tagsPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("screenshotImage")}</Label>
            {form.trade_image ? (
              <div className="relative rounded-md border border-white/10 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.trade_image} alt="Trade setup" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, trade_image: null }))}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <div className="flex flex-col items-center text-muted-foreground animate-pulse">
                    <UploadCloud className="w-6 h-6 mb-1" />
                    <span className="text-xs">{t("uploading")}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">{t("clickToUpload")}</span>
                  </div>
                )}
              </label>
            )}
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
