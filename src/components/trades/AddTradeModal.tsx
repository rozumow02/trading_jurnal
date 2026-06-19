"use client";

import { useTranslations, useFormatter } from "next-intl";
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
import { Switch } from "@/components/ui/switch";
import { Plus, UploadCloud, X, ImageIcon } from "lucide-react";
import { useState } from "react";
import { createTrade } from "@/lib/trades-mutations";
import { type TradePayload } from "@/lib/trades-api";
import { createClient } from "@/lib/supabase/client";
import { TagInput } from "./TagInput";
import type { PropAccount } from "@/lib/data";
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
  account_id: "",
  trade_image: null,
  tags: [],
  is_pending: false,
  fee: 0,
});

export function AddTradeModal({ accounts = [] }: { accounts?: PropAccount[] }) {
  const t = useTranslations("modal");
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TradePayload>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
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
      // Ochiq pozitsiya — exit narx/sana yuborilmaydi, PnL hisoblanmaydi
      if (payload.is_pending) {
        payload.sell_price = undefined;
        payload.exit_date = undefined;
      }
      await createTrade(payload);
      setOpen(false);
      setForm(emptyForm());
      router.refresh();
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
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

          {accounts.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10">
              <p className="text-sm">{t("needWallet")}</p>
              <button
                onClick={() => { setOpen(false); router.push("/wallet"); }}
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
                  className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all cursor-pointer appearance-none hover:bg-white/[0.06]"
                >
                  <option value="" disabled className="bg-[#0A0A0B]">{t("selectAccountPlaceholder")}</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} className="bg-[#0A0A0B] py-2">
                      {acc.account_type === 'prop' ? '🏢' : '💳'} {acc.firm_name} (${format.number(acc.account_size)})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-emerald-400 transition-colors">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/50 italic ml-1">{t("tradesMustBeLinked")}</p>
            </div>
          )} <form onSubmit={handleSubmit} onPaste={handlePaste} className="grid gap-5 py-2 mt-2 max-h-[75vh] overflow-y-auto px-1 scrollbar-hide">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-foreground">{t("isPending")}</Label>
              <span className="text-[11px] text-muted-foreground/70">{t("openPositionHint")}</span>
            </div>
            <Switch
              checked={form.is_pending ?? false}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_pending: checked }))}
            />
          </div>

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
              <Input name="sell_price" type="number" step="any" placeholder="76760" value={form.sell_price || ""} onChange={handleChange} disabled={form.is_pending} className="bg-white/5 border-white/10 font-mono disabled:opacity-40" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("entryDate")}</Label>
              <Input name="entry_date" type="date" value={form.entry_date} onChange={handleChange} required className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("exitDate")}</Label>
              <Input name="exit_date" type="date" value={form.exit_date} onChange={handleChange} disabled={form.is_pending} className="bg-white/5 border-white/10 disabled:opacity-40" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("fee")}</Label>
            <Input name="fee" type="number" step="any" placeholder="3.99" value={form.fee || ""} onChange={handleChange} className="bg-white/5 border-white/10 font-mono" />
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
