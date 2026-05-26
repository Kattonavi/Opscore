import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeWrapper } from "@/components/theme-wrapper";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "OpsCore - Sistema de Gestión de Incidentes",
  description: "Plataforma integral para la gestión y seguimiento de incidentes operativos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeWrapper
          defaultTheme="dark"
          storageKey="opscore-theme"
        >
          {children}
          <Toaster />
        </ThemeWrapper>
      </body>
    </html>
  );
}