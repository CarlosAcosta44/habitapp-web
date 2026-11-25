"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Layers, 
  Activity, 
  Plus, 
  Search, 
  Flame, 
  ArrowRight, 
  MessageSquare, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  X,
  Send,
  Trash2,
  Edit3,
  Copy,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserPlus,
  UserMinus,
  RotateCw
} from "lucide-react";
import { 
  createRoutineAction, 
  updateRoutineAction, 
  deleteRoutineAction, 
  assignRoutineToClientAction,
  sendCoachRecommendationAction,
  linkClientAction,
  unlinkClientAction,
  getAvailableClientsAction
} from "@/actions/coach.actions";
import { CoachClient, CoachRoutine } from "@/services/coach.service";

interface CoachDashboardInteractiveProps {
  readonly initialClients: CoachClient[];
  readonly initialRoutines: CoachRoutine[];
}

export function CoachDashboardInteractive({
  initialClients,
  initialRoutines,
}: CoachDashboardInteractiveProps) {
  const [activeTab, setActiveTab] = useState<"clientes" | "rutinas">("clientes");
  const [clients, setClients] = useState<CoachClient[]>(initialClients);
  const [routines, setRoutines] = useState<CoachRoutine[]>(initialRoutines);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [selectedClientForRecommend, setSelectedClientForRecommend] = useState<CoachClient | null>(null);
  const [recommendationType, setRecommendationType] = useState<"Motivación" | "Ajuste de Meta" | "Feedback">("Motivación");
  const [recommendationText, setRecommendationText] = useState("");
  const [isSubmittingRecommend, setIsSubmittingRecommend] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClientForAssign, setSelectedClientForAssign] = useState<CoachClient | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("");
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<CoachRoutine | null>(null);
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [routineTipo, setRoutineTipo] = useState("Salud Mental");
  const [routineNivel, setRoutineNivel] = useState("Principiante");
  const [routineDuracion, setRoutineDuracion] = useState<number>(21);
  const [routineHabits, setRoutineHabits] = useState<string[]>([]);
  const [newHabitInput, setNewHabitInput] = useState("");
  const [isSubmittingRoutine, setIsSubmittingRoutine] = useState(false);

  // Link client modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isLinkingUser, setIsLinkingUser] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter((c) => {
      const name = (c.client?.full_name || `${c.client?.nombre || ''} ${c.client?.apellido || ''}`).toLowerCase();
      const email = (c.client?.email || c.client?.correo || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [clients, searchQuery]);

  // Derived KPI metrics (100% computed from real data)
  const activeClientsCount = clients.length;
  const createdRoutinesCount = routines.length;
  const avgCompliance = useMemo(() => {
    if (clients.length === 0) return 0;
    const total = clients.reduce((acc, c) => acc + (c.client?.cumplimiento || 0), 0);
    return Math.round(total / clients.length);
  }, [clients]);

  const inStreakCount = useMemo(() => {
    return clients.filter((c) => (c.client?.racha_actual || 0) > 0).length;
  }, [clients]);

  const needsFocusCount = useMemo(() => {
    return clients.filter((c) => (c.client?.racha_actual || 0) === 0).length;
  }, [clients]);

  // Handlers
  const handleOpenLinkModal = async () => {
    setIsLinkModalOpen(true);
    setIsLoadingAvailable(true);
    const res = await getAvailableClientsAction();
    if (res.success && res.data) {
      setAvailableUsers(res.data);
    }
    setIsLoadingAvailable(false);
  };

  const handleLinkClient = async (userToLink: any) => {
    setIsLinkingUser(userToLink.id);
    const res = await linkClientAction(userToLink.id);
    if (res.success) {
      const newClientItem: CoachClient = {
        assigned_at: new Date().toISOString(),
        client: {
          id: userToLink.id,
          idusuario: userToLink.id,
          nombre: userToLink.nombre,
          apellido: userToLink.apellido,
          full_name: userToLink.full_name,
          email: userToLink.email,
          fotoperfil: userToLink.fotoperfil,
          total_points: userToLink.puntostotales || 0,
          nombrerol: userToLink.nombrerol || "Usuario",
          racha_actual: 0,
          cumplimiento: 0,
          completados_hoy: 0,
          total_habitos: 0,
        },
      };
      setClients([newClientItem, ...clients]);
      setAvailableUsers(availableUsers.filter((u) => u.id !== userToLink.id));
      showToast(`¡${userToLink.full_name || userToLink.nombre} vinculado como pupilo!`);
    } else {
      alert(res.error || "No se pudo vincular el alumno.");
    }
    setIsLinkingUser(null);
  };

  const handleUnlinkClient = async (clientId: string, clientName: string) => {
    if (!confirm(`¿Estás seguro de desvincular a ${clientName} de tu supervisión?`)) return;
    const res = await unlinkClientAction(clientId);
    if (res.success) {
      setClients(clients.filter((c) => (c.client?.id || c.client?.idusuario) !== clientId));
      showToast(`Alumno ${clientName} desvinculado.`);
    } else {
      alert(res.error || "Error al desvincular alumno.");
    }
  };

  const handleOpenRecommend = (client: CoachClient) => {
    setSelectedClientForRecommend(client);
    setRecommendationText("");
    setRecommendationType("Motivación");
    setIsRecommendModalOpen(true);
  };

  const handleSendRecommendation = async () => {
    if (!selectedClientForRecommend || !recommendationText.trim()) return;
    const clientId = selectedClientForRecommend.client?.id || selectedClientForRecommend.client?.idusuario;
    if (!clientId) return;

    setIsSubmittingRecommend(true);
    try {
      const formattedMessage = `[${recommendationType}] ${recommendationText.trim()}`;
      const res = await sendCoachRecommendationAction(clientId, formattedMessage, recommendationType);
      if (res.success) {
        showToast(`Recomendación enviada con éxito a ${selectedClientForRecommend.client.full_name || selectedClientForRecommend.client.nombre}`);
        setIsRecommendModalOpen(false);
        setRecommendationText("");
      } else {
        alert(res.error || "No se pudo enviar la recomendación.");
      }
    } finally {
      setIsSubmittingRecommend(false);
    }
  };

  const handleOpenAssign = (client: CoachClient) => {
    setSelectedClientForAssign(client);
    setSelectedRoutineId(routines[0]?.id || "");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedClientForAssign || !selectedRoutineId) return;
    const clientId = selectedClientForAssign.client?.id || selectedClientForAssign.client?.idusuario;
    if (!clientId) return;

    setIsSubmittingAssign(true);
    try {
      const res = await assignRoutineToClientAction(clientId, selectedRoutineId);
      if (res.success) {
        const routineName = routines.find((r) => r.id === selectedRoutineId)?.name || "Rutina";
        showToast(`Rutina "${routineName}" asignada con éxito a ${selectedClientForAssign.client.full_name || selectedClientForAssign.client.nombre}`);
        setIsAssignModalOpen(false);
      } else {
        alert(res.error || "Error al asignar la rutina.");
      }
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleOpenRoutineModal = (routine?: CoachRoutine) => {
    if (routine) {
      setEditingRoutine(routine);
      setRoutineTitle(routine.name || "");
      setRoutineDescription(routine.description || "");
      setRoutineTipo(routine.tipo || "Salud Mental");
      setRoutineNivel(routine.nivel || "Principiante");
      setRoutineDuracion(routine.duracion ?? 21);
      setRoutineHabits(
        (routine.routine_habits || []).map((h) => h.habit_name).filter(Boolean)
      );
    } else {
      setEditingRoutine(null);
      setRoutineTitle("");
      setRoutineDescription("");
      setRoutineTipo("Salud Mental");
      setRoutineNivel("Principiante");
      setRoutineDuracion(21);
      setRoutineHabits([]);
    }
    setNewHabitInput("");
    setIsRoutineModalOpen(true);
  };

  const handleAddHabitToRoutine = () => {
    const trimmed = newHabitInput.trim();
    if (!trimmed) return;
    if (!routineHabits.includes(trimmed)) {
      setRoutineHabits([...routineHabits, trimmed]);
    }
    setNewHabitInput("");
  };

  const handleRemoveHabitFromRoutine = (habitName: string) => {
    setRoutineHabits(routineHabits.filter((h) => h !== habitName));
  };

  const handleSaveRoutine = async () => {
    if (!routineTitle.trim()) return;
    setIsSubmittingRoutine(true);

    const pendingHabit = newHabitInput.trim();
    const finalHabitsList =
      pendingHabit && !routineHabits.includes(pendingHabit)
        ? [...routineHabits, pendingHabit]
        : routineHabits;

    const payload = {
      name: routineTitle.trim(),
      description: routineDescription.trim(),
      tipo: routineTipo,
      nivel: routineNivel,
      duracion: Number(routineDuracion) || 21,
      habits:
        finalHabitsList.length > 0
          ? finalHabitsList.map((h) => ({ habit_name: h }))
          : [{ habit_name: routineTitle.trim() }],
    };

    try {
      if (editingRoutine) {
        const res = await updateRoutineAction(editingRoutine.id, payload);
        if (res.success && res.data) {
          const updated = res.data;
          setRoutines(routines.map((r) => (r.id === editingRoutine.id ? updated : r)));
          showToast(`Plantilla "${routineTitle}" actualizada exitosamente`);
          setIsRoutineModalOpen(false);
        } else {
          alert(res.error || "Error al actualizar la rutina.");
        }
      } else {
        const res = await createRoutineAction(payload);
        if (res.success && res.data) {
          setRoutines([res.data, ...routines]);
          showToast(`¡Plantilla "${routineTitle}" creada exitosamente!`);
          setIsRoutineModalOpen(false);
        } else {
          alert(res.error || "Error al crear la rutina.");
        }
      }
    } finally {
      setIsSubmittingRoutine(false);
    }
  };

  const handleDeleteRoutine = async (routineId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la plantilla de rutina "${name}"?`)) return;
    const res = await deleteRoutineAction(routineId);
    if (res.success) {
      setRoutines(routines.filter((r) => r.id !== routineId));
      showToast(`Rutina "${name}" eliminada.`);
    } else {
      alert(res.error || "Error al eliminar rutina.");
    }
  };

  const handleDuplicateRoutine = async (routine: CoachRoutine) => {
    const res = await createRoutineAction({
      name: `${routine.name} (Copia)`,
      description: routine.description,
      tipo: routine.tipo || "Salud Mental",
      nivel: routine.nivel || "Principiante",
      duracion: routine.duracion ?? 21,
      habits: (routine.routine_habits || []).map((h) => ({ habit_name: h.habit_name })),
    });
    if (res.success && res.data) {
      setRoutines([res.data, ...routines]);
      showToast(`Copia creada de plantilla: "${routine.name}"`);
    } else {
      alert("Error al clonar rutina");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Toast Feedback ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-200 transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ── Editorial Top Header ──────────────────────────────────────── */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Portal Entrenador</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#572de4] font-semibold">Panel de Gestión</span>
          </nav>

          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 px-3.5 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-[#572de4]" />
            <span className="text-xs font-bold text-[#572de4] tracking-wide">Coach Certificado HabitApp</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Portal del Entrenador
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              Monitorea el cumplimiento de tus pupilos, gestiona plantillas y envía recomendaciones personalizadas de salud mental y hábitos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                void handleOpenLinkModal();
              }}
              className="h-11 px-4 rounded-full bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4 text-[#572de4]" />
              <span>Vincular Alumno</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRoutineModal()}
              className="h-11 px-5 rounded-full bg-[#572de4] hover:bg-[#4823c9] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Rutina</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Metric / KPI Highlights Bento ──────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Clientes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Activos
            </span>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight block">
              {activeClientsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-1 uppercase tracking-wider">
              Clientes Asignados Activos
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Capacidad docente</span>
            <span className="text-[#572de4] font-bold">{activeClientsCount} / 30 cupos</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-[#572de4] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.round((activeClientsCount / 30) * 100))}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Rutinas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-[#704efd] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              {createdRoutinesCount} plantillas activas
            </span>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight block">
              {createdRoutinesCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-1 uppercase tracking-wider">
              Plantillas de Rutina Creadas
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Plantilla principal:</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[160px]">
              {routines[0]?.name || "Sin plantillas"}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-[#704efd] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, createdRoutinesCount * 25)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Cumplimiento Real */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Adherencia Real
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {avgCompliance}%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Tasa Global</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-1 uppercase tracking-wider">
              Cumplimiento Promedio Semanal
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>{inStreakCount} en racha positiva</span>
            <span className={needsFocusCount > 0 ? "text-amber-500 font-bold" : "text-slate-400"}>
              {needsFocusCount} requieren foco
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${avgCompliance}%` }}
            />
          </div>
        </div>
      </section>

      {/* ── Segmented Navigation & Live Search Bar ─────────────────────── */}
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Segmented Tab Navigation */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl max-w-fit shadow-inner">
          <button
            onClick={() => setActiveTab("clientes")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "clientes"
                ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mis Clientes</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#572de4] text-white">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rutinas")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "rutinas"
                ? "bg-white dark:bg-[#111827] text-[#572de4] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gestión de Rutinas</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {routines.length}
            </span>
          </button>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="flex items-center gap-3 flex-1 lg:max-w-md justify-end">
          <div className="flex items-center w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#572de4] transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente por nombre o correo..."
              className="bg-transparent border-0 outline-none w-full text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main View: Split Layout (Left Tab Content + Right Library Sticky) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Tab Content (Mis Clientes / Rutinas) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {activeTab === "clientes" ? (
            filteredClients.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] flex items-center justify-center mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {searchQuery ? "No se encontraron clientes" : "No tienes pupilos vinculados aún"}
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto mb-5 leading-relaxed">
                  {searchQuery
                    ? `No hay coincidencias para "${searchQuery}". Intenta con otro término.`
                    : "Solo los usuarios explícitamente vinculados a tu supervisión aparecerán aquí. Vincula tu primer alumno para comenzar a monitorear sus hábitos."}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      void handleOpenLinkModal();
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Vincular Alumno Ahora</span>
                  </button>
                )}
              </div>
            ) : (
              filteredClients.map((clientItem, idx) => {
                const c = clientItem.client;
                const clientId = c?.id || c?.idusuario || `client-${idx}`;
                const displayName = c?.full_name || `${c?.nombre || ''} ${c?.apellido || ''}`.trim() || "Pupilo";
                const displayEmail = c?.email || c?.correo || "sin-correo@habitapp.io";
                const initials = (displayName || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                
                const clientStreak = c?.racha_actual ?? 0;
                const completedToday = c?.completados_hoy ?? 0;
                const totalHabits = c?.total_habitos ?? 0;
                const compliance = c?.cumplimiento ?? 0;
                
                const avatarBg = idx % 2 === 0 ? "bg-indigo-100 text-[#572de4] dark:bg-indigo-950/60 dark:text-indigo-300" : "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300";

                return (
                  <article
                    key={clientId}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                  >
                    {/* Left: Avatar & Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative shrink-0">
                        {c?.fotoperfil || c?.avatar_url ? (
                          <img
                            src={c.fotoperfil || c.avatar_url}
                            alt={displayName}
                            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                        ) : (
                          <div className={`w-13 h-13 rounded-2xl ${avatarBg} flex items-center justify-center font-bold text-base shadow-inner`}>
                            {initials}
                          </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white dark:ring-[#111827] ${clientStreak > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                            {displayName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                            {c?.nombrerol || "Salud & Bienestar"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {displayEmail}
                        </span>

                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                            clientStreak > 0 
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}>
                            <Flame className={`w-3.5 h-3.5 ${clientStreak > 0 ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
                            {clientStreak} {clientStreak === 1 ? "día de racha" : "días de racha"}
                          </span>

                          <span className="text-slate-500 dark:text-slate-400">
                            Hoy: <strong className="text-slate-900 dark:text-white">{completedToday}/{totalHabits}</strong> hábitos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Mini Dial */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{compliance}%</span>
                          <span className="text-[10px] text-slate-400 block font-medium">Adherencia</span>
                        </div>
                      </div>

                      {/* Enviar Recomendación */}
                      <button
                        onClick={() => handleOpenRecommend(clientItem)}
                        className="h-10 px-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-[#572de4] dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Enviar Recomendación"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Recomendar</span>
                      </button>

                      {/* Asignar Rutina */}
                      <button
                        onClick={() => handleOpenAssign(clientItem)}
                        className="h-10 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Asignar Rutina"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Asignar</span>
                      </button>

                      {/* Desvincular Pupilo */}
                      <button
                        type="button"
                        onClick={() => {
                          void handleUnlinkClient(clientId, displayName);
                        }}
                        className="h-10 w-10 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors"
                        title="Desvincular pupilo"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>

                      {/* Link Detalle y Progreso */}
                      <Link
                        href={`/entrenador/clientes/${clientId}`}
                        className="h-10 px-4 rounded-2xl bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
                      >
                        <span>Progreso</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })
            )
          ) : (
            /* Rutinas Full Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Plantillas de Rutina Maestras</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Diseña protocolos de hábitos que puedes clonar y asignar a cualquier cliente con un clic.</p>
                </div>
                <button
                  onClick={() => handleOpenRoutineModal()}
                  className="px-4 py-2 rounded-xl bg-[#572de4] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nueva Rutina
                </button>
              </div>

              {routines.length === 0 ? (
                <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] flex items-center justify-center mb-3">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    Aún no has creado plantillas de rutina
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Crea tu primera plantilla con hábitos modulares para poder asignarla con un clic a cualquiera de tus pupilos vinculados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routines.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-300 text-xs font-bold">
                              {r.tipo || "Bienestar"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                              {r.nivel || "Principiante"} • {r.duracion ?? 21}d
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                void handleDuplicateRoutine(r);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#572de4] rounded-lg transition-colors"
                              title="Clonar plantilla"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRoutineModal(r)}
                              className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                              title="Editar plantilla"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteRoutine(r.id, r.name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                              title="Eliminar plantilla"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{r.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {r.description || "Sin descripción establecida."}
                        </p>
                        {r.routine_habits && r.routine_habits.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {r.routine_habits.map((h, i) => (
                              <span
                                key={`${r.id}-h-${i}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#572de4]" />
                                {h.habit_name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <FileText className="w-3.5 h-3.5" /> {(r.routine_habits || []).length || 1} hábito(s) incluido(s)
                        </span>
                        <span className="text-[#572de4] font-semibold">Listo para asignar</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Routine Library Preview & Coach Tip */}
        <aside className="xl:col-span-4 flex flex-col gap-6 sticky top-24">
          {/* Routine Library Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#572de4]" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">Biblioteca de Rutinas</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {routines.length} Plantillas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Plantillas modulares listas para clonar o asignar a tus clientes de manera personalizada.
            </p>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {routines.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex flex-col gap-1 group border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#572de4] transition-colors truncate max-w-[180px]">
                      {r.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          void handleDuplicateRoutine(r);
                        }}
                        className="p-1 text-slate-400 hover:text-[#572de4] rounded transition-colors"
                        title="Clonar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenRoutineModal(r)}
                        className="p-1 text-slate-400 hover:text-blue-500 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {r.description || "Sin descripción"}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleOpenRoutineModal()}
              className="w-full py-2.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-[#572de4] dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 border border-dashed border-indigo-300 dark:border-indigo-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Nueva Rutina Base</span>
            </button>
          </div>

          {/* Quick Advice / Clinical Note Widget */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white dark:from-indigo-950/30 dark:via-[#111827] dark:to-[#111827] border border-indigo-200/50 dark:border-indigo-900/40 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#572de4]">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Recordatorio del Coach</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Los pupilos con más de 2 días de inactividad incrementan su tasa de abandono en un 42%. Prioriza enviar una recomendación motivacional breve hoy para mantener la racha viva.
            </p>
          </div>
        </aside>
      </div>

      {/* ── MODAL: Vincular Alumno ────────────────────────────────────── */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-[#572de4] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Vincular Nuevo Pupilo</h3>
                  <span className="text-xs text-slate-500 font-medium">Selecciona un usuario del sistema para iniciar supervisión</span>
                </div>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingAvailable ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RotateCw className="w-6 h-6 animate-spin text-[#572de4]" />
                  <span className="text-xs">Cargando usuarios disponibles...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <p className="text-xs text-slate-500 p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  No hay usuarios disponibles sin asignar en este momento.
                </p>
              ) : (
                availableUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#572de4] flex items-center justify-center font-bold text-sm shrink-0">
                        {u.nombre?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate block">
                          {u.full_name || u.nombre}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLinkingUser === u.id}
                      onClick={() => {
                        void handleLinkClient(u);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                    >
                      {isLinkingUser === u.id ? "Vinculando..." : "Vincular"}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Enviar Recomendación Personalizada ─────────────────── */}
      {isRecommendModalOpen && selectedClientForRecommend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-[#572de4] flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Enviar Recomendación</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Para: {selectedClientForRecommend.client?.full_name || selectedClientForRecommend.client?.nombre}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsRecommendModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Tipo de Intervención
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["Motivación", "Ajuste de Meta", "Feedback"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setRecommendationType(tipo)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      recommendationType === tipo
                        ? "bg-[#572de4] text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="recommend-msg-input" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Mensaje o Consejo de Bienestar
              </label>
              <textarea
                id="recommend-msg-input"
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                placeholder="Escribe aquí tu recomendación personalizada... Ej: 'He notado que te cuesta completar el hábito nocturno, probemos adelantarlo 30 minutos.'"
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRecommendModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmittingRecommend || !recommendationText.trim()}
                onClick={() => {
                  void handleSendRecommendation();
                }}
                className="px-6 py-2.5 rounded-full bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingRecommend ? "Enviando..." : "Enviar Directo"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Asignar Rutina ────────────────────────────────────── */}
      {isAssignModalOpen && selectedClientForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Asignar Rutina a Pupilo</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Para: {selectedClientForAssign.client?.full_name || selectedClientForAssign.client?.nombre}
                  </span>
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

              {routines.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center">
                  No tienes rutinas creadas aún. Crea una rutina primero.
                </p>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {routines.map((r) => (
                    <label
                      key={r.id}
                      htmlFor={`routine-select-${r.id}`}
                      aria-label={r.name}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedRoutineId === r.id
                          ? "border-[#572de4] bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          id={`routine-select-${r.id}`}
                          type="radio"
                          name="routineSelect"
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

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300">
              Al asignar, la rutina se vinculará activamente en el perfil del alumno permitiéndote monitorear su progreso en tiempo real.
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
                disabled={isSubmittingAssign || !selectedRoutineId}
                onClick={() => {
                  void handleConfirmAssign();
                }}
                className="px-6 py-2.5 rounded-full bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSubmittingAssign ? "Asignando..." : "Asignar Rutina"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Crear / Editar Rutina Base ─────────────────────────── */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-[#572de4] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {editingRoutine ? "Editar Plantilla de Rutina" : "Crear Rutina Base"}
                  </h3>
                  <span className="text-xs text-slate-500">Define el objetivo y los hábitos que se activarán en el alumno</span>
                </div>
              </div>
              <button
                onClick={() => setIsRoutineModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="routine-title-input" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Título / Objetivo de la Rutina
              </label>
              <input
                id="routine-title-input"
                type="text"
                value={routineTitle}
                onChange={(e) => setRoutineTitle(e.target.value)}
                placeholder="Ej: Protocolo de Enfoque Matutino"
                maxLength={200}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label htmlFor="routine-tipo-select" className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Categoría
                </label>
                <select
                  id="routine-tipo-select"
                  value={routineTipo}
                  onChange={(e) => setRoutineTipo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4]"
                >
                  <option value="Salud Mental">Salud Mental</option>
                  <option value="Ejercicio">Ejercicio</option>
                  <option value="Nutrición">Nutrición</option>
                  <option value="Sueño">Sueño</option>
                  <option value="Hidratación">Hidratación</option>
                  <option value="Productividad">Productividad</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="routine-nivel-select" className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Nivel
                </label>
                <select
                  id="routine-nivel-select"
                  value={routineNivel}
                  onChange={(e) => setRoutineNivel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4]"
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="routine-duracion-input" className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Duración (días)
                </label>
                <input
                  id="routine-duracion-input"
                  type="number"
                  min={1}
                  max={365}
                  value={routineDuracion}
                  onChange={(e) => setRoutineDuracion(Number(e.target.value) || 21)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="routine-desc-input" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Descripción del Protocolo
              </label>
              <textarea
                id="routine-desc-input"
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                placeholder="Describe brevemente el impacto en la salud mental o física del pupilo..."
                rows={2}
                maxLength={350}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="routine-habit-input" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Hábitos Diarios Incluidos en la Rutina
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="routine-habit-input"
                  type="text"
                  value={newHabitInput}
                  onChange={(e) => setNewHabitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddHabitToRoutine();
                    }
                  }}
                  placeholder="Ej: Meditación guiada 10 min (máx 45 car.)"
                  maxLength={45}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#572de4]"
                />
                <button
                  type="button"
                  onClick={handleAddHabitToRoutine}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#572de4] dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors shrink-0"
                >
                  + Añadir
                </button>
              </div>

              {routineHabits.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {routineHabits.map((habitName) => (
                    <span
                      key={habitName}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/50"
                    >
                      <span>{habitName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHabitFromRoutine(habitName)}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Si no agregas hábitos específicos, se creará automáticamente un hábito principal con el título de la rutina al asignarla a un pupilo.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRoutineModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
              >
                Descartar
              </button>
              <button
                type="button"
                disabled={isSubmittingRoutine || !routineTitle.trim()}
                onClick={() => {
                  void handleSaveRoutine();
                }}
                className="px-6 py-2.5 rounded-full bg-[#572de4] hover:bg-[#4823c9] text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSubmittingRoutine ? "Guardando..." : "Guardar Plantilla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
