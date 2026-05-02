"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const t = useTranslations();

  return (
    <header
      className="h-[72px] w-full px-8 flex items-center justify-between border-b border-white/5 bg-background/30 backdrop-blur-md sticky top-0 z-40"
      style={{ marginLeft: '80px', width: 'calc(100% - 80px)' }}
    >
      <div className="flex items-center gap-3 ml-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <span className="text-white font-bold text-sm leading-none">J</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">{t('app.title')}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggle />

        <Button
          variant="outline"
          size="sm"
          className="bg-background/50 border-white/10 hidden sm:flex gap-2"
        >
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <span>{t('header.share')}</span>
        </Button>

        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

        <Avatar className="h-8 w-8 ring-2 ring-white/10 cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>TJ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
