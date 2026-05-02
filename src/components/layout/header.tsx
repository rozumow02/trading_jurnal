"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Share2, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="h-[72px] w-full px-8 flex items-center justify-between border-b border-white/5 bg-terminal-bg/30 backdrop-blur-md sticky top-0 z-40 ml-[60px] lg:ml-[80px]" style={{ width: 'calc(100% - 80px)' }}>
      <div className="flex items-center gap-4 text-emerald-400 font-bold text-xl ml-4 lg:ml-0">
        Saraf <span className="text-muted-foreground font-normal text-sm ml-2">Terminal</span>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggle />
        
        <Button variant="outline" size="sm" className="bg-background/50 border-white/10 glass hidden sm:flex gap-2">
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <span>Share</span>
        </Button>
        
        <div className="w-[1px] h-6 bg-white/10 mx-2 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-white/10 cursor-pointer">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>AZ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
