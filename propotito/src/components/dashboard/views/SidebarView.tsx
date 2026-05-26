// PURE PRESENTATIONAL COMPONENT - NO LOGIC
// Only renders what it receives via props

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, Bell, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MenuSection, NavItemViewModel, UserViewModel } from "../useDashboard";
import { iconMap } from "../dashboard-icons";

// SIDEBAR VIEW PROPS
interface SidebarViewProps {
  isOpen: boolean;
  onClose: () => void;
  sections: MenuSection[];
  navItems: NavItemViewModel[];
  user: UserViewModel;
}

// HEADER VIEW PROPS
interface HeaderViewProps {
  searchPlaceholder: string;
  user: UserViewModel;
  rawUser: { firstName?: string; lastName?: string; email: string } | null;
  onMenuToggle: () => void;
}

// SIDEBAR VIEW COMPONENT
export function SidebarView({ isOpen, onClose, sections, navItems, user }: SidebarViewProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-[260px] bg-card border-r border-border",
          "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarBrand onClose={onClose} />
          
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {sections.map((section) => {
              const sectionItems = navItems.filter((item) => section.items.includes(item.key));
              if (sectionItems.length === 0) return null;
              
              return (
                <div key={section.key} className="space-y-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
                    {section.label}
                  </p>
                  {sectionItems.map((item) => (
                    <NavItemView key={item.href} item={item} />
                  ))}
                </div>
              );
            })}
          </nav>
          
          <SidebarFooter user={user} />
        </div>
      </aside>
    </>
  );
}

// HEADER VIEW COMPONENT
export function HeaderView({ searchPlaceholder, user, rawUser, onMenuToggle }: HeaderViewProps) {
  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden">
        <Menu className="w-5 h-5" />
      </Button>
      
      <div className="flex-1 hidden md:block max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <NotificationsButton />
        {/* UserMenu slot - injected by parent */}
        <div id="user-menu-slot" />
      </div>
    </header>
  );
}

// SUB-COMPONENTS

function SidebarBrand({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary via-accent to-primary/80 flex items-center justify-center text-xl">
          🐦‍🔥
        </div>
        <h1 className="font-bold text-lg text-card-foreground">OpsCore</h1>
      </Link>
      <button onClick={onClose} className="lg:hidden p-1 hover:bg-accent rounded">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function NavItemView({ item }: { item: NavItemViewModel }) {
  const Icon = iconMap[item.icon] as LucideIcon;
  
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        item.isActive
          ? "bg-accent font-medium text-accent-foreground"
          : "text-card-foreground hover:bg-accent/50 hover:text-accent-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", item.isActive ? "scale-110" : "group-hover:scale-105")} />
      <span className="flex-1">{item.label}</span>
      {item.isActive && (
        <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

function SidebarFooter({ user }: { user: UserViewModel }) {
  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {user.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.fullName}</p>
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", user.roleColorClass)}>
            {user.roleLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function NotificationsButton() {
  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="w-5 h-5" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
    </Button>
  );
}
