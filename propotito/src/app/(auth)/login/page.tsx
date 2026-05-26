"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sun, Moon, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores";
import { useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";

// Datos de usuarios desde la base de datos
const TEST_USERS = [
  { email: "admin@opscore.com", password: "abcd1234", role: "ADMIN", name: "Admin", color: "bg-red-500/10 text-red-600 border-red-300 hover:bg-red-500/20" },
  { email: "manager@opscore.com", password: "abcd1234", role: "MANAGER", name: "Manager", color: "bg-purple-500/10 text-purple-600 border-purple-300 hover:bg-purple-500/20" },
  { email: "supervisor@opscore.com", password: "abcd1234", role: "SUPERVISOR", name: "Supervisor", color: "bg-blue-500/10 text-blue-600 border-blue-300 hover:bg-blue-500/20" },
  { email: "technician@opscore.com", password: "abcd1234", role: "TECHNICIAN", name: "Técnico", color: "bg-green-500/10 text-green-600 border-green-300 hover:bg-green-500/20" },
  { email: "operator@opscore.com", password: "abcd1234", role: "OPERATOR", name: "Operador", color: "bg-orange-500/10 text-orange-600 border-orange-300 hover:bg-orange-500/20" },
  { email: "user@opscore.com", password: "abcd1234", role: "USUARIO", name: "Usuario", color: "bg-gray-500/10 text-gray-600 border-gray-300 hover:bg-gray-500/20" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuthStore();
  const { setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage } = useI18nStore();
  const t = useTranslation(language);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    clearError();

    try {
      await login({ email, password });
      toast.success(t.auth.login.toast.welcome, t.auth.login.toast.success);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || error || t.auth.login.toast.error;
      setLocalError(errorMessage);
      toast.error(t.auth.login.toast.error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const autoLogin = async (userEmail: string, userPassword: string) => {
    setLoading(true);
    setLocalError("");
    clearError();
    setEmail(userEmail);
    setPassword(userPassword);

    try {
      await login({ email: userEmail, password: userPassword });
      toast.success(t.auth.login.toast.welcome, t.auth.login.toast.success);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || error || t.auth.login.toast.error;
      setLocalError(errorMessage);
      toast.error(t.auth.login.toast.error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
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
                {t.auth.login.title}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t.auth.login.subtitle}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-input"
                    placeholder="usuario@opscore.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
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
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error */}
              {(localError || error) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 rounded-md bg-destructive/10 border border-destructive/20"
                >
                  <p className="text-destructive text-sm text-center">
                    {localError || error}
                  </p>
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.auth.login.loading}
                  </>
                ) : (
                  <>
                    {t.auth.login.submit}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Links */}
            <div className="flex flex-col gap-2 w-full text-center text-sm">
              <Link 
                href="/recovery" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.auth.login.forgotPassword}
              </Link>
            </div>

            {/* Auto-login buttons */}
            <div className="w-full border-t border-border pt-4">
              <p className="text-center text-xs text-muted-foreground mb-3">
                Acceso rápido (1 click)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TEST_USERS.map((user) => (
                  <Button
                    key={user.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => autoLogin(user.email, user.password)}
                    disabled={loading}
                    className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${user.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      <span className="font-semibold text-xs">{user.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {user.role}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

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

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t.common.copyright}
        </p>
      </motion.div>
    </div>
  );
}
