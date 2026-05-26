"use client";

import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { Sun, Moon, Bell, Cog, Info, Server, Globe, Volume2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/stores/config-store";

const SYSTEM_INFO = {
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development",
};

const HEALTH_STATUS = {
  IDLE: "idle",
  OK: "ok",
  ERROR: "error",
  LOADING: "loading",
} as const;

type HealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];

export default function ConfiguracionPage() {
  const { t, mounted, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const { apiBaseUrl, setApiBaseUrl } = useConfigStore();
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: false,
    sound: true,
  });
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(HEALTH_STATUS.IDLE);

  const handleCheck = async () => {
    setHealthStatus(HEALTH_STATUS.LOADING);
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      setHealthStatus(HEALTH_STATUS.OK);
    } catch {
      setHealthStatus(HEALTH_STATUS.ERROR);
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const tabCount = isAdmin ? 3 : 2;

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("nav.configuracion")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("configuracionPage.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="info">Información</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Cog className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("configuracionPage.appearance")}</CardTitle>
                  <CardDescription>{t("configuracionPage.appearanceDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-primary" />
                  ) : (
                    <Sun className="h-4 w-4 text-primary" />
                  )}
                  {t("profile.theme")}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:w-72">
                  {(["light", "dark"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTheme(mode)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                        theme === mode
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {mode === "light" ? (
                        <Sun className="h-6 w-6" />
                      ) : (
                        <Moon className="h-6 w-6" />
                      )}
                      <span className="text-xs font-medium">
                        {mode === "light" ? t("profile.light") : t("profile.dark")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  {t("profile.language")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["es", "en", "pt"] as const).map((code) => {
                    const flag = code === "es" ? "🇪🇸" : code === "en" ? "🇺🇸" : "🇧🇷";
                    return (
                      <button
                        key={code}
                        onClick={() => setLocale(code)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all",
                          locale === code
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <span className="text-lg">{flag}</span>
                        {t(`language.${code}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("configuracionPage.notifications")}</CardTitle>
                  <CardDescription>{t("configuracionPage.notificationsDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "email", icon: Mail, label: "configuracionPage.emailNotif" },
                { key: "push", icon: Bell, label: "configuracionPage.pushNotif" },
                { key: "sound", icon: Volume2, label: "configuracionPage.soundEnabled" },
              ].map(({ key, icon: Icon, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-1.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {t(label)}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifSettings[key as keyof typeof notifSettings]}
                    onClick={() =>
                      setNotifSettings((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof notifSettings],
                      }))
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      notifSettings[key as keyof typeof notifSettings]
                        ? "bg-primary"
                        : "bg-input",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform",
                        notifSettings[key as keyof typeof notifSettings]
                          ? "translate-x-5"
                          : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("configuracionPage.systemInfo")}</CardTitle>
                  <CardDescription>{t("configuracionPage.systemInfoDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-y divide-border rounded-lg border border-border">
                {[
                  { label: "configuracionPage.version", value: SYSTEM_INFO.version, icon: Info },
                  { label: "configuracionPage.environment", value: SYSTEM_INFO.environment, icon: Cog },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {t(label)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      {value}
                    </Badge>
                  </div>
                ))}
                <div className="flex flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t("configuracionPage.apiUrl")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 sm:max-w-[320px]">
                    <Select value={apiBaseUrl} onValueChange={(value) => value && setApiBaseUrl(value)}>
                      <SelectTrigger>{apiBaseUrl}</SelectTrigger>
                      <SelectPopup>
                        <SelectList>
                          <SelectItem value="http://localhost:8080">
                            <SelectItemIndicator />
                            <SelectItemText>Local</SelectItemText>
                          </SelectItem>
                          <SelectItem value="https://opscoreapi.onrender.com">
                            <SelectItemIndicator />
                            <SelectItemText>Producción</SelectItemText>
                          </SelectItem>
                        </SelectList>
                      </SelectPopup>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCheck}
                        disabled={healthStatus === HEALTH_STATUS.LOADING}
                      >
                        Probar conexión
                      </Button>
                      {healthStatus === HEALTH_STATUS.OK && (
                        <Badge variant="secondary">OK</Badge>
                      )}
                      {healthStatus === HEALTH_STATUS.ERROR && (
                        <Badge variant="destructive">Error</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
