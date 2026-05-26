"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectTrigger,
} from "@/components/ui/select";
import { useI18n } from "@/components/providers/i18n-provider";
import { usersApi } from "@/api/user";
import { extractApiError } from "@/lib/api-errors";
import type { CreateUserRequestDTO } from "@/api/types";
import { Role, getRoleLabel } from "@/lib/rbac";

interface CreateUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = [
  { id: 1, name: Role.ADMIN },
  { id: 2, name: Role.MANAGER },
  { id: 3, name: Role.SUPERVISOR },
  { id: 4, name: Role.TECHNICIAN },
  { id: 5, name: Role.OPERATOR },
];

const AREA_OPTIONS = [
  { id: 1, name: "PRODUCTION" },
  { id: 2, name: "MAINTENANCE" },
  { id: 3, name: "QUALITY" },
  { id: 4, name: "LOGISTICS" },
  { id: 5, name: "ADMINISTRATION" },
];

export function CreateUserSheet({ open, onOpenChange }: CreateUserSheetProps) {
  const { t, locale } = useI18n();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: 4, // Default TECHNICIAN
    areaId: null as number | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: 4,
    areaId: null as number | null,
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setForm(initialForm);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: CreateUserRequestDTO = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: form.roleId,
        areaId: form.areaId || null,
      };

      await usersApi.create(payload);
      handleOpenChange(false);
    } catch (err: unknown) {
      setError(extractApiError(err, t("users.form.errorCreating")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetHeader>
        <SheetTitle>{t("users.form.sheetTitle")}</SheetTitle>
        <SheetClose />
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <SheetContent className="flex flex-1 flex-col overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("profile.firstName")}</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                required
                placeholder={t("users.form.firstNamePlaceholder")}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("profile.lastName")}</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                required
                placeholder={t("users.form.lastNamePlaceholder")}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder={t("users.form.emailPlaceholder")}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("users.form.password")}</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                minLength={4}
                placeholder="••••••••"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>{t("users.form.role")}</Label>
              <Select
                value={String(form.roleId)}
                onValueChange={(v) =>
                  setForm({ ...form, roleId: Number(v) })
                }
              >
                <SelectTrigger>
                  {getRoleLabel(
                    ROLE_OPTIONS.find((o) => o.id === form.roleId)?.name ?? Role.TECHNICIAN,
                    locale,
                  )}
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        <SelectItemIndicator />
                        <SelectItemText>
                          {getRoleLabel(opt.name, locale)}
                        </SelectItemText>
                      </SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>

            {/* Area */}
            <div className="space-y-2">
              <Label>{t("users.form.area")}</Label>
              <Select
                value={form.areaId ? String(form.areaId) : ""}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    areaId: v ? Number(v) : null,
                  })
                }
              >
                <SelectTrigger>
                  {form.areaId
                    ? AREA_OPTIONS.find((o) => o.id === form.areaId)?.name ?? t("users.form.noArea")
                    : t("users.form.noArea")}
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    <SelectItem value="">
                      <SelectItemIndicator />
                      <SelectItemText>{t("users.form.noArea")}</SelectItemText>
                    </SelectItem>
                    {AREA_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        <SelectItemIndicator />
                        <SelectItemText>{opt.name}</SelectItemText>
                      </SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>
          </div>
        </SheetContent>

        <SheetFooter className="border-t border-border p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            {t("users.form.cancel")}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}
            {t("users.form.submit")}
          </Button>
        </SheetFooter>
      </form>
    </Sheet>
  );
}
