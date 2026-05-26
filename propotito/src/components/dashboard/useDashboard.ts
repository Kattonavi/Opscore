"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { useI18nStore, type Language } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { getNavItemsByRole, hasRouteAccess, getRoleLabel, getRoleColor } from "@/lib/rbac";
import { Role, type UserResponseDTO } from "@/api/types";

// TYPES
export interface MenuSection {
  key: string;
  label: string;
  items: string[];
}

export interface NavItemViewModel {
  href: string;
  icon: string;
  key: string;
  label: string;
  isActive: boolean;
}

export interface UserViewModel {
  initials: string;
  displayName: string;
  fullName: string;
  email: string;
  avatar?: string;
  roleLabel: string;
  roleColorClass: string;
}

export interface DashboardViewModel {
  // State
  isLoading: boolean;
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  
  // User
  user: UserViewModel | null;
  rawUser: UserResponseDTO | null;
  
  // Language
  language: Language;
  
  // Navigation
  menuSections: MenuSection[];
  navItems: NavItemViewModel[];
  
  // UI Labels
  labels: {
    loading: string;
    search: string;
    logout: string;
    lightMode: string;
    darkMode: string;
    language: string;
  };
  
  // Actions
  actions: {
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void;
    logout: () => Promise<void>;
    changeLanguage: (lang: Language) => void;
  };
}

  // LOGIC
export function useDashboard(): DashboardViewModel {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout: authLogout, loading, fetchCurrentUser } = useAuthStore();
  const { language, setLanguage } = useI18nStore();
  const t = useTranslation(language);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Mount check + token check + fetch current user
  useEffect(() => {
    setMounted(true);
    // Check if there's a token in localStorage
    const token = localStorage.getItem('token');
    setHasToken(!!token);
    
    // Refresh user data to get latest info (avatar, etc.)
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  // Auth redirect - wait for both mounted and auth state loaded
  useEffect(() => {
    if (mounted && !loading && !isAuthenticated && !hasToken) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, loading, mounted, hasToken]);

  // Route protection
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      const hasAccess = hasRouteAccess(pathname, user.role as Role);
      if (!hasAccess) {
        router.push("/dashboard");
      }
    }
  }, [pathname, user, isAuthenticated, mounted, router]);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Actions
  const handleLogout = useCallback(async () => {
    try {
      await authLogout();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }, [authLogout]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, [setLanguage]);

  // View Models - provide fallback if user is null but we have token (hydrating)
  const userViewModel: UserViewModel | null = user ? {
    initials: user.firstName?.charAt(0) || user.email.charAt(0) || "U",
    displayName: user.firstName || user.email || "Usuario",
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Usuario",
    email: user.email,
    avatar: user.avatar || undefined,
    roleLabel: getRoleLabel(user.role, language),
    roleColorClass: getRoleColor(user.role),
  } : hasToken ? {
    // Fallback while hydrating
    initials: "U",
    displayName: "Usuario",
    fullName: "Cargando...",
    email: "",
    avatar: undefined,
    roleLabel: "Cargando...",
    roleColorClass: "bg-muted text-muted-foreground",
  } : null;

  const menuSections: MenuSection[] = [
    { key: "principal", label: t.nav.sistema, items: ["dashboard", "incidentes"] },
    { key: "gestion", label: t.nav.contenido, items: ["reportes", "usuarios", "asignaciones"] },
    { key: "personal", label: t.nav.datosUsuario, items: ["perfil", "configuracion"] },
  ];

  const navItemsFromRole = getNavItemsByRole(user?.role as Role);
  const navItems: NavItemViewModel[] = navItemsFromRole.map(item => ({
    href: item.href,
    icon: item.icon,
    key: item.key,
    label: {
      dashboard: "Dashboard",
      incidentes: t.nav.incidentes,
      reportes: t.nav.reportes,
      usuarios: t.nav.usuarios,
      asignaciones: t.nav.asignaciones,
      perfil: t.nav.perfil,
      configuracion: t.nav.configuracion,
    }[item.key] || item.key,
    isActive: pathname === item.href || pathname.startsWith(item.href + "/"),
  }));

  const labels = {
    loading: t.incidents.messages.loading,
    search: t.dashboard.search,
    logout: t.nav.logout,
    lightMode: language === "es" ? "Modo claro" : language === "en" ? "Light mode" : "Modo claro",
    darkMode: language === "es" ? "Modo oscuro" : language === "en" ? "Dark mode" : "Modo escuro",
    language: language === "es" ? "Idioma" : language === "en" ? "Language" : "Idioma",
  };

  // Check if we should show loading (either loading state OR hydrating with token)
  const isLoading = !mounted || loading || (!isAuthenticated && hasToken);

  return {
    isLoading,
    isAuthenticated: isAuthenticated || hasToken,
    isSidebarOpen,
    user: userViewModel,
    rawUser: user,
    language,
    menuSections,
    navItems,
    labels,
    actions: {
      openSidebar: () => setIsSidebarOpen(true),
      closeSidebar: () => setIsSidebarOpen(false),
      toggleSidebar: () => setIsSidebarOpen(prev => !prev),
      logout: handleLogout,
      changeLanguage: handleLanguageChange,
    },
  };
}
