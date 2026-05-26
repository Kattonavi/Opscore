"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  TrendingUp,
  Users,
  Wrench,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIncidentStore, useAuthStore, useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NewIncidentDialog } from "@/components/incidents/new-incident-dialog";
import { IncidentCard } from "@/components/incidents/incident-card";
import { IncidentStats } from "@/components/incidents/incident-stats";
import { IncidentAnalytics } from "@/components/incidents/incident-analytics";

export default function IncidentsPage() {
  const containerRef = useRef(null);
  const { user } = useAuthStore();
  const { language } = useI18nStore();
  const t = useTranslation(language);
  const { incidents, getIncidentsByStatus, getIncidentStats } = useIncidentStore();
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");

  const stats = getIncidentStats();
  const abiertos = getIncidentsByStatus("OPEN" as any);
  const enProceso = getIncidentsByStatus("IN_PROGRESS" as any);
  const cerrados = getIncidentsByStatus("CLOSED" as any);

  useGSAP(
    () => {
      gsap.from(".stat-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });

      gsap.from(".incident-card", {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.3,
      });
    },
    { scope: containerRef }
  );

  const getIncidentsByTab = () => {
    switch (activeTab) {
      case "abiertos":
        return abiertos;
      case "en_proceso":
        return enProceso;
      case "cerrados":
        return cerrados;
      case "mis_incidentes":
        return incidents.filter(
          (inc) =>
            inc.reportedById === user?.id ||
            inc.assignedToId === user?.id
        );
      default:
        return incidents;
    }
  };

  const filteredIncidents = getIncidentsByTab();

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
            {t.incidents.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.incidents.analytics}
          </p>
        </div>

        <Button
          onClick={() => setShowNewIncident(true)}
          className="gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          {t.incidents.newIncident}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.incidents.stats.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total}</div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.incidents.stats.open}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-red-500">{stats.abiertos}</div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.incidents.stats.inProgress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-yellow-500">{stats.enProceso}</div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.incidents.stats.closed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-500">{stats.cerrados}</div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <IncidentStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">{t.incidents.allIncidents}</TabsTrigger>
          <TabsTrigger value="abiertos">
            {t.incidents.status.abierto}
            {stats.abiertos > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.abiertos}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="en_proceso">
            {t.incidents.status.en_proceso}
            {stats.enProceso > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.enProceso}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cerrados">{t.incidents.status.cerrado}</TabsTrigger>
          <TabsTrigger value="mis_incidentes">{t.incidents.myIncidents}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.incidents.messages.noIncidents}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident as any} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <IncidentAnalytics stats={stats} />

      <NewIncidentDialog open={showNewIncident} onOpenChange={setShowNewIncident} />
    </div>
  );
}
