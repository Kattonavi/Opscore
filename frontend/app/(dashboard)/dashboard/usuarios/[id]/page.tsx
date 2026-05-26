"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { usersApi } from "@/api/user";
import { getRoleLabel, getRoleColor, Role } from "@/lib/rbac";
import type { UserResponseDTO } from "@/api/types";
import {
  ArrowLeft,
  Mail,
  Shield,
  Building2,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDetailPage() {
  const { t, locale, mounted } = useI18n();
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = Number(params.id);

  useEffect(() => {
    usersApi
      .getById(userId)
      .then(setUser)
      .catch((err) => setError(err?.response?.data?.message || t("users.loadError")))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 opacity-40" />
        <p className="text-sm">{error || t("users.notFound")}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {t("users.back")}
        </Button>
      </div>
    );
  }

  const role = user.role as Role;
  const roleColor = getRoleColor(role);
  const roleLabel = getRoleLabel(role, locale);
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {t("users.backToList")}
      </Button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-border shadow-lg"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-lg">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </span>
              {user.area && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {user.area}
                  </span>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-xs font-medium", roleColor)}>
                <Shield className="mr-1 h-3 w-3" />
                {roleLabel}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Activity className={cn("mr-1 h-3 w-3", user.active ? "text-emerald-500" : "text-muted-foreground")} />
                {user.active ? t("users.active") : t("users.inactive")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t("users.detail.title")}</CardTitle>
              <CardDescription>{t("users.detail.description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("profile.firstName")}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{user.firstName}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("profile.lastName")}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{user.lastName}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("users.detail.area")}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{user.area || t("users.detail.noArea")}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("profile.role")}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{roleLabel}</span>
                <Badge variant="outline" className={cn("text-[10px]", roleColor)}>{role}</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("users.detail.status")}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={cn("inline-block h-2 w-2 rounded-full", user.active ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                <span className="text-sm font-medium text-foreground">{user.active ? t("users.active") : t("users.inactive")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
