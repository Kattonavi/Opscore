"use client";

import { useState } from "react";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Incident, useIncidentStore, useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/lib/toast";

interface AssignIncidentDialogProps {
  incident: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tecnicos = [
  { id: "tec-001", nombre: "Carlos Rodríguez" },
  { id: "tec-002", nombre: "María González" },
  { id: "tec-003", nombre: "Juan Pérez" },
  { id: "tec-004", nombre: "Ana Martínez" },
  { id: "tec-005", nombre: "Luis Fernández" },
];

export function AssignIncidentDialog({
  incident,
  open,
  onOpenChange,
}: AssignIncidentDialogProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);
  const { assignIncident } = useIncidentStore();
  const [selectedTecnico, setSelectedTecnico] = useState("");

  const handleAssign = () => {
    if (!selectedTecnico) {
      toast.error(t.incidents.messages.fillRequired);
      return;
    }

    const tecnico = tecnicos.find((t) => t.id === selectedTecnico);
    if (tecnico) {
      assignIncident(Number(incident.id), {
        technicianId: Number(tecnico.id),
        supervisorId: 1, // TODO: Obtener supervisorId del usuario actual
      });
      toast.success(t.incidents.messages.incidentAssigned);
      onOpenChange(false);
      setSelectedTecnico("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t.incidents.actions.assign}
          </DialogTitle>
          <DialogDescription>
            Asignar incidente {incident.id} a un técnico responsable
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
            <Label htmlFor="tecnico">{t.incidents.fields.asignadoA}</Label>
            <Select value={selectedTecnico} onValueChange={setSelectedTecnico}>
              <SelectTrigger id="tecnico">
                <SelectValue placeholder="Seleccionar técnico..." />
              </SelectTrigger>
              <SelectContent>
                {tecnicos.map((tecnico) => (
                  <SelectItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t.incidents.actions.cancel}
            </Button>
            <Button className="flex-1" onClick={handleAssign}>
              {t.incidents.actions.assign}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
