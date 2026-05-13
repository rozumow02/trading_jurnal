"use client";

import * as React from "react";
import { useTranslations, useFormatter } from "next-intl";
import type { PropAccount, Trade } from "@/lib/data";
import { AccountCard } from "./AccountCard";
import { AccountModal } from "./AccountModal";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, TrendingUp } from "lucide-react";

interface Props {
  accounts: PropAccount[];
  trades: Trade[];
}

export function AccountsView({ accounts, trades }: Props) {
  const t = useTranslations();
  const format = useFormatter();
  const [modalOpen, setModalOpen] = React.useState(false);

  const totalFundedSize = accounts
    .filter(a => a.status === "Funded")
    .reduce((sum, a) => sum + a.account_size, 0);

  const totalPayouts = accounts.reduce((sum, a) => sum + Number(a.total_payouts || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Prop Accounts</p>
            <p className="text-2xl font-bold font-mono text-foreground">{accounts.length}</p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Funded Capital</p>
            <p className="text-2xl font-bold font-mono text-foreground">${format.number(totalFundedSize)}</p>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold">$</span>
          </div>
          <div>
            <p className="text-sm text-emerald-400/80">Total Payouts</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">${format.number(totalPayouts)}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Your Accounts</h2>
          <Button 
            onClick={() => setModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Account
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl border-dashed">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No accounts found</h3>
            <p className="text-muted-foreground mb-6">You haven't added any prop firm accounts yet.</p>
            <Button onClick={() => setModalOpen(true)} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} trades={trades} />
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      <AccountModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
