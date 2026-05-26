"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useIncidentsStore } from "@/features/incidents/stores/incidents-store";
import { Priority, IncidentType, priorityConfig } from "@/api/incidents/types";
import { incidentsApi } from "@/api/incidents/api";
import { extractApiError } from "@/lib/api-errors";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "@/components/ui/select";

const TYPE_OPTIONS = Object.values(IncidentType);
const PRIORITY_OPTIONS = Object.values(Priority);

const AREA_OPTIONS = [
  { id: 1, name: "PRODUCTION" },
  { id: 2, name: "CONTABILITY" },
  { id: 3, name: "RRHH" },
  { id: 4, name: "IT" },
  { id: 5, name: "LOGISTICS" },
];

interface CreateIncidentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateIncidentSheet({
  open,
  onOpenChange,
}: CreateIncidentSheetProps) {
  const { t } = useI18n();
  const { fetchIncidents } = useIncidentsStore();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: IncidentType.OTHER,
    priority: Priority.MEDIUM,
    areaId: null as number | null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await incidentsApi.create({
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        areaId: form.areaId || 1,
      });

      // Reset form
      setForm({
        title: "",
        description: "",
        type: IncidentType.OTHER,
        priority: Priority.MEDIUM,
        areaId: null,
      });

      // Close and refresh
      onOpenChange(false);
      fetchIncidents();
    } catch (err) {
      setError(extractApiError(err, t("incidents.form.errorCreating")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-1 flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("incidents.form.sheetTitle")}</SheetTitle>
          <SheetClose />
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="incident-title">
                {t("incidents.form.title")}
              </Label>
              <Input
                id="incident-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                minLength={5}
                maxLength={100}
                placeholder={t("incidents.form.titlePlaceholder")}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="incident-desc">
                {t("incidents.form.description")}
              </Label>
              <Textarea
                id="incident-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                minLength={10}
                maxLength={500}
                placeholder={t("incidents.form.descriptionPlaceholder")}
                className="min-h-[120px]"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>{t("incidents.form.type")}</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as IncidentType })
                }
              >
                <SelectTrigger>
                  {t(`incidents.type.${form.type}`)}
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    {TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        <SelectItemIndicator />
                        <SelectItemText>
                          {t(`incidents.type.${type}`)}
                        </SelectItemText>
                      </SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>{t("incidents.form.priority")}</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm({ ...form, priority: v as Priority })
                }
              >
                <SelectTrigger>
                  {priorityConfig[form.priority]?.label}
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    {PRIORITY_OPTIONS.map((pri) => {
                      const cfg = priorityConfig[pri];
                      return (
                        <SelectItem key={pri} value={pri}>
                          <SelectItemIndicator />
                          <SelectItemText>
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "inline-block h-2 w-2 rounded-full",
                                  cfg.color,
                                )}
                              />
                              {cfg.label}
                            </span>
                          </SelectItemText>
                        </SelectItem>
                      );
                    })}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>

            {/* Area */}
            <div className="space-y-2">
              <Label>{t("incidents.form.area")}</Label>
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
                    ? AREA_OPTIONS.find((o) => o.id === form.areaId)?.name ?? ""
                    : t("incidents.form.selectArea")}
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    <SelectItem value="">
                      <SelectItemIndicator />
                      <SelectItemText>
                        {t("incidents.form.selectArea")}
                      </SelectItemText>
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

          <SheetFooter className="border-t border-border p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t("incidents.form.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Plus className="mr-1.5 h-4 w-4" />
              )}
              {t("incidents.form.submit")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
