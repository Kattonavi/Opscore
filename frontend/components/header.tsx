"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserMenu } from "@/features/auth/components/user-menu";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import Link from "next/link";

export function Header() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl">🐦‍🔥</span>
            <span className="font-bold text-xl text-primary">OpsCore</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
