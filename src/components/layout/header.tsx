"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Get initials from email
  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  // Get avatar URL from Google OAuth metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header
      className="h-[72px] w-full px-8 flex items-center justify-between border-b border-white/5 bg-background/30 backdrop-blur-md sticky top-0 z-40"
      style={{ marginLeft: "80px", width: "calc(100% - 80px)" }}
    >
      <div className="flex items-center gap-3 ml-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <span className="text-white font-bold text-sm leading-none">J</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">{t("app.title")}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggle />

        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors group"
          >
            <Avatar className="h-8 w-8 ring-2 ring-white/10 ring-offset-0">
              <AvatarImage src={avatarUrl} alt="User" />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                {user?.email ? getInitials(user.email) : "TJ"}
              </AvatarFallback>
            </Avatar>
            {user?.email && (
              <span className="hidden sm:block text-xs text-muted-foreground max-w-[120px] truncate group-hover:text-foreground transition-colors">
                {user.user_metadata?.full_name || user.email.split("@")[0]}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0A0A0B]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1 z-50">
              {user && (
                <div className="px-3 py-2.5 border-b border-white/8 mb-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || "Trader"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
              >
                <LogOut className="w-4 h-4" />
                <span>Chiqish (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
