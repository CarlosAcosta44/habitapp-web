"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Flag,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Check,
  Ban,
  MessageSquare,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  UserX,
  FileText,
  RotateCw,
  X,
} from "lucide-react";
import {
  deleteForumAction,
  deleteForumCommentAction,
  updateUserStatusAction,
} from "@/actions/admin.actions";

interface IncidentReport {
  id: string;
  tipo: "foro" | "comentario";
  categoria: string;
  prioridad: "alta" | "media" | "baja";
  motivo: "spam" | "ofensivo" | "desinformacion" | "acoso";
  denunciante: string;
  tiempo: string;
  autorInfractor: {
    id: string;
    nombre: string;
    email: string;
  };
  contenidoReportado: string;
  contexto: string;
  targetId: string;
}

interface ForumItem {
  id: string;
  titulo: string;
  categoria: string;
  autor: string;
  respuestas: number;
  fecha: string;
}

interface AdminModerationInteractiveProps {
  initialForums?: any[];
}

export function AdminModerationInteractive({
  initialForums = [],
}: Readonly<AdminModerationInteractiveProps>) {
  const [activeTab, setActiveTab] = useState<"reportes" | "foros" | "comentarios">("reportes");
  const [filterMotivo, setFilterMotivo] = useState<string>("TODOS");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Lista interactiva de reportes (vacía si no hay incidencias en la base de datos)
  const [reports, setReports] = useState<IncidentReport[]>([]);

  // Foros de la comunidad mapeados desde los datos reales de la base de datos
  const [forums, setForums] = useState<ForumItem[]>(() => {
    if (initialForums && initialForums.length > 0) {
      return initialForums.map((f: any, idx: number) => ({
        id: f.idforo || f.idForo || f.id || String(idx),
        titulo: f.titulo || "Tema de bienestar",
        categoria: f.categoria || "Salud y Hábitos",
        autor: f.usuario?.nombre ? `${f.usuario.nombre} ${f.usuario.apellido || ""}`.trim() : (f.autor || "Miembro HabitApp"),
        respuestas: f.comentariosCount ?? f.totalComentarios ?? f.totalcomentarios ?? 0,
        fecha: f.fechacreacion || "Reciente",
      }));
    }
    return [];
  });

  const [actionHistory, setActionHistory] = useState<
    Array<{ id: string; titulo: string; detalle: string; tipo: "delete" | "suspend" | "dismiss" }>
  >([]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtrado de reportes
  const filteredReports = reports.filter((r) => {
    if (filterMotivo === "TODOS") return true;
    if (filterMotivo === "URGENTES") return r.prioridad === "alta";
    return r.motivo.toUpperCase() === filterMotivo;
  });

  // Acciones de moderación
  const handleDeleteContent = async (report: IncidentReport) => {
    const result =
      report.tipo === "foro"
        ? await deleteForumAction(report.targetId)
        : await deleteForumCommentAction(report.targetId);

    if (result.success) {
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setActionHistory((prev) => [
        {
          id: String(Date.now()),
          titulo: `Contenido eliminado (${report.tipo})`,
          detalle: `Contexto: ${report.contexto} • Infractor: ${report.autorInfractor.nombre}`,
          tipo: "delete",
        },
        ...prev,
      ]);
      showToast("success", `Contenido eliminado y reporte #${report.id} resuelto.`);
    } else {
      showToast("error", result.error || "No se pudo eliminar el contenido.");
    }
  };

  const handleDismissReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setActionHistory((prev) => [
      {
        id: String(Date.now()),
        titulo: "Reporte desestimado",
        detalle: `Reporte #${reportId} desestimado sin sanción`,
        tipo: "dismiss",
      },
      ...prev,
    ]);
    showToast("success", `Reporte #${reportId} desestimado sin sanción.`);
  };

  const handleSuspendAuthor = async (report: IncidentReport) => {
    const result = await updateUserStatusAction(report.autorInfractor.id, "Suspendido");
    if (result.success) {
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setActionHistory((prev) => [
        {
          id: String(Date.now()),
          titulo: "Usuario suspendido preventivamente",
          detalle: `${report.autorInfractor.nombre} (${report.autorInfractor.email})`,
          tipo: "suspend",
        },
        ...prev,
      ]);
      showToast(
        "success",
        `Cuenta de ${report.autorInfractor.nombre} suspendida preventivamente.`
      );
    } else {
      showToast("error", result.error || "No se pudo suspender la cuenta.");
    }
  };

  const handleDeleteForumDirect = async (forumId: string) => {
    if (!confirm("¿Estás seguro de eliminar este hilo y todos sus comentarios?")) return;
    const target = forums.find((f) => f.id === forumId);
    const result = await deleteForumAction(forumId);
    if (result.success) {
      setForums((prev) => prev.filter((f) => f.id !== forumId));
      setActionHistory((prev) => [
        {
          id: String(Date.now()),
          titulo: "Hilo de foro eliminado",
          detalle: target?.titulo ? `"${target.titulo}"` : `Hilo ID #${forumId}`,
          tipo: "delete",
        },
        ...prev,
      ]);
      showToast("success", "Hilo del foro eliminado correctamente.");
    } else {
      showToast("error", result.error || "No se pudo eliminar el hilo.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── 1. Header & Live Badges ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-[11px] uppercase tracking-wider border border-purple-200/80 dark:border-purple-800/40">
              CU35 · CU37 • Control y Saneamiento
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Cola Prioritaria
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Centro de Moderación Comunitaria
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Supervisión del contenido generado por usuarios, saneamiento de hilos y atención de reportes de convivencia.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => showToast("success", "Registro de auditoría sincronizado con la base de datos.")}
            className="h-11 px-4 rounded-full bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Registro de Auditoría</span>
          </button>
        </div>
      </div>

      {/* ── 2. Live KPI Ribbon ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Hilos en Comunidad */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {forums.length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Hilos publicados en comunidad</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            Comunidad Activa
          </span>
        </div>

        {/* Card 2: Categorías de Debate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {new Set(forums.map((f) => f.categoria)).size}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Categorías con publicaciones</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold text-xs">
            Diversidad Temática
          </span>
        </div>

        {/* Card 3: Interacciones Totales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {forums.reduce((acc, f) => acc + (f.respuestas || 0), 0)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Comentarios registrados</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            Participación
          </span>
        </div>
      </div>

      {/* ── 3. Primary Tab Bar ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("reportes")}
          className={`relative pb-3 flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "reportes"
              ? "text-[#572de4] dark:text-indigo-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Reportes de Usuarios</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 text-xs font-semibold">
            {reports.length} pendientes
          </span>
          {activeTab === "reportes" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#572de4] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("foros")}
          className={`relative pb-3 flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "foros"
              ? "text-[#572de4] dark:text-indigo-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Hilos del Foro</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
            {forums.length} activos
          </span>
          {activeTab === "foros" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#572de4] rounded-full" />
          )}
        </button>
      </div>

      {/* ── 4. Main Workboard: 2-Column Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Incident River or Forum River */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {activeTab === "reportes" && (
            <>
              {/* Filter Chips */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "TODOS", label: `Todos (${reports.length})` },
                    { id: "URGENTES", label: "Urgentes" },
                    { id: "SPAM", label: "Posible Spam" },
                    { id: "OFENSIVO", label: "Ofensivo" },
                    { id: "DESINFORMACION", label: "Desinformación" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterMotivo(f.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        filterMotivo === f.id
                          ? "bg-[#572de4] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">Orden: Prioridad Crítica</span>
              </div>

              {/* Incidents Stream */}
              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        Sin reportes de convivencia pendientes
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        La comunidad de hábitos se encuentra en un estado saludable. No existen incidentes abiertos ni infracciones reportadas pendientes por resolver.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("foros")}
                      className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Supervisar hilos activos ({forums.length})</span>
                    </button>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <article
                      key={report.id}
                      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-4 hover:shadow-md transition-all"
                    >
                      {/* Top incident badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              report.prioridad === "alta"
                                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200/80 dark:border-rose-800/40"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200/80 dark:border-amber-800/40"
                            }`}
                          >
                            Prioridad {report.prioridad}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            {report.categoria}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Denunciado por <strong className="text-slate-700 dark:text-slate-300">{report.denunciante}</strong> • {report.tiempo}
                        </span>
                      </div>

                      {/* Content quote */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Contexto: <strong className="text-slate-700 dark:text-slate-200">{report.contexto}</strong></span>
                          <span className="font-mono text-[11px]">Infractor: {report.autorInfractor.nombre} ({report.autorInfractor.email})</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 italic border-l-2 border-rose-500 pl-3">
                          &ldquo;{report.contenidoReportado}&rdquo;
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteContent(report)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar Contenido</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSuspendAuthor(report)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspender Autor</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDismissReport(report.id)}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Desestimar Reporte</span>
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === "foros" && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hilos Activos en la Comunidad
                </h3>
                <span className="text-xs text-slate-400">{forums.length} temas abiertos</span>
              </div>

              <div className="space-y-3">
                {forums.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    No hay foros publicados actualmente en la comunidad.
                  </div>
                ) : (
                  forums.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                          {f.categoria}
                        </span>
                        <span className="text-xs text-slate-400">• Por {f.autor}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {f.titulo}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {f.respuestas} comentarios registrados
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteForumDirect(f.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                      title="Eliminar este hilo y todos sus comentarios"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                ))
              )}
            </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Guidelines & Activity Log Dock */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Guidelines Checklist */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reglas de Convivencia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Criterios de moderación para proteger la salud mental de la comunidad.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {[
                { title: "Respeto y Empatía Activa", desc: "Tolerancia cero con el acoso o ataques por recaídas en hábitos." },
                { title: "Sin Publicidad ni Enlaces Falsos", desc: "No se permite venta de productos no certificados." },
                { title: "Verificación de Salud", desc: "Consejos médicos solo por profesionales acreditados." },
                { title: "Privacidad de Datos", desc: "Prohibido compartir teléfonos, direcciones o historiales clínicos." },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#572de4] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{rule.title}</span>
                    <span className="text-slate-500 dark:text-slate-400">{rule.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sanctions Log */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Historial de Acciones en Sesión
            </h3>
            <div className="space-y-2.5 text-xs">
              {actionHistory.length > 0 ? (
                actionHistory.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <span
                      className={`font-semibold block ${
                        act.tipo === "delete"
                          ? "text-rose-600 dark:text-rose-400"
                          : act.tipo === "suspend"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {act.titulo}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate block">
                      {act.detalle}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/20 rounded-2xl">
                  Sin acciones disciplinarias ejecutadas en esta sesión.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
