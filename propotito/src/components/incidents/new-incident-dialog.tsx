"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useIncidentStore,
  useAuthStore,
  useI18nStore,
  IncidentType,
  IncidentArea,
  IncidentPriority,
} from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/lib/toast";

interface NewIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewIncidentDialog({ open, onOpenChange }: NewIncidentDialogProps) {
  const { user } = useAuthStore();
  const { language } = useI18nStore();
  const t = useTranslation(language);
  const { createIncident } = useIncidentStore();

  const [formData, setFormData] = useState({
    tipo: "" as IncidentType,
    area: "" as IncidentArea,
    prioridad: "" as IncidentPriority,
    titulo: "",
    descripcion: "",
    ubicacion: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipo || !formData.area || !formData.prioridad || !formData.titulo || !formData.descripcion) {
      toast.error(t.incidents.messages.fillRequired);
      return;
    }

    try {
      await createIncident({
        title: formData.titulo,
        description: formData.descripcion,
        type: "OTHER" as any, // TODO: Mapear tipo legacy a IncidentType
        priority: (formData.prioridad === "critica" ? "CRITICAL" : 
                   formData.prioridad === "alta" ? "HIGH" : 
                   formData.prioridad === "baja" ? "LOW" : "MEDIUM") as any,
      });

      toast.success(t.incidents.messages.incidentCreated);
      onOpenChange(false);
      setFormData({
        tipo: "" as IncidentType,
        area: "" as IncidentArea,
        prioridad: "" as IncidentPriority,
        titulo: "",
        descripcion: "",
        ubicacion: "",
      });
    } catch (error) {
      toast.error("Error al crear incidente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t.incidents.reportIncident}
          </DialogTitle>
          <DialogDescription>
            {t.incidents.messages.fillRequired}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">{t.incidents.fields.tipo} *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value as IncidentType })
                }
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder={t.incidents.fields.tipo} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="falla_maquina">
                    {t.incidents.type.falla_maquina}
                  </SelectItem>
                  <SelectItem value="accidente">
                    {t.incidents.type.accidente}
                  </SelectItem>
                  <SelectItem value="desviacion_calidad">
                    {t.incidents.type.desviacion_calidad}
                  </SelectItem>
                  <SelectItem value="otro">
                    {t.incidents.type.otro}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">{t.incidents.fields.area} *</Label>
              <Select
                value={formData.area}
                onValueChange={(value) =>
                  setFormData({ ...formData, area: value as IncidentArea })
                }
              >
                <SelectTrigger id="area">
                  <SelectValue placeholder={t.incidents.fields.area} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produccion">
                    {t.incidents.area.produccion}
                  </SelectItem>
                  <SelectItem value="mantenimiento">
                    {t.incidents.area.mantenimiento}
                  </SelectItem>
                  <SelectItem value="calidad">
                    {t.incidents.area.calidad}
                  </SelectItem>
                  <SelectItem value="seguridad">
                    {t.incidents.area.seguridad}
                  </SelectItem>
                  <SelectItem value="logistica">
                    {t.incidents.area.logistica}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad">{t.incidents.fields.prioridad} *</Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value) =>
                  setFormData({ ...formData, prioridad: value as IncidentPriority })
                }
              >
                <SelectTrigger id="prioridad">
                  <SelectValue placeholder={t.incidents.fields.prioridad} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">
                    {t.incidents.priority.baja}
                  </SelectItem>
                  <SelectItem value="media">
                    {t.incidents.priority.media}
                  </SelectItem>
                  <SelectItem value="alta">
                    {t.incidents.priority.alta}
                  </SelectItem>
                  <SelectItem value="critica">
                    {t.incidents.priority.critica}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">{t.incidents.fields.ubicacion}</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
                placeholder="Ej: Línea 3, Sector B"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">{t.incidents.fields.titulo} *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              placeholder="Resumen breve del incidente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">{t.incidents.fields.descripcion} *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Describe el incidente en detalle..."
              rows={5}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t.incidents.actions.cancel}
            </Button>
            <Button type="submit" className="flex-1">
              {t.incidents.actions.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
