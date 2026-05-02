"use client";

import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  CalendarDays,
  PieChart,
  Wallet,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, href: "/" as const, key: "dashboard" },
  { icon: CalendarDays, href: "/calendar" as const, key: "calendar" },
  { icon: PieChart, href: "/analytics" as const, key: "analytics" },
  { icon: Wallet, href: "/wallet" as const, key: "wallet" },
  { icon: FileText, href: "/reports" as const, key: "reports" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside className="w-[80px] h-screen fixed left-0 top-0 border-r border-white/5 bg-background/50 backdrop-blur-xl flex flex-col items-center py-6 gap-6 z-50">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4">
        <span className="text-white font-bold text-xl leading-none">J</span>
      </div>

      <nav className="flex flex-col gap-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={t(item.key)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)] ring-1 ring-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-16 bg-popover border border-white/10 text-foreground text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
