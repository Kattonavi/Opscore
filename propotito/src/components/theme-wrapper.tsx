"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

// Componente interno que fuerza la aplicación del tema
function ThemeEffect({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  
  React.useEffect(() => {
    // Asegurar que la clase 'dark' se aplique correctamente al elemento html
    const root = document.documentElement;
    const isDark = resolvedTheme === "dark" || theme === "dark";
    
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, resolvedTheme]);

  return <>{children}</>;
}

export function ThemeWrapper({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      storageKey="opscore-theme"
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      <ThemeEffect>{children}</ThemeEffect>
    </ThemeProvider>
  );
}