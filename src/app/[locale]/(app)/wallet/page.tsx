import { AccountsView } from "@/components/wallet/AccountsView";
import { getPropAccounts, getTrades } from "@/lib/trades-api";

export default async function WalletPage() {
  const [accounts, trades] = await Promise.all([
    getPropAccounts(),
    getTrades(),
  ]);

  return (
    <div className="p-8">
      <AccountsView accounts={accounts} trades={trades} />
    </div>
  );
}
