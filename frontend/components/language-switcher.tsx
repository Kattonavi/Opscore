"use client";

import { Globe } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, useTranslations, locales, localeNames, type Locale } from "@/components/providers/i18n-provider";

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const { locale, setLocale, mounted } = useI18n();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        disabled
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Loading language</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "cursor-pointer",
        )}
      >
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">{t("select")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            <span className="mr-2">
              {loc === "es" ? "🇪🇸" : loc === "en" ? "🇬🇧" : "🇧🇷"}
            </span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
