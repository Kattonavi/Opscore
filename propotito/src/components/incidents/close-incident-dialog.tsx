"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Incident, useIncidentStore, useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/lib/toast";

interface CloseIncidentDialogProps {
  incident: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloseIncidentDialog({
  incident,
  open,
  onOpenChange,
}: CloseIncidentDialogProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);
  const { resolveIncident } = useIncidentStore();
  const [solucion, setSolucion] = useState("");
  const [causaRaiz, setCausaRaiz] = useState("");

  const handleClose = () => {
    if (!solucion) {
      toast.error(t.incidents.messages.fillRequired);
      return;
    }

    resolveIncident(Number(incident.id));
    toast.success(t.incidents.messages.incidentClosed);
    onOpenChange(false);
    setSolucion("");
    setCausaRaiz("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {t.incidents.actions.close}
          </DialogTitle>
          <DialogDescription>
            Cerrar incidente {incident.id} con la solución aplicada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <p className="text-sm font-medium">{incident.titulo}</p>
            <p className="text-xs text-muted-foreground">
              {incident.tipo || "otro"} - {incident.area || "produccion"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solucion">{t.incidents.fields.solucion} *</Label>
            <Textarea
              id="solucion"
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
              placeholder="Describe la solución aplicada..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="causaRaiz">{t.incidents.fields.causaRaiz}</Label>
            <Textarea
              id="causaRaiz"
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              placeholder="Análisis de causa raíz (opcional)..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Identificar la causa raíz ayuda a prevenir incidentes futuros
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t.incidents.actions.cancel}
            </Button>
            <Button
              className="flex-1"
              onClick={handleClose}
            >
              {t.incidents.actions.close}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
