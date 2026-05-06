"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPropAccount, updatePropAccount } from "@/lib/trades-api";
import type { PropAccount } from "@/lib/data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: PropAccount;
}

export function AccountModal({ open, onOpenChange, account }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firm_name: account?.firm_name ?? "",
    account_size: account?.account_size ?? 100000,
    status: account?.status ?? "Phase 1",
    profit_target_pct: account?.profit_target_pct ?? 8,
    daily_dd_pct: account?.daily_dd_pct ?? 5,
    max_dd_pct: account?.max_dd_pct ?? 10,
    total_payouts: account?.total_payouts ?? 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (account) {
        await updatePropAccount(account.id, formData);
      } else {
        await createPropAccount(formData);
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to save account", error);
      alert("Error saving account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0A0B] border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "Add Prop Account"}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Configure your prop firm account rules and details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Firm Name</Label>
              <Input
                name="firm_name"
                value={formData.firm_name}
                onChange={handleChange}
                placeholder="e.g. FTMO"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData(p => ({ ...p, status: val }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phase 1">Phase 1</SelectItem>
                  <SelectItem value="Phase 2">Phase 2</SelectItem>
                  <SelectItem value="Funded">Funded</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Initial Balance ($)</Label>
            <Input
              type="number"
              name="account_size"
              value={formData.account_size}
              onChange={handleChange}
              className="bg-white/5 border-white/10 font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Target %</Label>
              <Input
                type="number"
                name="profit_target_pct"
                value={formData.profit_target_pct}
                onChange={handleChange}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Daily DD %</Label>
              <Input
                type="number"
                name="daily_dd_pct"
                value={formData.daily_dd_pct}
                onChange={handleChange}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Max DD %</Label>
              <Input
                type="number"
                name="max_dd_pct"
                value={formData.max_dd_pct}
                onChange={handleChange}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
          </div>

          {formData.status === "Funded" && (
            <div className="space-y-2">
              <Label>Total Payouts Received ($)</Label>
              <Input
                type="number"
                name="total_payouts"
                value={formData.total_payouts}
                onChange={handleChange}
                className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !formData.firm_name}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {loading ? "Saving..." : "Save Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
