"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (value: string | null) => {
    if (!value) return;
    router.replace(pathname, { locale: value });
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[120px] bg-background/50 border-white/10 text-xs text-muted-foreground mr-2 gap-2">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="bg-background/90 border-white/10 backdrop-blur-xl">
        <SelectItem value="en">{t("en")}</SelectItem>
        <SelectItem value="ru">{t("ru")}</SelectItem>
        <SelectItem value="tk">{t("tk")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
