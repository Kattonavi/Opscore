"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Building2, ExternalLink, Mail, UserPlus } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { getRoleColor, getRoleLabel, Role } from "@/lib/rbac";
import { usersApi } from "@/api/user";
import type { UserResponseDTO } from "@/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateUserSheet } from "@/features/users/components/create-user-sheet";

const ROLES = [
  { key: Role.ADMIN, label: "Administrador" },
  { key: Role.MANAGER, label: "Gerente" },
  { key: Role.SUPERVISOR, label: "Supervisor" },
  { key: Role.TECHNICIAN, label: "Técnico" },
  { key: Role.OPERATOR, label: "Operario" },
];

export default function UsuariosPage() {
  const { t, locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Role>(Role.ADMIN);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- "mounted" flag is set once after first client paint to avoid SSR/CSR text mismatch; deliberate.
    setMounted(true);
    fetchUsers();
  }, []);

  const handleSheetOpenChange = async (isOpen: boolean) => {
    setSheetOpen(isOpen);
    if (!isOpen) await fetchUsers();
  };

  const filteredUsers = users.filter((u) => u.role === activeTab);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("nav.usuarios")}</h1>
          <p className="text-sm text-muted-foreground">{t("users.registered", { count: users.length })}</p>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          {t("users.form.submit")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Role)}>
          <TabsList className="w-full flex-wrap gap-2">
            {ROLES.map((r) => (
              <TabsTrigger key={r.key} value={r.key} className="flex-1 min-w-0 md:flex-1 basis-[calc(50%-4px)] md:basis-auto">
                <span className="truncate">{r.label}</span>
                <span className="ml-1.5 text-xs opacity-60">({users.filter((u) => u.role === r.key).length})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {ROLES.map((r) => (
            <TabsContent key={r.key} value={r.key}>
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
                    <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
                    <p className="text-sm">{t("users.noUsers")}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((u) => {
                    const role = u.role as Role;
                    const colorClass = getRoleColor(role);
                    const label = getRoleLabel(role, locale);
                    return (
                      <Link key={u.id} href={`/dashboard/usuarios/${u.id}`} className="block">
                        <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm">
                          <CardContent className="flex items-center gap-4 p-4">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.firstName} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white", colorClass)}>
                                {u.firstName[0]}
                                {u.lastName[0]}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{u.firstName} {u.lastName}</h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{u.email}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={colorClass}>{label}</Badge>
                              {u.area && (
                                <Badge variant="secondary" className="gap-1">
                                  <Building2 className="h-3 w-3" />
                                  <span className="text-xs">{u.area}</span>
                                </Badge>
                              )}
                              <Badge variant={u.active ? "default" : "destructive"} className="text-xs">
                                {u.active ? t("users.active") : t("users.inactive")}
                              </Badge>
                            </div>

                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <CreateUserSheet open={sheetOpen} onOpenChange={handleSheetOpenChange} />
    </div>
  );
}
