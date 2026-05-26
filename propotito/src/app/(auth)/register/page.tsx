"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage } = useI18nStore();
  const t = useTranslation(language);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const passwordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError(t.auth.register.toast.error);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.register.toast.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(t.auth.register.toast.error);
      return;
    }

    setLoading(true);
    
    // Simular registro
    await new Promise((r) => setTimeout(r, 1500));
    
    toast.success(t.auth.register.toast.success, t.auth.register.toast.success);
    
    router.push("/login");
  };

  const strength = passwordStrength();
  const strengthColors = [
    "bg-destructive",
    "bg-accent", 
    "bg-primary/70",
    "bg-primary"
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border shadow-lg bg-card">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🐦‍🔥</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                {t.auth.register.title}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t.auth.register.subtitle}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">{t.auth.register.firstName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-background border-input"
                    placeholder={t.auth.register.firstName}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t.auth.register.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-input"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                {email && !validateEmail(email) && (
                  <p className="text-xs text-accent">{t.auth.register.toast.error}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t.auth.register.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background border-input"
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {password && (
                  <div className="flex gap-1 mt-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength ? strengthColors[strength - 1] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">{t.auth.register.confirmPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background border-input"
                    placeholder="••••••••"
                    required
                  />
                  {confirmPassword && password === confirmPassword && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-md bg-destructive/10 border border-destructive/20"
                >
                  <p className="text-destructive text-sm text-center">{error}</p>
                </motion.div>
              )}

              {/* Submit */}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t.auth.register.submit}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                {t.auth.register.haveAccount}
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {/* Theme toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </Button>

          {/* Language selector */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1">
            {(["es", "en", "pt"] as const).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-3 ${
                  language === lang 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t.common.copyright}
        </p>
      </motion.div>
    </div>
  );
}
