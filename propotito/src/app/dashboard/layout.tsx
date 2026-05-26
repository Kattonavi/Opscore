"use client";

import { useTheme } from "next-themes";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { LoadingView } from "@/components/dashboard/views/LoadingView";
import { SidebarView, HeaderView } from "@/components/dashboard/views/SidebarView";
import { UserMenuView } from "@/components/dashboard/views/UserMenuView";
import type { Language } from "@/lib/store";

const LANGUAGES = [
  { code: "es" as Language, flag: "🇪🇸", label: "Español" },
  { code: "en" as Language, flag: "🇺🇸", label: "English" },
  { code: "pt" as Language, flag: "🇧🇷", label: "Português" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // LOGIC - Hook provides all data and actions
  const vm = useDashboard();
  const { theme, setTheme } = useTheme();
  
  if (vm.isLoading) {
    return <LoadingView message={vm.labels.loading} />;
  }

  if (!vm.isAuthenticated || !vm.user) {
    return null;
  }

  // VIEW - Pure rendering
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Pure View */}
      <SidebarView
        isOpen={vm.isSidebarOpen}
        onClose={vm.actions.closeSidebar}
        sections={vm.menuSections}
        navItems={vm.navItems}
        user={vm.user}
      />

      {/* Main Content */}
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        {/* Header - Pure View */}
        <HeaderView
          searchPlaceholder={vm.labels.search}
          user={vm.user}
          rawUser={vm.rawUser}
          onMenuToggle={vm.actions.openSidebar}
        />

        {/* User Menu - Separate component with its own state */}
        <div className="absolute top-2 right-4 lg:right-6 z-50">
          <UserMenuView
            initials={vm.user.initials}
            displayName={vm.user.displayName}
            fullName={vm.user.fullName}
            email={vm.user.email}
            avatar={vm.user.avatar}
            roleLabel={vm.user.roleLabel}
            currentLanguage={vm.language}
            isDarkMode={theme === "dark"}
            labels={{
              logout: vm.labels.logout,
              lightMode: vm.labels.lightMode,
              darkMode: vm.labels.darkMode,
              language: vm.labels.language,
            }}
            languages={LANGUAGES}
            onLogout={vm.actions.logout}
            onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            onLanguageChange={vm.actions.changeLanguage}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
