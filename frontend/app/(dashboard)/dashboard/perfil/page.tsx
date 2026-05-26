"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { getRoleLabel, getRoleColor, type Role } from "@/lib/rbac";
import {
  User,
  Mail,
  Shield,
  Lock,
  Save,
  Eye,
  EyeOff,
  Building2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { t, mounted } = useI18n();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("personal");

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const role = user?.role as Role | undefined;
  const roleLabel = role ? getRoleLabel(role, "es") : "";
  const roleColor = role ? getRoleColor(role) : "";

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    if (user) {
      setUser({ ...user, firstName: profile.firstName, lastName: profile.lastName, email: profile.email });
    }
    setSaving(false);
    showToast("success", t("profile.saveChanges") + " ✓");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast("error", "Las contraseñas no coinciden");
      return;
    }
    if (passwords.new.length < 4) {
      showToast("error", "La contraseña debe tener al menos 4 caracteres");
      return;
    }
    setChangingPw(true);
    await new Promise((r) => setTimeout(r, 800));
    setPasswords({ current: "", new: "", confirm: "" });
    setChangingPw(false);
    showToast("success", "Contraseña actualizada ✓");
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Hero / Profile Header ── */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-lg">
            {(user?.firstName?.[0] || "?").toUpperCase()}
            {(user?.lastName?.[0] || "").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {user?.area || "Sin área"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs font-medium", roleColor)}>
                <Shield className="mr-1 h-3 w-3" />
                {roleLabel}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Activity className="mr-1 h-3 w-3 text-emerald-500" />
                {user?.active ? t("users.active") : t("users.inactive")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as string)}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t("profile.personalInfo")}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">{t("profile.security")}</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab: Personal ─── */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("profile.personalInfo")}</CardTitle>
                  <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{t("profile.role")}</Label>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{roleLabel}</span>
                    <Badge className={cn("ml-auto text-xs", roleColor)}>
                      {role}
                    </Badge>
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t("profile.saveChanges")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab: Security ─── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("profile.changePassword")}</CardTitle>
                  <CardDescription>{t("profile.changePasswordDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5">
                {(["current", "new", "confirm"] as const).map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {field === "current"
                        ? t("profile.currentPassword")
                        : field === "new"
                          ? t("profile.newPassword")
                          : t("profile.confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field}
                        type={showPw[field] ? "text" : "password"}
                        value={passwords[field]}
                        onChange={(e) =>
                          setPasswords({ ...passwords, [field]: e.target.value })
                        }
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPw({ ...showPw, [field]: !showPw[field] })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPw[field] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                <Button type="submit" disabled={changingPw} className="w-full sm:w-auto">
                  {changingPw ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {t("profile.changePassword")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-destructive text-destructive-foreground",
          )}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
