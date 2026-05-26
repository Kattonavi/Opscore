"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { X, LayoutDashboard, AlertTriangle, BarChart3, Users, UserCheck, UserCircle, Shield, ListChecks, Settings, Building2, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NavItem, MenuSection } from "@/lib/rbac";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Users,
  UserCheck,
  UserCircle,
  Shield,
  ListChecks,
  Settings,
  Building2,
  BookOpen,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: { section: MenuSection; items: NavItem[] }[];
  t: (key: string) => string;
  user: { initials: string; fullName: string; roleLabel: string } | null;
}

export function Sidebar({ isOpen, onClose, sections, t, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-[260px] bg-sidebar border-r border-sidebar-border",
          "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary via-accent to-primary/80 text-xl">
                🐦‍🔥
              </div>
              <h1 className="text-lg font-bold text-sidebar-foreground">OpsCore</h1>
            </Link>
            <button onClick={onClose} className="rounded p-1 hover:bg-sidebar-accent lg:hidden">
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {sections.map(({ section, items }) => (
              <div key={section.key} className="space-y-1">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {t(section.label)}
                </p>
                {items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{t(item.label)}</span>
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {user && (
            <div className="shrink-0 border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-sm font-bold text-primary-foreground">
                  {user.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {user.roleLabel}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
