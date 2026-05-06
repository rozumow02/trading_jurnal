import { getPropAccounts, getTrades } from "@/lib/trades-api";
import { AccountsView } from "@/components/wallet/AccountsView";
import { Wallet } from "lucide-react";
import type { PropAccount, Trade } from "@/lib/data";

export default async function WalletPage() {
  let accounts: PropAccount[] = [];
  let trades: Trade[] = [];

  try {
    accounts = await getPropAccounts();
    trades = await getTrades();
  } catch (error) {
    console.error("Failed to fetch wallet data:", error);
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-500" />
          Prop Accounts
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your prop firm challenges, track drawdowns, and monitor payouts.
        </p>
      </div>

      <AccountsView accounts={accounts} trades={trades} />
    </div>
  );
}
