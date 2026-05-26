"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Incident, useAuthStore, useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Role } from "@/api/types";
import { cn } from "@/lib/utils";
import { AssignIncidentDialog } from "./assign-incident-dialog";
import { CloseIncidentDialog } from "./close-incident-dialog";
import { IncidentDetailsDialog } from "./incident-details-dialog";

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const { user } = useAuthStore();
  const { language } = useI18nStore();
  const t = useTranslation(language);
  const [showAssign, setShowAssign] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const canAssign = user?.role === Role.SUPERVISOR || user?.role === Role.ADMIN;
  const canClose = user?.role === Role.SUPERVISOR || user?.role === Role.ADMIN || incident.asignadoA === String(user?.id);

  // Configuración de estados usando variables del tema
  const statusConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: any; label: string }> = {
    abierto: {
      color: "bg-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-l-destructive",
      icon: AlertTriangle,
      label: t.incidents.status.abierto,
    },
    asignado: {
      color: "bg-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-l-purple-500",
      icon: User,
      label: "Asignado",
    },
    en_proceso: {
      color: "bg-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-l-accent",
      icon: Clock,
      label: t.incidents.status.en_proceso,
    },
    en_espera: {
      color: "bg-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-l-orange-500",
      icon: Clock,
      label: "En Espera",
    },
    resuelto: {
      color: "bg-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-l-green-500",
      icon: CheckCircle2,
      label: "Resuelto",
    },
    cerrado: {
      color: "bg-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-l-primary",
      icon: CheckCircle2,
      label: t.incidents.status.cerrado,
    },
    cancelado: {
      color: "bg-gray-500",
      bgColor: "bg-gray-500/10",
      borderColor: "border-l-gray-500",
      icon: AlertTriangle,
      label: "Cancelado",
    },
  };

  // Configuración de prioridades usando variables del tema
  const priorityConfig = {
    baja: { 
      color: "bg-muted", 
      textColor: "text-muted-foreground",
      label: t.incidents.priority.baja 
    },
    media: { 
      color: "bg-accent", 
      textColor: "text-accent-foreground",
      label: t.incidents.priority.media 
    },
    alta: { 
      color: "bg-primary", 
      textColor: "text-primary-foreground",
      label: t.incidents.priority.alta 
    },
    critica: { 
      color: "bg-destructive", 
      textColor: "text-destructive-foreground",
      label: t.incidents.priority.critica 
    },
  };

  const status = statusConfig[incident.estado || "abierto"];
  const priority = priorityConfig[incident.prioridad || "media"];
  const StatusIcon = status.icon;

  return (
    <>
      <motion.div
        className="incident-card"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn(
          "relative overflow-hidden", 
          incident.estado === "abierto" && "border-l-4",
          incident.estado === "abierto" && status.borderColor
        )}>
          <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-10", status.color)} style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
          
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {incident.id}
                  </Badge>
                  <Badge className={cn(priority.textColor, priority.color)}>
                    {priority.label}
                  </Badge>
                </div>
                <CardTitle className="text-lg truncate">{incident.titulo}</CardTitle>
              </div>
              <div className={cn("p-2 rounded-full", status.color)}>
                <StatusIcon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {incident.descripcion}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.incidents.fields.tipo}</p>
                  <p className="font-medium">{incident.tipo || "otro"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-accent/10">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.incidents.fields.area}</p>
                  <p className="font-medium">{incident.area || "produccion"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.incidents.fields.reportadoPor}</p>
                  <p className="font-medium truncate">{incident.reportadoPorNombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-secondary">
                  <Calendar className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.incidents.fields.fechaCreacion}</p>
                  <p className="font-medium">
                    {new Date(incident.fechaCreacion || incident.createdAt || Date.now()).toLocaleDateString(language)}
                  </p>
                </div>
              </div>
            </div>

            {incident.asignadoANombre && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{t.incidents.fields.asignadoA}</p>
                  <p className="text-sm font-medium">{incident.asignadoANombre}</p>
                </div>
              </div>
            )}

            {incident.tiempoResolucion && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                <Clock className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{t.incidents.fields.tiempoResolucion}</p>
                  <p className="text-sm font-medium text-primary">
                    {Math.floor(incident.tiempoResolucion / 60)}h {incident.tiempoResolucion % 60}m
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowDetails(true)}
              >
                {t.incidents.actions.view}
              </Button>

              {incident.estado === "abierto" && canAssign && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowAssign(true)}
                >
                  {t.incidents.actions.assign}
                </Button>
              )}

              {incident.estado === "en_proceso" && canClose && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowClose(true)}
                >
                  {t.incidents.actions.close}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AssignIncidentDialog
        incident={incident}
        open={showAssign}
        onOpenChange={setShowAssign}
      />

      <CloseIncidentDialog
        incident={incident}
        open={showClose}
        onOpenChange={setShowClose}
      />

      <IncidentDetailsDialog
        incident={incident}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}
