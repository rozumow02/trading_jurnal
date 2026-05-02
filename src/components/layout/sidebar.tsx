"use client";

import Link from "next/link";
import { usePathname } from "@/i18n/routing";
import { LayoutDashboard, CalendarDays, PieChart, Wallet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, href: "/", label: "Dashboard" },
  { icon: CalendarDays, href: "/calendar", label: "Calendar" },
  { icon: PieChart, href: "/analytics", label: "Analytics" },
  { icon: Wallet, href: "/wallet", label: "Wallet" },
  { icon: FileText, href: "/reports", label: "Reports" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[60px] lg:w-[80px] h-screen fixed left-0 top-0 border-r border-white/5 bg-terminal-bg/50 backdrop-blur-xl flex flex-col items-center py-6 gap-6 z-50">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4">
        <span className="text-white font-bold text-lg">S</span>
      </div>
      
      <div className="flex flex-col gap-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                isActive
                  ? "bg-white/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
