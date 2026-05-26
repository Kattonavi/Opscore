"use client";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "relative h-9 w-9 cursor-pointer rounded-full",
        )}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium">
          {initials || <User className="h-4 w-4" />}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-base shrink-0">
                  {initials || <User className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {user?.role && (
                    <p className="text-xs text-primary font-medium mt-0.5 capitalize">{user.role.toLowerCase()}</p>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
