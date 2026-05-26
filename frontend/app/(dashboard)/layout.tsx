"use client";

import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useI18n } from "@/components/providers/i18n-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserMenu } from "@/features/auth/components/user-menu";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getNavItemsBySection, getRoleLabel, type Role } from "@/lib/rbac";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const { t, mounted } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role as Role | undefined;
  const sections = role ? getNavItemsBySection(role) : [];

  const sidebarUser = user
    ? {
        initials: (user.firstName?.[0] || user.email[0] || "U").toUpperCase(),
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        roleLabel: role ? getRoleLabel(role, "es") : "",
      }
    : null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sections={sections}
          t={t}
          user={sidebarUser}
        />

        <div className="flex min-h-screen flex-col lg:pl-[260px]">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden max-w-md flex-1 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={mounted ? t("nav.search") : "Search..."}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 lg:flex-none">
              <ThemeToggle />
              <LanguageSwitcher />
              {isAuthenticated && <UserMenu />}
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
