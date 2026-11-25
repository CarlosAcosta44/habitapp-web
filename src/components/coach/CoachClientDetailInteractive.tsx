"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Award, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  PlusCircle, 
  X,
  Eye,
  Check,
  Brain,
  Heart
} from "lucide-react";
import { 
  assignRoutineToClientAction,
  sendCoachRecommendationAction 
} from "@/actions/coach.actions";
import { CoachRoutine, ClientProgress } from "@/services/coach.service";

interface HabitSummaryItem {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  meta?: string;
  completadoHoy?: boolean;
  progreso?: number;
}

interface CoachClientDetailInteractiveProps {
  readonly clientId: string;
  readonly clientData: ClientProgress;
  readonly availableRoutines: CoachRoutine[];
  readonly initialRecommendations?: Array<{ id: string; text: string; date: string; status: string }>;
}

function getHeatmapDayStatus(level: number): string {
  if (level === 3) return "100% completado";
  if (level > 0) return "Parcial";
  return "Sin registro";
}

function computeDayCompletionLevel(dayRecord: unknown): number {
  if (!Array.isArray(dayRecord) || dayRecord.length === 0) return 0;
  const completedCount = dayRecord.filter((r: any) => r.completado).length;
  if (completedCount >= 3) return 3;
  if (completedCount >= 2) return 2;
  return completedCount >= 1 ? 1 : 0;
}

function getHeatmapSquareColor(level: number): string {
  if (level === 3) return "bg-[#572de4]";
  if (level === 2) return "bg-[#704efd]/60";
  if (level === 1) return "bg-[#704efd]/20";
  return "bg-slate-100 dark:bg-slate-800";
}

