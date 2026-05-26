// PURE PRESENTATIONAL COMPONENT - NO LOGIC
// Only renders based on props

import { useState, useRef, useEffect } from "react";
import { LogOut, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/store";

interface LanguageOption {
  code: Language;
  flag: string;
  label: string;
}

interface UserMenuViewProps {
  initials: string;
  displayName: string;
  fullName: string;
  email: string;
  avatar?: string; // URL del avatar desde la API
  roleLabel?: string;
  currentLanguage: Language;
  isDarkMode: boolean;
  labels: {
    logout: string;
    lightMode: string;
    darkMode: string;
    language: string;
  };
  languages: LanguageOption[];
  onLogout: () => void;
  onThemeToggle: () => void;
  onLanguageChange: (lang: Language) => void;
}

export function UserMenuView({
  initials,
  displayName,
  fullName,
  email,
  avatar,
  roleLabel,
  currentLanguage,
  isDarkMode,
  labels,
  languages,
  onLogout,
  onThemeToggle,
  onLanguageChange,
}: UserMenuViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-2 hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {avatar ? (
          <img 
            src={avatar} 
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover shrink-0 bg-muted"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
            {initials}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-[200]">
          <div className="flex items-center gap-3 px-4 py-3">
            {avatar ? (
              <img 
                src={avatar} 
                alt={fullName}
                className="w-10 h-10 rounded-full object-cover shrink-0 bg-muted"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-base shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
              {roleLabel && (
                <p className="text-xs text-primary font-medium mt-0.5">{roleLabel}</p>
              )}
            </div>
          </div>

          <div className="h-px bg-border mx-4 my-2" />

          <button
            onClick={() => { onThemeToggle(); setIsOpen(false); }}
            className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-3 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm">{isDarkMode ? labels.lightMode : labels.darkMode}</span>
          </button>

          <div className="h-px bg-border mx-4 my-2" />

          <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
            {labels.language}
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onLanguageChange(lang.code); setIsOpen(false); }}
              className="w-full px-4 py-2 text-left hover:bg-accent flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2 text-sm">
                <span>{lang.flag}</span> {lang.label}
              </span>
              {currentLanguage === lang.code && <span className="text-primary text-xs">✓</span>}
            </button>
          ))}

          <div className="h-px bg-border mx-4 my-2" />

          <button
            onClick={() => { onLogout(); setIsOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">{labels.logout}</span>
          </button>
        </div>
      )}
    </div>
  );
}
