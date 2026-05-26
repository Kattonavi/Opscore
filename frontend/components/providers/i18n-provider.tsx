"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Locale = "es" | "en" | "pt";

export const locales: Locale[] = ["es", "en", "pt"];
export const defaultLocale: Locale = "es";

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  mounted: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Import all translations
import esMessages from "@/i18n/messages/es.json";
import enMessages from "@/i18n/messages/en.json";
import ptMessages from "@/i18n/messages/pt.json";

const messages: Record<Locale, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
  pt: ptMessages,
};

function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): string {
  const keys = path.split(".");
  let value: unknown = obj;
  for (const key of keys) {
    if (typeof value !== "object" || value === null) return path;
    value = (value as Record<string, unknown>)[key];
    if (value === undefined) return path;
  }
  return typeof value === "string" ? value : path;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1] as Locale | undefined;
    if (stored && locales.includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hydration of locale from cookie; deliberate.
      setLocaleState(stored);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- "mounted" flag is set once on first client render; deliberate.
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setLocaleState(newLocale);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let value = getNestedValue(messages[locale], key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  };

  const value = {
    locale,
    setLocale,
    t,
    mounted,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslations(namespace?: string) {
  const { t: baseT } = useI18n();
  
  return (key: string): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return baseT(fullKey);
  };
}
