import { TradesTable } from "@/components/trades/TradesTable";
import { AddTradeModal } from "@/components/trades/AddTradeModal";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { mockTrades } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-mono">Journal</h1>
          <p className="text-muted-foreground text-sm">Track and analyze your trades like a pro.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 glass">
            <button className="px-4 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-sm">Table</button>
            <button className="px-4 py-1.5 rounded-md text-muted-foreground hover:text-foreground text-xs font-medium">Monthly</button>
          </div>
          
          <Button variant="outline" className="bg-transparent border-[#DB9F35]/30 text-[#DB9F35] hover:bg-[#DB9F35]/10 hover:text-[#DB9F35] ml-4 transition-colors">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DB9F35] animate-pulse"></span>
              Add Binance
            </span>
          </Button>
          
          <AddTradeModal />
        </div>
      </div>

      <MetricsCards />
      
      {/* Portfolio Chart area */}
      <div className="pt-2">
        <PnLChart />
      </div>

      {/* Trades Table Area */}
      <div className="pt-6">
        <TradesTable data={mockTrades} />
      </div>
      
    </div>
  );
}
