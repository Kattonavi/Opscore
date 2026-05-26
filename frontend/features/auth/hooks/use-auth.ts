import { useAuthStore } from "@/features/auth/stores/auth-store";

export const useAuth = () => {
  const store = useAuthStore();

  return {
    ...store,
    isAdmin: store.user?.role === "ADMIN",
    isManager: store.user?.role === "MANAGER",
    isOperator: store.user?.role === "OPERATOR",
    fullName: `${store.user?.firstName || ""} ${store.user?.lastName || ""}`.trim(),
    initials: `${store.user?.firstName?.[0] || ""}${store.user?.lastName?.[0] || ""}`,
  };
};
