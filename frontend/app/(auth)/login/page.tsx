"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, User } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n, useTranslations, type Locale } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

const TEST_USERS = [
  { email: "admin@opscore.com", password: "abcd1234", role: "ADMIN", nameKey: "admin", color: "1" },
  { email: "manager@opscore.com", password: "abcd1234", role: "MANAGER", nameKey: "manager", color: "2" },
  { email: "supervisor@opscore.com", password: "abcd1234", role: "SUPERVISOR", nameKey: "supervisor", color: "3" },
  { email: "technician@opscore.com", password: "abcd1234", role: "TECHNICIAN", nameKey: "technician", color: "4" },
  { email: "operator@opscore.com", password: "abcd1234", role: "OPERATOR", nameKey: "operator", color: "5" },
  { email: "user@opscore.com", password: "abcd1234", role: "USUARIO", nameKey: "user", color: "6" },
];

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, clearError } = useAuthStore();
  const { theme, setTheme, mounted } = useTheme();
  const { locale, setLocale } = useI18n();
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);

  const doLogin = async (email: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch {
      // error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <span className="text-6xl">🐦‍🔥</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">OpsCore</h1>
            <p className="text-base text-muted-foreground">
              {t("loginSubtitle")}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-fade-in-up delay-150">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-card-foreground">
              {t("loginTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("loginDescription")}
            </p>
          </div>

          <LoginForm />

          {/* Quick access */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 text-center text-xs text-muted-foreground">
              {t("quickAccess.title")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TEST_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  disabled={loading}
                  onClick={() => doLogin(u.email, u.password)}
                  className="flex flex-col items-center gap-1 rounded-lg border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
                  style={{
                    borderColor: `var(--chart-${u.color})`,
                    color: `var(--chart-${u.color})`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-semibold">{t(`quickAccess.${u.nameKey}`)}</span>
                  </div>
                  <span className="rounded-full border px-1.5 py-0 text-[10px]">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls: Theme + Language */}
        <div className="flex items-center justify-center gap-4 animate-fade-in delay-300">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            disabled={!mounted}
          >
            {theme === "dark" || !mounted ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  locale === lang.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} OpsCore. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
