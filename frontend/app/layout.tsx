import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import Script from "next/script";
import "./globals.css";

// Fonts are defined in globals.css with a system stack (no Google Fonts
// download at build time). This keeps `next build` reproducible offline
// (Railway/Vercel build runners no longer depend on fonts.gstatic.com).
// The CSS variables --font-geist-sans / --font-geist-mono are kept under
// the same name so the rest of the design system continues to resolve.

export const metadata: Metadata = {
  title: "OpsCore",
  description: "Sistema de Gestión de Incidentes.",
};

const themeScript = `
  (function() {
    function getTheme() {
      const stored = localStorage.getItem('app-theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const theme = getTheme();
    document.documentElement.classList.add(theme);
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <ThemeProvider defaultTheme="dark" storageKey="app-theme">
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
