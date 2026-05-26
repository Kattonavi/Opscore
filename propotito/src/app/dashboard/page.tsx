"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  AlertCircle,
  Shield,
  Users,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { useIncidentsStore, useAuthStore, useI18nStore, useCatalogsStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Role } from "@/api/types";
import { getRoleLabel, getRoleColor } from "@/lib/rbac";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { language } = useI18nStore();
  const t = useTranslation(language);
  const { incidents, getIncidentStats } = useIncidentsStore();
  const { statuses, priorities, types, areas } = useCatalogsStore();

  const stats = getIncidentStats();
  const recentIncidents = incidents.slice(-5).reverse();
  
  const getStatusName = (statusId: string | number) => {
    const status = (statuses as any[]).find(s => String(s?.id) === String(statusId));
    return status?.name || String(statusId);
  };

  const getPriorityName = (priorityId: string | number) => {
    const priority = (priorities as any[]).find(p => String(p?.id) === String(priorityId));
    return priority?.name || String(priorityId);
  };

  const getTypeName = (typeId: string | number) => {
    const type = (types as any[]).find(t => String(t?.id) === String(typeId));
    return type?.name || String(typeId);
  };

  const getAreaName = (areaId: string | number) => {
    const area = (areas as any[]).find(a => String(a?.id) === String(areaId));
    return area?.name || String(areaId);
  };
  
  const statusOpen = (statuses as any[]).find(s => s?.name === "Abierto")?.id || "status-001";
  const statusInProgress = (statuses as any[]).find(s => s?.name === "En Proceso")?.id || "status-002";
  const statusClosed = (statuses as any[]).find(s => s?.name === "Cerrado")?.id || "status-003";
  
  const openCount = stats.open || 0;
  const inProgressCount = stats.inProgress || 0;
  const closedCount = stats.closed || 0;

  const dashboardStats = [
    {
      title: t.incidents.stats.total,
      value: stats.total.toString(),
      change: "+12.5%",
      trend: "up",
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t.incidents.stats.open,
      value: openCount.toString(),
      change: openCount > 0 ? "Requiere atención" : "Todo bien",
      trend: openCount > 0 ? "down" : "up",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: t.incidents.stats.inProgress,
      value: inProgressCount.toString(),
      change: "En resolución",
      trend: "up",
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: t.incidents.stats.closed,
      value: closedCount.toString(),
      change: `${stats.total > 0 ? ((closedCount / stats.total) * 100).toFixed(1) : 0}% resueltos`,
      trend: "up",
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  // Información de acciones según rol
  const getRoleActions = (role: Role | string | undefined) => {
    switch (role) {
      case Role.ADMIN:
        return [
          { icon: Shield, label: t.dashboard.actions.manageUsers, color: "text-destructive" },
          { icon: Users, label: t.nav.usuarios, color: "text-primary" },
          { icon: ClipboardList, label: t.incidents.newIncident, color: "text-accent" },
          { icon: BarChart3, label: t.nav.reportes, color: "text-primary" },
        ];
      case Role.MANAGER:
        return [
          { icon: UserCheck, label: t.dashboard.actions.viewReports, color: "text-purple-500" },
          { icon: Users, label: t.nav.usuarios, color: "text-primary" },
          { icon: ClipboardList, label: t.incidents.newIncident, color: "text-accent" },
          { icon: BarChart3, label: t.nav.reportes, color: "text-primary" },
        ];
      case Role.SUPERVISOR:
        return [
          { icon: UserCheck, label: t.nav.asignaciones, color: "text-primary" },
          { icon: ClipboardList, label: t.incidents.newIncident, color: "text-accent" },
          { icon: BarChart3, label: t.nav.reportes, color: "text-primary" },
        ];
      case Role.TECHNICIAN:
        return [
          { icon: CheckCircle2, label: t.dashboard.actions.resolveIncident, color: "text-accent" },
          { icon: ClipboardList, label: t.nav.incidentes, color: "text-primary" },
        ];
      case Role.OPERATOR:
        return [
          { icon: AlertTriangle, label: t.incidents.reportIncident, color: "text-destructive" },
          { icon: ClipboardList, label: t.incidents.myIncidents, color: "text-primary" },
        ];
      default:
        return [];
    }
  };

  const roleActions = getRoleActions(user?.role);
  const roleLabel = getRoleLabel(user?.role, language);
  const roleBadgeClass = getRoleColor(user?.role);

  return (
    <div className="space-y-8">
      {/* Header con info de rol */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary/80 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
          <p className="text-muted-foreground">
            Bienvenido, {user?.firstName || user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/incidentes">
            <Button>
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t.incidents.newIncident}
            </Button>
          </Link>
          {(user?.role === Role.ADMIN || user?.role === Role.MANAGER || user?.role === Role.SUPERVISOR) && (
            <Link href="/dashboard/canvas">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                {t.incidents.analytics}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-primary" />
              ) : (
                <AlertCircle className="w-4 h-4 text-accent" />
              )}
              <span className="text-sm text-muted-foreground">
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Acciones según rol */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {t.dashboard.rolePermissions} {t.dashboard.as} {roleLabel}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border/50"
            >
              <div className={`p-2 rounded-lg bg-background ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Incidentes Recientes</h2>
            <Link href="/dashboard/incidentes">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentIncidents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay incidentes registrados</p>
              </div>
            ) : (
              recentIncidents.map((incident, index) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        (incident as any).id_status === statusOpen
                          ? "bg-destructive/10"
                          : (incident as any).id_status === statusInProgress
                          ? "bg-accent/10"
                          : "bg-primary/10"
                      }`}
                    >
                      {(incident as any).id_status === statusOpen ? (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      ) : (incident as any).id_status === statusInProgress ? (
                        <Clock className="w-4 h-4 text-accent" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{incident.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {getTypeName((incident as any).id_type || "")} - {getAreaName((incident as any).id_area || "")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                       {getPriorityName((incident as any).id_priority || incident.priority || "")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                       {new Date((incident as any).opening_date || (incident as any).fechaCreacion || incident.createdAt || Date.now().toString()).toLocaleDateString(language)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Resumen por Área</h2>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(stats.porArea).map(([areaId, count], index) => (
              <motion.div
                key={areaId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {getAreaName(areaId)}
                  </span>
                  <span className="text-muted-foreground">
                    {count} ({stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                    }}
                    transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {stats.tiempoPromedioResolucion > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-primary/10 via-accent/10 to-purple-500/10 border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t.incidents.stats.avgResolutionTime}
              </h3>
              <p className="text-3xl font-bold text-primary">
                {Math.floor(stats.tiempoPromedioResolucion / 60)}h{" "}
                {Math.floor(stats.tiempoPromedioResolucion % 60)}m
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Basado en {closedCount} incidentes cerrados
              </p>
            </div>
            <TrendingUp className="w-16 h-16 text-primary opacity-20" />
          </div>
        </motion.div>
      )}
    </div>
  );
}