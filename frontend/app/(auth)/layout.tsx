import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpsCore",
  description: "Sistema de Gestión de Incidentes.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