export function CoachClientDetailInteractive({
  clientId,
  clientData,
  availableRoutines,
  initialRecommendations = [],
}: CoachClientDetailInteractiveProps) {
  const [habitFilter, setHabitFilter] = useState<"todos" | "asignados" | "personales">("todos");
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentRecommendations, setSentRecommendations] = useState<Array<{ id: string; text: string; date: string; status: string }>>(
    initialRecommendations
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Assign modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState(availableRoutines[0]?.id || "");
  const [isAssigning, setIsAssigning] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const displayName = clientData.nombre 
    ? `${clientData.nombre} ${clientData.apellido || ''}`.trim() 
    : "Alumno HabitApp";
  const displayEmail = clientData.email || clientData.correo || "Sin correo registrado";
  const points = clientData.puntos_totales || clientData.puntostotales || 0;
  const streak = clientData.racha_actual || 0;
  const maxStreak = clientData.racha_maxima || streak || 0;
  const adherence = clientData.cumplimiento_global ?? 0;
  const level = Math.max(1, Math.floor(points / 250) + 1);

  // Initials for avatar
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Habits list - 100% real records, zero mock fallback
  const allHabits: HabitSummaryItem[] = useMemo(() => {
    if (clientData.activeHabits && clientData.activeHabits.length > 0) {
      return clientData.activeHabits;
    }
    return [];
  }, [clientData.activeHabits]);

  const filteredHabits = useMemo(() => {
    if (habitFilter === "asignados") {
      return allHabits.filter((h) => (h.tipo || "").toLowerCase().includes("asignado"));
    }
    if (habitFilter === "personales") {
      return allHabits.filter((h) => !(h.tipo || "").toLowerCase().includes("asignado"));
    }
    return allHabits;
  }, [allHabits, habitFilter]);

  // Generate 70-day heatmap squares (10 weeks x 7 days) strictly from real records
  const heatmapWeeks = useMemo(() => {
    const weeks: Array<Array<{ dateStr: string; level: number; dayName: string }>> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = clientData.recordsByDate || {};

    // 10 weeks ending this week Sunday
    // Total 70 days
    for (let w = 9; w >= 0; w--) {
      const daysInWeek: Array<{ dateStr: string; level: number; dayName: string }> = [];
      for (let d = 0; d < 7; d++) {
        const offset = w * 7 + (6 - d);
        const dayDate = new Date(today.getTime() - offset * 24 * 60 * 60 * 1000);
        const dateKey = dayDate.toISOString().split("T")[0];
        const dayRecord = records[dateKey];
        const completionLevel = computeDayCompletionLevel(dayRecord);

        const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        daysInWeek.push({
          dateStr: dateKey,
          level: completionLevel,
          dayName: dayNames[d],
        });
      }
      weeks.push(daysInWeek);
    }
    return weeks;
  }, [clientData.recordsByDate]);

  const completedTodayCount = allHabits.filter((h) => h.completadoHoy).length;
  const perfectDaysCount = heatmapWeeks.flat().filter((d) => d.level === 3).length;

  const handleSendAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recommendationMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await sendCoachRecommendationAction(
        clientId,
        recommendationMessage.trim(),
        "Recomendación"
      );
      if (res.success) {
        setSentRecommendations([
          {
            id: `rec-${Date.now()}`,
            text: recommendationMessage.trim(),
            date: "Enviado justo ahora",
            status: "Entregado en app",
          },
          ...sentRecommendations,
        ]);
        setRecommendationMessage("");
        showToast("¡Recomendación enviada exitosamente al alumno!");
      } else {
        alert(res.error || "Error al enviar la recomendación.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedRoutineId) return;
    setIsAssigning(true);
    try {
      const res = await assignRoutineToClientAction(clientId, selectedRoutineId);
      if (res.success) {
        showToast("Rutina asignada exitosamente al cliente.");
        setIsAssignModalOpen(false);
      } else {
        alert(res.error || "Error al asignar la rutina.");
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* ── Toast Feedback ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-200 transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ── Micro Navegación Superior y Acciones Principales ────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Link
            href="/entrenador"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#572de4] transition-colors text-xs sm:text-sm font-semibold w-fit group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Portal de Clientes</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Auditoría Individual
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">/</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-300 font-extrabold uppercase tracking-wider">
              Modo Supervisor
            </span>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#704efd]" />
            <span>Asignar Nueva Rutina</span>
          </button>

          <a
            href="#form-consejo"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#572de4] hover:bg-[#4823c9] text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Recomendación</span>
          </a>
        </div>
      </div>

      {/* ── Ficha Perfil del Alumno & Métricas Vitales Bento ───────────── */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Identidad y Status */}
          <div className="lg:col-span-4 flex items-center gap-5">
            <div className="relative">
              {clientData.fotoperfil ? (
                <img
                  src={clientData.fotoperfil}
                  alt={displayName}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-50 dark:ring-indigo-950/40"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#572de4] to-[#704efd] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/25">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center shadow-md">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111827]" title="Activo en el sistema" />
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  {displayName}
                </h1>
                <span title="Cuenta Verificada">
                  <ShieldCheck className="w-5 h-5 text-[#572de4] shrink-0" />
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {displayEmail}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Pupilo verificado en el sistema</span>
              </div>
            </div>
          </div>

          {/* Métricas Clave de Rendimiento Bento (4 columnas) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Puntos Bienestar */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 flex flex-col justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Puntos Bienestar</span>
                <Sparkles className="w-4 h-4 text-[#572de4]" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                  {points.toLocaleString()}
                </span>
                <span className="text-xs text-[#572de4] font-bold">Total acumulado</span>
              </div>
            </div>

            {/* Nivel */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 flex flex-col justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Nivel</span>
                <Award className="w-4 h-4 text-[#704efd]" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                  Nivel {level}
                </span>
                <span className="text-xs text-slate-500 truncate block">Constancia & Hábitos</span>
              </div>
            </div>

            {/* Racha Viva */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 flex flex-col justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Racha Viva</span>
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block tracking-tight">
                  {streak} {streak === 1 ? "día" : "días"}
                </span>
                <span className="text-xs text-slate-500">{streak > 0 ? "Sin pausas" : "Por iniciar"}</span>
              </div>
            </div>

            {/* Tasa Adherencia */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 flex flex-col justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Adherencia</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {adherence}%
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {adherence >= 80 ? "↑ Óptima" : "Regular"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#572de4] h-full rounded-full transition-all duration-500"
                    style={{ width: `${adherence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Matriz de Constancia (Heatmap de los Últimos 70 Días) ─────── */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Matriz de Constancia & Cumplimiento
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Frecuencia histórica de hábitos diarios durante los últimos 70 días (10 semanas)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#572de4]" />
              <span>Días Perfectos:</span>
              <strong className="text-slate-900 dark:text-white">{perfectDaysCount}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Récord: <strong className="text-slate-900 dark:text-white">{maxStreak} días</strong>
            </span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px] flex flex-col gap-2">
            {/* Headers Semanas */}
            <div className="flex gap-2 text-xs text-slate-400 font-medium pl-10">
              <span className="flex-1">Hace 10 semanas</span>
              <span className="flex-1">Hace 6 semanas</span>
              <span className="flex-1">Hace 2 semanas</span>
              <span className="flex-1 text-[#572de4] font-bold text-right pr-2">Esta semana</span>
            </div>

            <div className="flex gap-3">
              {/* Day Labels */}
              <div className="flex flex-col justify-between text-[11px] text-slate-400 w-7 py-0.5 font-medium shrink-0">
                <span>Lun</span>
                <span>Mié</span>
                <span>Vie</span>
                <span>Dom</span>
              </div>

              {/* Grid: 10 columns (weeks) x 7 rows (days) */}
              <div className="grid grid-flow-col grid-rows-7 gap-2 flex-1">
                {heatmapWeeks.map((week, wIdx) =>
                  week.map((day, dIdx) => {
                    const colorClass = getHeatmapSquareColor(day.level);

                    return (
                      <div
                        key={`${wIdx}-${dIdx}`}
                        className={`w-full aspect-square rounded-md ${colorClass} transition-all hover:scale-110 cursor-pointer`}
                        title={`${day.dateStr} (${day.dayName}): ${getHeatmapDayStatus(day.level)}`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 text-xs text-slate-400">
              <span>Menos activo</span>
              <div className="flex items-center gap-1.5 mx-1">
                <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-slate-800" />
                <span className="w-3 h-3 rounded-md bg-[#704efd]/20" />
                <span className="w-3 h-3 rounded-md bg-[#704efd]/60" />
                <span className="w-3 h-3 rounded-md bg-[#572de4]" />
              </div>
              <span>100% Completado</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dos Columnas: Monitor de Hábitos + Panel de Interacción ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Monitor de Hábitos Activos (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Monitor de Hábitos Activos
                  </h2>
                  <span title="Vista de auditoría en tiempo real">
                    <Eye className="w-4 h-4 text-slate-400" />
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supervisión en tiempo real del plan diario asignado y personal
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold self-start sm:self-auto">
                Hoy · {completedTodayCount} de {allHabits.length} completados
              </span>
            </div>

            {/* Pestañas de Filtro */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-5 w-fit">
              <button
                onClick={() => setHabitFilter("todos")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  habitFilter === "todos"
                    ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Todos ({allHabits.length})
              </button>
              <button
                onClick={() => setHabitFilter("asignados")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  habitFilter === "asignados"
                    ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Asignados por Coach
              </button>
              <button
                onClick={() => setHabitFilter("personales")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  habitFilter === "personales"
                    ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Personales
              </button>
            </div>

            {/* Lista de Hábitos */}
            <div className="space-y-3">
              {filteredHabits.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {allHabits.length === 0
                      ? "Este pupilo aún no tiene hábitos asignados o activos."
                      : "No hay hábitos en esta categoría."}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {allHabits.length === 0
                      ? "Utiliza el botón \"Asignar Nueva Rutina\" para iniciar su plan diario de bienestar."
                      : "Prueba seleccionando otra pestaña de filtro arriba."}
                  </p>
                </div>
              ) : (
                filteredHabits.map((habit) => {
                  const isAssigned = (habit.tipo || "").toLowerCase().includes("asignado");

                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isAssigned 
                            ? "bg-indigo-100 dark:bg-indigo-950/60 text-[#572de4]" 
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}>
                          {isAssigned ? <Brain className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {habit.nombre}
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isAssigned
                                ? "bg-indigo-100 dark:bg-indigo-950/40 text-[#572de4]"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}>
                              {isAssigned ? "Asignado" : "Personal"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span>{habit.meta || habit.descripcion || "Plan diario"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {habit.completadoHoy ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#572de4] hidden sm:inline">Completado</span>
                            <div className="w-9 h-9 rounded-2xl bg-[#572de4] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                              <Check className="w-5 h-5" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Pendiente</span>
                            <div className="w-9 h-9 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Clock className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Interacción y Consejos (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Redacción de Consejo Directo */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm" id="form-consejo">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#572de4]" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Enviar Recomendación
                </h2>
              </div>
              <span className="text-xs font-bold text-[#572de4] bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">
                Notificación In-App
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              El consejo aparecerá destacado en el panel de {clientData.nombre || 'tu pupilo'} con tu sello de coach certificado.
            </p>

            <form
              onSubmit={(e) => {
                void handleSendAdvice(e);
              }}
              className="flex flex-col gap-3"
            >
              <textarea
                value={recommendationMessage}
                onChange={(e) => setRecommendationMessage(e.target.value)}
                placeholder="Escribe un consejo o ajuste de rutina..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4] resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 font-medium">Llega de inmediato</span>
                <button
                  type="submit"
                  disabled={isSending || !recommendationMessage.trim()}
                  className="px-6 py-2.5 bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span>{isSending ? "Enviando..." : "Enviar Notificación"}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Historial de Consejos */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Historial de Consejos
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {sentRecommendations.length} registrados
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {sentRecommendations.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">
                    No se han enviado recomendaciones a este alumno aún. Escribe un consejo arriba para comenzar.
                  </p>
                </div>
              ) : (
                sentRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#572de4]" />
                        <span>Coach (Tú)</span>
                      </span>
                      <span className="text-[#572de4] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      &quot;{rec.text}&quot;
                    </p>
                    <span className="text-[11px] text-slate-400">{rec.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Asignar Rutina ────────────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-[#572de4] flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Asignar Rutina a Pupilo</h3>
                  <span className="text-xs text-slate-500 font-medium">Para: {displayName}</span>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Seleccionar Rutina Plantilla
              </span>

              {availableRoutines.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center">
                  No tienes rutinas creadas aún. Crea una rutina en el panel principal primero.
                </p>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {availableRoutines.map((r) => (
                    <label
                      key={r.id}
                      htmlFor={`routine-select-detail-${r.id}`}
                      aria-label={r.name}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedRoutineId === r.id
                          ? "border-[#572de4] bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          id={`routine-select-detail-${r.id}`}
                          type="radio"
                          name="routineSelectDetail"
                          value={r.id}
                          checked={selectedRoutineId === r.id}
                          onChange={(e) => setSelectedRoutineId(e.target.value)}
                          className="accent-[#572de4] w-4 h-4"
                        />
                        <span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">{r.name}</span>
                          <span className="text-xs text-slate-400 block line-clamp-1">{r.description || "Sin descripción"}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isAssigning || !selectedRoutineId}
                onClick={() => {
                  void handleConfirmAssign();
                }}
                className="px-6 py-2.5 rounded-full bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isAssigning ? "Asignando..." : "Asignar Rutina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
