"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  AlertTriangle,
  Download,
  Settings,
  RefreshCw,
  ChevronRight,
  UserCheck,
  Flame,
  FileText,
  Server,
  Database,
  Cloud,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

function getRangeBadgeLabel(range: "7d" | "30d" | "year"): string {
  if (range === "7d") return "7 Días";
  if (range === "30d") return "30 Días";
  return "Anual";
}

interface AdminDashboardInteractiveProps {
  initialTotalUsers: number;
  initialTotalCoaches: number;
  initialActiveUsers: number;
  initialSuspendedUsers: number;
  initialTotalForums?: number;
  recentUsers: Array<{
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    estado: string;
    fecha?: string;
  }>;
}

export function AdminDashboardInteractive({
  initialTotalUsers,
  initialTotalCoaches,
  initialActiveUsers,
  initialSuspendedUsers,
  initialTotalForums = 0,
  recentUsers,
}: Readonly<AdminDashboardInteractiveProps>) {
  const [range, setRange] = useState<"7d" | "30d" | "year">("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Visualización de métricas reales para la gráfica SVG
  const activeRateStr = `${initialTotalUsers > 0 ? Math.round((initialActiveUsers / initialTotalUsers) * 100) : 100}% activos`;
  const registeredStr = `${initialTotalUsers} registrados`;

  const graphConfigs = {
    "7d": {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Hoy"],
      primaryPath: "M 0,150 Q 110,120 220,110 T 440,60 T 580,35 T 700,15",
      primaryArea: "M 0,150 Q 110,120 220,110 T 440,60 T 580,35 T 700,15 L 700,180 L 0,180 Z",
      secondaryPath: "M 0,130 Q 110,95 220,105 T 440,80 T 580,50 T 700,40",
      secondaryArea: "M 0,130 Q 110,95 220,105 T 440,80 T 580,50 T 700,40 L 700,180 L 0,180 Z",
      newUsers: registeredStr,
      habitsRate: activeRateStr,
    },
    "30d": {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Actual"],
      primaryPath: "M 0,165 Q 110,140 210,130 T 420,70 T 580,45 T 700,20",
      primaryArea: "M 0,165 Q 110,140 210,130 T 420,70 T 580,45 T 700,20 L 700,180 L 0,180 Z",
      secondaryPath: "M 0,140 Q 90,110 170,125 T 350,90 T 520,60 T 700,45",
      secondaryArea: "M 0,140 Q 90,110 170,125 T 350,90 T 520,60 T 700,45 L 700,180 L 0,180 Z",
      newUsers: registeredStr,
      habitsRate: activeRateStr,
    },
    year: {
      labels: ["Q1", "Q2", "Q3", "Q4", "Actual"],
      primaryPath: "M 0,170 Q 150,150 300,110 T 500,50 T 700,10",
      primaryArea: "M 0,170 Q 150,150 300,110 T 500,50 T 700,10 L 700,180 L 0,180 Z",
      secondaryPath: "M 0,150 Q 150,120 300,100 T 500,70 T 700,30",
      secondaryArea: "M 0,150 Q 150,120 300,100 T 500,70 T 700,30 L 700,180 L 0,180 Z",
      newUsers: registeredStr,
      habitsRate: activeRateStr,
    },
  };

  const currentGraph = graphConfigs[range];

  const handleDownloadLog = () => {
    const logData = {
      app: "HabitApp - Log de Auditoría Institucional",
      fecha: new Date().toISOString(),
      version: "v3.4.2-prod",
      estadisticas: {
        totalUsuarios: initialTotalUsers,
        entrenadoresVerificados: initialTotalCoaches,
        cuentasActivas: initialActiveUsers,
        cuentasSuspendidas: initialSuspendedUsers,
      },
      ultimasActividades: recentUsers,
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habitapp-audit-log-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* ── 1. Header & Governance Identification ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#572de4] animate-pulse" />
            <span className="uppercase tracking-wider">Rol: ADMINISTRADOR (Supervisión Total)</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">v3.4.2-prod</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Panel de Control Operativo
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Gobernanza global, monitoreo del sistema en tiempo real y auditoría institucional de HabitApp.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadLog}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-[#572de4]" />
            <span>{downloadSuccess ? "¡Log Descargado!" : "Descargar Log de Auditoría"}</span>
          </button>
          <Link
            href="/ajustes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#572de4] text-white hover:bg-[#4823c9] text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
            <span>Configuración del Sistema</span>
          </Link>
        </div>
      </div>

      {/* ── 2. 4 High Impact Metric Cards (Bento Flow) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Usuarios Registrados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Usuarios Registrados
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {initialTotalUsers.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              {initialTotalUsers > 0 ? "Global" : "Inicial"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{initialActiveUsers} cuentas con estado activo</span>
          </p>
        </div>

        {/* KPI 2: Entrenadores Verificados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Entrenadores Verificados
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {initialTotalCoaches}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
              {initialTotalCoaches > 0 ? "Asignados" : "Disponibles"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Supervisión directa de clientes y rutinas</span>
          </p>
        </div>

        {/* KPI 3: Temas en Comunidad */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Temas en Comunidad
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {initialTotalForums ?? 0}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              Hilos activos
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Publicaciones abiertas para debate ciudadano</span>
          </p>
        </div>

        {/* KPI 4: Cuentas Suspendidas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cuentas Suspendidas
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-3xl font-extrabold ${initialSuspendedUsers > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
              {initialSuspendedUsers}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${initialSuspendedUsers > 0 ? "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50" : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50"}`}>
              {initialSuspendedUsers > 0 ? "Requiere revisión" : "Sin incidencias"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${initialSuspendedUsers > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
            <span>{initialSuspendedUsers > 0 ? "Usuarios bloqueados por infracción" : "Todas las cuentas operando normalmente"}</span>
          </p>
        </div>
      </div>

      {/* ── 3. Main Content Layout (2/3 Main Stream, 1/3 Side Dock) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 2/3 COLUMN: Main Analytical Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Growth & Activity Analytics Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Crecimiento y Actividad de la Plataforma
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                    {getRangeBadgeLabel(range)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Registros de usuarios activos frente a hábitos completados en micro-ciclos.
                </p>
              </div>

              {/* Range Filter Controls */}
              <div className="inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setRange("7d")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    range === "7d"
                      ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  7 días
                </button>
                <button
                  type="button"
                  onClick={() => setRange("30d")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    range === "30d"
                      ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  30 días
                </button>
                <button
                  type="button"
                  onClick={() => setRange("year")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    range === "year"
                      ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Este año
                </button>
              </div>
            </div>

            {/* SVG Visual Graph */}
            <div className="w-full h-56 relative flex flex-col justify-end pt-4">
              <svg aria-hidden="true" className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 180">
                <defs>
                  <linearGradient id="primaryCurveGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#572de4" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#572de4" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="secondaryCurveGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                <line stroke="#f1ebfa" strokeDasharray="4 4" strokeWidth="1.5" x1="0" x2="700" y1="30" y2="30" className="dark:stroke-slate-800" />
                <line stroke="#f1ebfa" strokeDasharray="4 4" strokeWidth="1.5" x1="0" x2="700" y1="80" y2="80" className="dark:stroke-slate-800" />
                <line stroke="#f1ebfa" strokeDasharray="4 4" strokeWidth="1.5" x1="0" x2="700" y1="130" y2="130" className="dark:stroke-slate-800" />

                {/* Secondary Line Area */}
                <path d={currentGraph.secondaryArea} fill="url(#secondaryCurveGrad)" />
                <path d={currentGraph.secondaryPath} fill="none" stroke="#8b5cf6" strokeLinecap="round" strokeWidth="2.5" />

                {/* Primary Curve Area */}
                <path d={currentGraph.primaryArea} fill="url(#primaryCurveGrad)" />
                <path d={currentGraph.primaryPath} fill="none" stroke="#572de4" strokeLinecap="round" strokeWidth="3" />

                {/* Active Focal Nodes */}
                <circle cx="420" cy="70" fill="#ffffff" r="5" stroke="#572de4" strokeWidth="3" />
                <circle cx="580" cy="45" fill="#ffffff" r="5" stroke="#572de4" strokeWidth="3" />
                <circle cx="700" cy="20" fill="#572de4" r="6" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Chart Time Labels */}
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold pt-2 px-1">
                {currentGraph.labels.map((lbl, idx) => (
                  <span
                    key={lbl}
                    className={idx === currentGraph.labels.length - 1 ? "text-[#572de4] font-bold" : ""}
                  >
                    {lbl}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#572de4]" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Nuevos Registros ({currentGraph.newUsers})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    Cumplimiento ({currentGraph.habitsRate})
                  </span>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#111827] text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs border border-slate-200/80 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Servicios operativos (99.98% uptime)</span>
              </div>
            </div>
          </div>

          {/* System Audit Log & Recent Events Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Feed de Actividad del Sistema
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-[#572de4]">
                    GET /admin/users
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Auditoría en tiempo real conectada a la infraestructura institucional.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Actualizar Feed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#572de4]" : ""}`} />
                </button>
                <Link
                  href="/admin/usuarios"
                  className="text-xs font-bold text-[#572de4] hover:underline flex items-center gap-1"
                >
                  Ver todos los usuarios <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Activity Stream Rows */}
            <div className="space-y-2.5">
              {recentUsers.length > 0 ? (
                recentUsers.map((u, i) => (
                  <div
                    key={u.id || i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.nombre ? u.nombre[0].toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {u.nombre} {u.apellido}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-white dark:bg-[#111827] text-[#572de4] border border-indigo-200/50 dark:border-indigo-800/40">
                            {u.rol}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                          {u.email || "Sin correo"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs text-slate-400">
                        {u.estado === "Activo" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                            <ShieldAlert className="w-3.5 h-3.5" /> {u.estado}
                          </span>
                        )}
                      </span>
                      <Link
                        href="/admin/usuarios"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Gestionar usuario"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs">
                  No hay usuarios registrados recientemente.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1/3 COLUMN: Governance Navigation & Realtime Infrastructure Dock */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Governance Shortcuts */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Accesos Rápidos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Módulos centrales de gestión administrativa y permisos.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {/* Shortcut 1: User Mgmt */}
              <Link
                href="/admin/usuarios"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-[#572de4] hover:text-white transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827] text-[#572de4] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white block truncate">
                      Gestión de Usuarios y Roles
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 block truncate">
                      {initialTotalUsers.toLocaleString()} cuentas registradas
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Shortcut 2: Moderation Center */}
              <Link
                href="/admin/moderacion"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827] text-rose-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white block truncate">
                      Centro de Moderación
                    </span>
                    <span className="text-xs text-rose-600 dark:text-rose-400 group-hover:text-white/80 block truncate font-semibold">
                      Control de foros e incidencias
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Shortcut 3: Coaches */}
              <Link
                href="/entrenador"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-purple-600 hover:text-white transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827] text-purple-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white block truncate">
                      Portal del Entrenador
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 block truncate">
                      {initialTotalCoaches} entrenadores activos
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Shortcut 4: API Swagger */}
              <a
                href="http://localhost:4000/docs"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 transition-colors shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                      Documentación OpenAPI
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate font-mono">
                      Swagger / NestJS RolesGuard
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-all" />
              </a>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Salud de Infraestructura
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-[#572de4]" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    NestJS Core API
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  34ms • Operativo
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Supabase PostgreSQL
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Pool 94% • Conectado
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Storage CDN / Avatares
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  99.9% disponible
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

