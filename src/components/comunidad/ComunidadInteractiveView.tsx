'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  MessageSquare,
  Users,
  Sparkles,
  BookOpen,
  Award,
  Plus,
  ArrowRight,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Star,
  Flag,
  Edit3,
  Trophy,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import type { Reto } from '@/domain/reto.types';
import type { Articulo } from '@/domain/comunidad.types';
import {
  clonarHabitoAction,
  unirseRetoAction,
  salirRetoAction,
  checkinRetoAction,
  reaccionarAction,
  deleteForoAction,
} from '@/actions/comunidad.actions';
import {
  linkMyTrainerAction,
  unlinkMyTrainerAction,
} from '@/actions/coach.actions';
import { CreateForoModal } from '@/components/modals/CreateForoModal';
import { ShareHabitModal } from '@/components/modals/ShareHabitModal';
import { CreateRetoModal } from '@/components/modals/CreateRetoModal';
import { EditForoModal } from '@/components/modals/EditForoModal';
import { ArticleReaderModal } from '@/components/modals/ArticleReaderModal';
import { RetoCard } from '@/components/comunidad/RetoCard';
import { RetoDetailModal } from '@/components/modals/RetoDetailModal';

interface ComunidadInteractiveViewProps {
  readonly initialForos: any[];
  readonly initialHabitosComunidad: any[];
  readonly initialArticulos: any[];
  readonly initialEspecialistas: any[];
  readonly initialRetos: Reto[];
  readonly userHabitos?: any[];
  readonly userId?: string;
  readonly isAdmin?: boolean;
  readonly totalMiembros?: number;
  readonly initialLinkedTrainerIds?: string[];
}

type TabType = 'todo' | 'foros' | 'habitos' | 'articulos' | 'especialistas' | 'retos';

const VALID_COMMUNITY_TABS = new Set<TabType>(['todo', 'foros', 'habitos', 'articulos', 'especialistas', 'retos']);

function resolveCommunityTab(param: string | null): TabType {
  return param && VALID_COMMUNITY_TABS.has(param as TabType) ? (param as TabType) : 'todo';
}

function formatClonesCount(count?: number | null): string {
  if (!count || count <= 0) return 'Nuevo';
  if (count === 1) return '1 persona hace esto';
  return `${count} hacen esto`;
}

function getSpecialtyTagLabel(especialidad?: string): string {
  if (especialidad === 'Nutrición') return 'Planes alimenticios';
  if (especialidad === 'Crossfit') return 'Resistencia & WOD';
  return 'Técnica & Progresión';
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Reciente';
  const date = new Date(dateStr);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 2) return 'Ahora mismo';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  return `hace ${diffDays} días`;
}

function sanitizeToastMessage(msg: string): string {
  if (msg.includes('invalid input syntax') || msg.includes('JWT') || msg.includes('Token')) {
    return 'Ocurrió un error al procesar la solicitud. Por favor intenta de nuevo.';
  }
  return msg;
}

function checkIsTrainerLinked(esp: Record<string, any>, linkedTrainerIds: string[]): boolean {
  const tId = esp.identrenador || esp.idusuario || esp.id;
  const uId = esp.idusuario || esp.id;
  return Boolean((tId && linkedTrainerIds.includes(tId)) || (uId && linkedTrainerIds.includes(uId)));
}

function filterHabitosComunidad(list: any[], searchQuery: string): any[] {
  if (!searchQuery.trim()) return list;
  const q = searchQuery.toLowerCase();
  return list.filter(
    (h) =>
      h.nombre?.toLowerCase().includes(q) ||
      h.descripcion?.toLowerCase().includes(q) ||
      h.categoria_nombre?.toLowerCase().includes(q)
  );
}

type ForoSortBy = 'recientes' | 'populares' | 'sin_responder';
type RetoFilterTab = 'todos' | 'participando';

function filterAndSortForos(
  initialForos: any[],
  selectedTag: string,
  sortBy: ForoSortBy,
  searchQuery: string
): any[] {
  let list = [...initialForos];

  if (selectedTag !== 'Todos') {
    const cleanTag = selectedTag.replace('#', '').toLowerCase();
    list = list.filter((f) => f.categoria?.toLowerCase().includes(cleanTag));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (f) =>
        f.titulo?.toLowerCase().includes(q) ||
        f.descripcion?.toLowerCase().includes(q) ||
        f.categoria?.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'populares') {
    list.sort((a, b) => (b.likes_count || 0) + (b.comments_count || 0) - ((a.likes_count || 0) + (a.comments_count || 0)));
  } else if (sortBy === 'sin_responder') {
    list = list.filter((f) => (f.comments_count || 0) === 0);
  } else {
    list.sort((a, b) => new Date(b.fechacreacion || 0).getTime() - new Date(a.fechacreacion || 0).getTime());
  }

  return list;
}

function filterArticulos(initialArticulos: any[], searchQuery: string): any[] {
  if (!searchQuery.trim()) return initialArticulos;
  const q = searchQuery.toLowerCase();
  return initialArticulos.filter(
    (a) =>
      a.titulo?.toLowerCase().includes(q) ||
      a.contenido?.toLowerCase().includes(q) ||
      a.categoria?.toLowerCase().includes(q)
  );
}

function filterEspecialistas(initialEspecialistas: any[], selectedEspCategory: string, searchQuery: string): any[] {
  let list = initialEspecialistas;
  if (selectedEspCategory !== 'Todos') {
    const q = selectedEspCategory.toLowerCase();
    list = list.filter((e) => e.especialidad?.toLowerCase().includes(q));
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (e) =>
        e.nombre?.toLowerCase().includes(q) ||
        e.apellido?.toLowerCase().includes(q) ||
        e.especialidad?.toLowerCase().includes(q)
    );
  }
  return list;
}

function filterRetosList(list: Reto[], searchQuery: string): Reto[] {
  if (!searchQuery.trim()) return list;
  const q = searchQuery.toLowerCase();
  return list.filter(
    (r) =>
      r.titulo?.toLowerCase().includes(q) ||
      r.descripcion?.toLowerCase().includes(q)
  );
}

function applyRetoJoinOptimistic(prev: any, targetId: string, userId?: string) {
  if (!prev || (prev.idreto !== targetId && prev.id !== targetId)) return prev;
  return {
    ...prev,
    participantes_count: (prev.participantes_count || 0) + 1,
    usuarios_participando: [...(prev.usuarios_participando || []), userId],
    inscrito: true,
  };
}

function applyRetoLeaveOptimistic(prev: any, targetId: string, userId?: string) {
  if (!prev || (prev.idreto !== targetId && prev.id !== targetId)) return prev;
  return {
    ...prev,
    participantes_count: Math.max(0, (prev.participantes_count || 1) - 1),
    usuarios_participando: (prev.usuarios_participando || []).filter((uId: string) => uId !== userId),
    inscrito: false,
  };
}

function applyRetoCheckinOptimistic(prev: any, targetId: string, res: any) {
  if (!prev || (prev.idreto !== targetId && prev.id !== targetId)) return prev;
  return {
    ...prev,
    progreso: res.progreso ?? Math.min(100, (prev.progreso || 0) + 15),
    dias_progreso: res.dias_progreso ?? ((prev.dias_progreso || 0) + 1),
    completado: res.completed || prev.completado,
  };
}

function getPersonInitials(name: string): string {
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface CommunityForoCardProps {
  readonly foro: any;
  readonly userId?: string;
  readonly isAdmin: boolean;
  readonly openForoMenuId: string | null;
  readonly setOpenForoMenuId: (id: string | null) => void;
  readonly setEditingForo: (foro: any) => void;
  readonly deletingForoId: string | null;
  readonly isPending: boolean;
  readonly handleDeleteForo: (foroId: string, e: React.MouseEvent) => void;
  readonly reactingForoId: string | null;
  readonly handleLikeForo: (foro: any) => void;
}

function CommunityForoCard({
  foro,
  userId,
  isAdmin,
  openForoMenuId,
  setOpenForoMenuId,
  setEditingForo,
  deletingForoId,
  isPending,
  handleDeleteForo,
  reactingForoId,
  handleLikeForo,
}: CommunityForoCardProps) {
  const id = foro.idforo || foro.idForo;
  const authorName = foro.usuarios
    ? `${foro.usuarios.nombre || ''} ${foro.usuarios.apellido || ''}`.trim() || 'Miembro HabitApp'
    : 'Miembro HabitApp';
  const initials = getPersonInitials(authorName);
  const canManage = Boolean(userId && (foro.idusuario === userId || isAdmin));

  return (
    <article
      className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#572de4]/10 dark:bg-indigo-950/80 flex items-center justify-center text-xs font-bold text-[#572de4] dark:text-indigo-300">
            {initials}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {authorName}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[11px] text-slate-400">
                {formatTimeAgo(foro.fechacreacion)}
              </span>
            </div>
            <span className="text-xs font-semibold text-[#572de4] dark:text-indigo-400">
              #{foro.categoria || 'General'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(foro.likes_count || 0) > 10 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 text-[11px] font-semibold">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              Destacado
            </span>
          )}

          {canManage && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenForoMenuId(openForoMenuId === id ? null : id);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Opciones del foro"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {openForoMenuId === id && (
                <div
                  className="absolute right-0 top-9 z-20 w-40 bg-white dark:bg-[#151c2c] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenForoMenuId(null);
                      setEditingForo(foro);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar foro</span>
                  </button>

                  <button
                    type="button"
                    disabled={deletingForoId === id || isPending}
                    onClick={(e) => handleDeleteForo(id, e)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-left disabled:opacity-50 border-t border-slate-100 dark:border-slate-800/60"
                  >
                    {deletingForoId === id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Eliminar foro</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <Link href={`/comunidad/foros/${id}`}>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-[#572de4] dark:hover:text-indigo-300 transition-colors cursor-pointer leading-snug">
            {foro.titulo}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-3">
          {foro.descripcion}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <Link
            href={`/comunidad/foros/${id}`}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-[#572de4] text-xs font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#572de4]" />
            <span>{foro.comments_count || 0} respuestas</span>
          </Link>

          <button
            type="button"
            onClick={() => handleLikeForo(foro)}
            disabled={reactingForoId === id || isPending}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-500 text-xs font-medium transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                foro.liked_by_me ? 'fill-rose-500 text-rose-500' : 'text-rose-500'
              }`}
            />
            <span>{foro.likes_count || 0} apoyos</span>
          </button>
        </div>

        <Link
          href={`/comunidad/foros/${id}`}
          className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#572de4]/10 hover:text-[#572de4] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <span>Participar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

interface CommunitySpecialistDirectoryCardProps {
  readonly esp: any;
  readonly isLinked: boolean;
  readonly isLinking: boolean;
  readonly actionLabel: string;
  readonly onSelect: (esp: any) => void;
  readonly onToggleLink: (esp: any) => void;
}

function CommunitySpecialistDirectoryCard({
  esp,
  isLinked,
  isLinking,
  actionLabel,
  onSelect,
  onToggleLink,
}: CommunitySpecialistDirectoryCardProps) {
  const nombreCompleto = `${esp.nombre || ''} ${esp.apellido || ''}`.trim() || 'Especialista HabitApp';
  const initials = getPersonInitials(nombreCompleto);

  return (
    <article
      className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="relative">
            {esp.fotoperfil ? (
              <img
                src={esp.fotoperfil}
                alt={nombreCompleto}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#572de4] to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 ring-2 ring-white dark:ring-[#111827] rounded-full" title="En línea hoy" />
          </div>

          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/50 px-2 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-current" />
              4.9 <span className="text-slate-400 font-normal">(68)</span>
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">En línea hoy</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {nombreCompleto}
            </h3>
            <ShieldCheck className="w-4 h-4 text-[#572de4] dark:text-indigo-400 shrink-0" />
          </div>
          <p className="text-xs text-[#572de4] dark:text-indigo-400 font-semibold mt-0.5">
            Especialista en {esp.especialidad || 'Hábitos Saludables'}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
            Certificado HabitApp • Acompañamiento online
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-800">
            {getSpecialtyTagLabel(esp.especialidad)}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-800">
            Seguimiento continuo
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Experiencia certificada
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {esp.experiencia ?? 3} años • {isLinked ? 'Vinculado ✓' : 'Disponible'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelect(esp)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
          >
            Ver perfil
          </button>
          <button
            type="button"
            disabled={isLinking}
            onClick={() => onToggleLink(esp)}
            className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm text-center disabled:opacity-50 ${
              isLinked
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-600'
                : 'bg-[#572de4] hover:bg-[#461ebd] text-white'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

interface CommunitySidebarViewProps {
  readonly especialistasFiltrados: any[];
  readonly retosFiltrados: Reto[];
  readonly isTrainerLinked: (esp: any) => boolean;
  readonly linkingTrainerId: string | null;
  readonly setSelectedSpecialist: (esp: any) => void;
  readonly handleToggleTrainerLink: (esp: any) => Promise<void>;
  readonly setActiveTab: (tab: TabType) => void;
  readonly joiningRetoId: string | null;
  readonly userId?: string;
  readonly isPending: boolean;
  readonly setSelectedRetoModal: (reto: Reto) => void;
  readonly handleJoinReto: (reto: Reto) => void;
}

function CommunitySidebarView({
  especialistasFiltrados,
  retosFiltrados,
  isTrainerLinked,
  linkingTrainerId,
  setSelectedSpecialist,
  handleToggleTrainerLink,
  setActiveTab,
  joiningRetoId,
  userId,
  isPending,
  setSelectedRetoModal,
  handleJoinReto,
}: CommunitySidebarViewProps) {
  return (
    <aside className="xl:col-span-4 flex flex-col gap-6">
      {/* ── WIDGET 1: ESPECIALISTAS VERIFICADOS ── */}
      <section className="flex flex-col gap-4 p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#572de4] dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Especialistas Verificados
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Terapeutas colegiados con sesiones online confidenciales y personalizadas.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {especialistasFiltrados.slice(0, 3).map((esp, i) => {
            const id = esp.idusuario || esp.idEntrenador || i;
            const nombreCompleto = `${esp.nombre || ''} ${esp.apellido || ''}`.trim() || 'Especialista HabitApp';
            const initials = getPersonInitials(nombreCompleto);
            const linked = isTrainerLinked(esp);
            const targetId = esp.identrenador || esp.idusuario || esp.id;

            return (
              <div
                key={id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-[#572de4] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {initials}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111827]" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {nombreCompleto}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {esp.especialidad || 'Psicología Clínica & TCC'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          4.9
                        </span>
                        <span className="text-[11px] text-slate-400">(68 reseñas)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {linked ? 'Tu Entrenador' : 'Disponible'}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {esp.experiencia ?? 3} años exp.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialist(esp)}
                    className="py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-center"
                  >
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    disabled={linkingTrainerId === targetId}
                    onClick={() => {
                      void handleToggleTrainerLink(esp);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold shadow-sm transition-all text-center disabled:opacity-50 ${
                      linked
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-[#572de4] text-white hover:bg-[#461ebd]'
                    }`}
                  >
                    {linked ? 'Vinculado ✓' : 'Vincular'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('especialistas')}
          className="text-xs font-bold text-[#572de4] dark:text-indigo-400 text-center hover:underline pt-1"
        >
          Ver todos los especialistas disponibles →
        </button>
      </section>

      {/* ── WIDGET 2: RETOS COMUNITARIOS ACTIVOS ── */}
      <section className="flex flex-col gap-4 p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#572de4] dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Retos Comunitarios Activos
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('retos')}
            className="text-xs font-bold text-[#572de4] dark:text-indigo-400 hover:underline"
          >
            Ver todos →
          </button>
        </div>

        {retosFiltrados.slice(0, 2).map((reto) => {
          const id = reto.idreto || reto.idReto || reto.id || '';
          const isJoiningThis = joiningRetoId === id;
          const puntos = reto.puntos_recompensa ?? 0;
          const isEnrolled = Boolean(
            (userId && reto.usuarios_participando?.includes(userId)) ||
            reto.inscrito === true
          );
          const participantesCount = reto.participantes_count ?? (reto.usuarios_participando?.length ?? 0);

          return (
            <div
              key={id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-3.5 hover:border-[#572de4]/40 transition-all"
            >
              <button
                type="button"
                onClick={() => setSelectedRetoModal(reto)}
                className="text-left w-full flex flex-col gap-3.5 cursor-pointer"
              >
                <div className="flex items-start justify-between w-full">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#572de4]/10 dark:bg-indigo-950 text-[#572de4] dark:text-indigo-300 text-[11px] font-bold">
                      +{puntos} pts de recompensa
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                      {reto.titulo}
                    </h4>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-[#572de4]/10 dark:bg-indigo-950 text-[#572de4] dark:text-indigo-300 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {reto.descripcion}
                </p>

                <div className="flex items-center justify-between w-full text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {participantesCount} participante{participantesCount === 1 ? '' : 's'}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {reto.fechafin ? `Hasta: ${reto.fechafin}` : 'Activo'}
                  </span>
                </div>
              </button>

              {isEnrolled ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>En curso</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinReto(reto);
                  }}
                  disabled={isJoiningThis || isPending}
                  className="w-full py-2.5 rounded-xl bg-[#572de4] hover:bg-[#461ebd] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isJoiningThis ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Flag className="w-3.5 h-3.5" />
                  )}
                  <span>Unirme al Reto</span>
                </button>
              )}
            </div>
          );
        })}
      </section>
    </aside>
  );
}

interface CommunityRetosDirectoryViewProps {
  readonly retosVigentesCount: number;
  readonly setIsCreateRetoOpen: (open: boolean) => void;
  readonly retoFilterTab: RetoFilterTab;
  readonly setRetoFilterTab: (tab: RetoFilterTab) => void;
  readonly initialRetosCount: number;
  readonly misRetos: Reto[];
  readonly retosFiltrados: Reto[];
  readonly userId?: string;
  readonly joiningRetoId: string | null;
  readonly leavingRetoId: string | null;
  readonly checkingInRetoId: string | null;
  readonly isPending: boolean;
  readonly setSelectedRetoModal: (reto: Reto) => void;
  readonly handleJoinReto: (reto: Reto) => void;
  readonly handleLeaveReto: (reto: Reto) => void;
  readonly handleCheckinReto: (reto: Reto) => void;
}

function CommunityRetosDirectoryView({
  retosVigentesCount,
  setIsCreateRetoOpen,
  retoFilterTab,
  setRetoFilterTab,
  initialRetosCount,
  misRetos,
  retosFiltrados,
  userId,
  joiningRetoId,
  leavingRetoId,
  checkingInRetoId,
  isPending,
  setSelectedRetoModal,
  handleJoinReto,
  handleLeaveReto,
  handleCheckinReto,
}: CommunityRetosDirectoryViewProps) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Retos y Desafíos Comunitarios
          </h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm text-xs font-semibold">
            <Award className="w-4 h-4 text-[#572de4]" />
            <span>{retosVigentesCount} {retosVigentesCount === 1 ? 'reto activo' : 'retos activos'}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateRetoOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#572de4] hover:bg-[#461ebd] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear reto</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setRetoFilterTab('todos')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
            retoFilterTab === 'todos'
              ? 'text-[#572de4] dark:text-indigo-400 border-b-2 border-[#572de4]'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Todos los desafíos ({initialRetosCount})
        </button>
        <button
          type="button"
          onClick={() => setRetoFilterTab('participando')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 ${
            retoFilterTab === 'participando'
              ? 'text-[#572de4] dark:text-indigo-400 border-b-2 border-[#572de4]'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>En los que participas ({misRetos.length})</span>
        </button>
      </div>

      {retoFilterTab === 'todos' && misRetos.length > 0 && (
        <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#572de4] dark:text-indigo-300 uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Tus Retos en Curso ({misRetos.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setRetoFilterTab('participando')}
              className="text-xs font-bold text-[#572de4] dark:text-indigo-400 hover:underline"
            >
              Filtrar solo mis retos →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {misRetos.map((mr) => (
              <button
                type="button"
                key={mr.idreto}
                onClick={() => setSelectedRetoModal(mr)}
                className="text-left w-full p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-indigo-100/80 dark:border-indigo-900/50 shadow-sm cursor-pointer hover:border-[#572de4] transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {mr.titulo}
                  </span>
                  <span className="text-sm">{mr.insignia_recompensa || '🏆'}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {mr.descripcion}
                </span>
                <div className="flex items-center justify-between w-full text-[11px] font-bold text-[#572de4] dark:text-indigo-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>+{mr.puntos_recompensa || 50} pts</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Participando ✓</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-3xl p-7 bg-gradient-to-r from-[#572de4] via-indigo-600 to-violet-700 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 flex items-start gap-4 max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-white/80 font-bold uppercase tracking-widest">
              Comunidad &amp; Superación
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              ¿Listo para elevar tus hábitos al siguiente nivel?
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Únete a los desafíos colectivos, compite saludablemente, acumula puntos de recompensa y desbloquea insignias exclusivas.
            </p>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-48 h-48 rounded-full bg-violet-400/20 blur-xl pointer-events-none" />
      </section>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {retoFilterTab === 'participando' ? 'Retos en los que estás participando' : 'Explorar todos los retos'}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {retosFiltrados.length} {retosFiltrados.length === 1 ? 'reto disponible' : 'retos disponibles'}
        </span>
      </div>

      {retosFiltrados.length === 0 ? (
        <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No se encontraron retos disponibles
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {retosFiltrados.map((reto) => {
            const id = reto.idreto || reto.idReto || reto.id || '';
            return (
              <RetoCard
                key={id}
                reto={reto}
                userId={userId}
                isJoining={joiningRetoId === id}
                isLeaving={leavingRetoId === id}
                isCheckingIn={checkingInRetoId === id}
                isPending={isPending}
                onSelect={(r) => setSelectedRetoModal(r)}
                onJoin={handleJoinReto}
                onLeave={handleLeaveReto}
                onCheckIn={handleCheckinReto}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SpecialistProfileModalViewProps {
  readonly selectedSpecialist: Record<string, any> | null;
  readonly onClose: () => void;
  readonly isLinked: boolean;
  readonly isLinking: boolean;
  readonly onToggleLink: () => void;
}

function SpecialistProfileModalView({
  selectedSpecialist,
  onClose,
  isLinked,
  isLinking,
  onToggleLink,
}: SpecialistProfileModalViewProps) {
  if (!selectedSpecialist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar modal de especialista"
        onClick={onClose}
        className="fixed inset-0 w-full h-full bg-slate-950/60 backdrop-blur-sm cursor-default"
      />
      <dialog
        open
        aria-modal="true"
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 m-0"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#572de4] uppercase tracking-wider">
            Perfil de Especialista
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-[#572de4] text-white flex items-center justify-center font-bold text-lg">
            {selectedSpecialist.nombre?.[0] || 'E'}
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              {selectedSpecialist.nombre} {selectedSpecialist.apellido || ''}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedSpecialist.especialidad || 'Especialista en Hábitos & Salud Emocional'}
            </span>
            <span className="text-xs text-emerald-600 font-bold mt-1">● Disponible para sesiones online</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Entrenador certificado ({selectedSpecialist.experiencia ?? 3} años de experiencia) dedicado al acompañamiento en {selectedSpecialist.especialidad || 'hábitos saludables'}, asignación de rutinas personalizadas y seguimiento continuo de tus metas diarias.
        </p>

        <button
          type="button"
          disabled={isLinking}
          onClick={onToggleLink}
          className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md transition-all disabled:opacity-50 ${
            isLinked
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-[#572de4] hover:bg-[#461ebd] text-white'
          }`}
        >
          {isLinked
            ? 'Desvincular de mi supervisión'
            : 'Vincular como mi Entrenador'}
        </button>
      </dialog>
    </div>
  );
}

interface CommunityHabitosSectionViewProps {
  readonly activeTab: TabType;
  readonly setActiveTab: (tab: TabType) => void;
  readonly setIsShareHabitOpen: (open: boolean) => void;
  readonly habitosFiltrados: any[];
  readonly cloningId: string | null;
  readonly isPending: boolean;
  readonly handleCloneHabit: (habito: any) => void;
}

function CommunityHabitosSectionView({
  activeTab,
  setActiveTab,
  setIsShareHabitOpen,
  habitosFiltrados,
  cloningId,
  isPending,
  handleCloneHabit,
}: CommunityHabitosSectionViewProps) {
  const limit = activeTab === 'habitos' ? 30 : 3;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#572de4] dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Hábitos de la comunidad
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspirados por otros miembros para cuidar la salud emocional día a día.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsShareHabitOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#572de4]/10 dark:bg-indigo-950/80 hover:bg-[#572de4]/20 text-[#572de4] dark:text-indigo-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Compartir hábito</span>
          </button>
          {activeTab === 'todo' && (
            <button
              type="button"
              onClick={() => setActiveTab('habitos')}
              className="text-xs font-bold text-[#572de4] dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {habitosFiltrados.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <p className="text-xs text-slate-400">No se encontraron hábitos en esta búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {habitosFiltrados.slice(0, limit).map((habito) => {
            const id = habito.idhabito || habito.id;
            const isCloningThis = cloningId === id;

            return (
              <div
                key={id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#572de4]/10 dark:bg-indigo-950/70 text-[#572de4] dark:text-indigo-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                      {habito.categoria_nombre || 'General'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {habito.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {habito.descripcion || 'Hábito saludable para tu bienestar diario.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-[#572de4]" />
                    <span>{formatClonesCount(habito.clones_count)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCloneHabit(habito)}
                    disabled={isCloningThis || isPending}
                    className="px-3.5 py-1.5 rounded-full bg-[#572de4] hover:bg-[#461ebd] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    {isCloningThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface CommunityArticulosSectionViewProps {
  readonly activeTab: TabType;
  readonly setActiveTab: (tab: TabType) => void;
  readonly articulosFiltrados: any[];
  readonly setSelectedArticuloModal: (art: Articulo) => void;
}

function CommunityArticulosSectionView({
  activeTab,
  setActiveTab,
  articulosFiltrados,
  setSelectedArticuloModal,
}: CommunityArticulosSectionViewProps) {
  const limit = activeTab === 'articulos' ? 20 : 4;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#572de4] dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Artículos y Guías Clínicas
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Contenido respaldado por evidencia científica y revisado por profesionales.
          </p>
        </div>

        {activeTab === 'todo' && (
          <button
            type="button"
            onClick={() => setActiveTab('articulos')}
            className="text-xs font-bold text-[#572de4] dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Ver biblioteca</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {articulosFiltrados.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <p className="text-xs text-slate-400">No se encontraron artículos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articulosFiltrados.slice(0, limit).map((art) => {
            const id = art.idarticulo || art.idArticulo || art.id;

            return (
              <button
                type="button"
                key={id}
                onClick={() => setSelectedArticuloModal(art)}
                className="text-left w-full p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-[#572de4]/40"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#572de4]/10 text-[#572de4] dark:bg-indigo-950/80 dark:text-indigo-300 text-[11px] font-semibold">
                      {art.categoria || 'Salud Mental'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      5 min lectura
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-[#572de4] transition-colors">
                      {art.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                      {art.contenido}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[#572de4] dark:text-indigo-400 text-[11px] font-bold">
                      EV
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        Dra. Elena Vidal
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Psiquiatra Colegiada
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#572de4] dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                    <span>Leer artículo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface CommunityForosSectionViewProps {
  readonly activeTab: TabType;
  readonly setActiveTab: (tab: TabType) => void;
  readonly selectedTag: string;
  readonly setSelectedTag: (tag: string) => void;
  readonly sortBy: ForoSortBy;
  readonly setSortBy: (sort: ForoSortBy) => void;
  readonly forosFiltrados: any[];
  readonly setIsCreateForoOpen: (open: boolean) => void;
  readonly userId?: string;
  readonly isAdmin: boolean;
  readonly openForoMenuId: string | null;
  readonly setOpenForoMenuId: (id: string | null) => void;
  readonly setEditingForo: (foro: any) => void;
  readonly deletingForoId: string | null;
  readonly isPending: boolean;
  readonly handleDeleteForo: (foroId: string, e: React.MouseEvent) => void;
  readonly reactingForoId: string | null;
  readonly handleLikeForo: (foro: any) => void;
}

function CommunityForosSectionView({
  activeTab,
  setActiveTab,
  selectedTag,
  setSelectedTag,
  sortBy,
  setSortBy,
  forosFiltrados,
  setIsCreateForoOpen,
  userId,
  isAdmin,
  openForoMenuId,
  setOpenForoMenuId,
  setEditingForo,
  deletingForoId,
  isPending,
  handleDeleteForo,
  reactingForoId,
  handleLikeForo,
}: CommunityForosSectionViewProps) {
  const limit = activeTab === 'foros' ? 30 : 2;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#572de4] dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Foros y Círculos de Apoyo
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Conversaciones reales, empáticas y respetuosas guiadas por la comunidad.
          </p>
        </div>

        {activeTab === 'todo' && (
          <button
            type="button"
            onClick={() => setActiveTab('foros')}
            className="text-xs font-bold text-[#572de4] dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Ver todos los foros</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['Todos', '#Ansiedad', '#Mindfulness', '#Autoestima', '#Sueño', '#Crecimiento personal'].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-[#572de4] text-white shadow-sm'
                    : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tag}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#572de4]"
          >
            <option value="recientes">Más recientes</option>
            <option value="populares">Más populares</option>
            <option value="sin_responder">Sin responder</option>
          </select>
        </div>
      </div>

      {forosFiltrados.length === 0 ? (
        <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col items-center justify-center">
          <MessageSquare className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No hay conversaciones disponibles en esta categoría
          </p>
          <button
            type="button"
            onClick={() => setIsCreateForoOpen(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-[#572de4] text-white text-xs font-bold"
          >
            Sé el primero en iniciar una conversación
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {forosFiltrados.slice(0, limit).map((foro) => {
            const id = foro.idforo || foro.idForo;
            return (
              <CommunityForoCard
                key={id}
                foro={foro}
                userId={userId}
                isAdmin={isAdmin}
                openForoMenuId={openForoMenuId}
                setOpenForoMenuId={setOpenForoMenuId}
                setEditingForo={setEditingForo}
                deletingForoId={deletingForoId}
                isPending={isPending}
                handleDeleteForo={handleDeleteForo}
                reactingForoId={reactingForoId}
                handleLikeForo={handleLikeForo}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ComunidadInteractiveView({
  initialForos = [],
  initialHabitosComunidad = [],
  initialArticulos = [],
  initialEspecialistas = [],
  initialRetos = [],
  userHabitos = [],
  userId,
  isAdmin = false,
  totalMiembros = 0,
  initialLinkedTrainerIds = [],
}: ComunidadInteractiveViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Tab activo sincronizado con query param ?tab=
  const [activeTab, setActiveTab] = useState<TabType>(() => resolveCommunityTab(searchParams.get('tab')));

  useEffect(() => {
    setActiveTab(resolveCommunityTab(searchParams.get('tab')));
  }, [searchParams]);

  // Buscador y atajo ⌘K
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Filtro de categoría en Foros
  const [selectedTag, setSelectedTag] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<ForoSortBy>('recientes');

  // Filtros de categoría para Especialistas
  const [selectedEspCategory, setSelectedEspCategory] = useState<string>('Todos');

  // Modal para crear foro, compartir hábito y crear reto
  const [isCreateForoOpen, setIsCreateForoOpen] = useState(false);
  const [isShareHabitOpen, setIsShareHabitOpen] = useState(false);
  const [isCreateRetoOpen, setIsCreateRetoOpen] = useState(false);
  const [editingForo, setEditingForo] = useState<Record<string, any> | null>(null);

  // Filtro de retos: 'todos' | 'participando'
  const [retoFilterTab, setRetoFilterTab] = useState<RetoFilterTab>('todos');

  // Menú de opciones de foro y eliminación
  const [openForoMenuId, setOpenForoMenuId] = useState<string | null>(null);
  const [deletingForoId, setDeletingForoId] = useState<string | null>(null);

  // Feedback de acciones
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [joiningRetoId, setJoiningRetoId] = useState<string | null>(null);
  const [leavingRetoId, setLeavingRetoId] = useState<string | null>(null);
  const [checkingInRetoId, setCheckingInRetoId] = useState<string | null>(null);
  const [reactingForoId, setReactingForoId] = useState<string | null>(null);

  // Modal de especialista para agendar o ver perfil
  const [selectedSpecialist, setSelectedSpecialist] = useState<Record<string, any> | null>(null);
  const [linkedTrainerIds, setLinkedTrainerIds] = useState<string[]>(initialLinkedTrainerIds);
  const [linkingTrainerId, setLinkingTrainerId] = useState<string | null>(null);

  const isTrainerLinked = (esp: Record<string, any>) => checkIsTrainerLinked(esp, linkedTrainerIds);

  const getTrainerActionLabel = (esp: Record<string, any>): string => {
    const targetId = esp.identrenador || esp.idusuario || esp.id;
    if (linkingTrainerId === targetId) return 'Procesando...';
    return isTrainerLinked(esp) ? 'Tu Coach ✓' : 'Vincular Coach';
  };

  const handleToggleTrainerLink = async (esp: Record<string, any>) => {
    const targetId = esp.identrenador || esp.idusuario || esp.id;
    if (!targetId) return;
    if (esp.idusuario && esp.idusuario === userId) {
      showToast('No puedes vincularte a tu propia cuenta de entrenador.', 'error');
      return;
    }

    const nombreCompleto = `${esp.nombre || 'Entrenador'} ${esp.apellido || ''}`.trim();
    const currentlyLinked = isTrainerLinked(esp);

    setLinkingTrainerId(targetId);
    try {
      const res = currentlyLinked
        ? await unlinkMyTrainerAction(targetId)
        : await linkMyTrainerAction(targetId);

      if (!res.success) {
        showToast(res.error || 'No se pudo actualizar el vínculo con el entrenador.', 'error');
        return;
      }

      if (currentlyLinked) {
        setLinkedTrainerIds((prev) =>
          prev.filter((id) => id !== esp.identrenador && id !== esp.idusuario && id !== targetId)
        );
        showToast(`Te has desvinculado de ${nombreCompleto}.`);
      } else {
        const idsToAdd = [targetId, esp.identrenador, esp.idusuario].filter(Boolean);
        setLinkedTrainerIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
        showToast(`¡Te has vinculado con ${nombreCompleto} como tu entrenador! Ahora podrá asignarte rutinas y seguimiento.`);
      }
    } finally {
      setLinkingTrainerId(null);
    }
  };

  // Modal interactivo de detalle de Reto
  const [selectedRetoModal, setSelectedRetoModal] = useState<Reto | null>(null);

  // Modal de lectura de artículo
  const [selectedArticuloModal, setSelectedArticuloModal] = useState<Articulo | null>(null);

  // Atajo de teclado ⌘K o Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mostrar toast auto-ocultable
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: sanitizeToastMessage(msg), type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Filtrado de Hábitos Comunitarios ──
  const habitosFiltrados = useMemo(
    () => filterHabitosComunidad(initialHabitosComunidad, searchQuery),
    [initialHabitosComunidad, searchQuery]
  );

  // ── Filtrado y Orden de Foros ──
  const forosFiltrados = useMemo(
    () => filterAndSortForos(initialForos, selectedTag, sortBy, searchQuery),
    [initialForos, selectedTag, sortBy, searchQuery]
  );

  // ── Filtrado de Artículos ──
  const articulosFiltrados = useMemo(
    () => filterArticulos(initialArticulos, searchQuery),
    [initialArticulos, searchQuery]
  );

  // ── Filtrado de Especialistas ──
  const especialistasFiltrados = useMemo(
    () => filterEspecialistas(initialEspecialistas, selectedEspCategory, searchQuery),
    [initialEspecialistas, selectedEspCategory, searchQuery]
  );

  // ── Retos en los que participa el usuario actual ──
  const misRetos = useMemo(
    () => initialRetos.filter((r) => (userId && r.usuarios_participando?.includes(userId)) || r.inscrito === true),
    [initialRetos, userId]
  );

  // ── Retos activos vigentes (cuya fecha de fin no ha expirado) ──
  const retosVigentesCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return initialRetos.filter((r) => !r.fechafin || r.fechafin >= today).length;
  }, [initialRetos]);

  // ── Filtrado de Retos ──
  const retosFiltrados = useMemo(
    () => filterRetosList(retoFilterTab === 'participando' ? misRetos : initialRetos, searchQuery),
    [initialRetos, misRetos, retoFilterTab, searchQuery]
  );

  // ── Acción: Eliminar Foro ──
  const handleDeleteForo = (foroId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar este foro? Esta acción no se puede deshacer.')) return;

    setDeletingForoId(foroId);
    startTransition(async () => {
      const res = await deleteForoAction(foroId);
      showToast(res.success ? 'Foro eliminado con éxito ✨' : (res.message || 'Error al eliminar el foro'), res.success ? 'success' : 'error');
      if (res.success) router.refresh();
      setDeletingForoId(null);
      setOpenForoMenuId(null);
    });
  };

  // ── Acción: Clonar Hábito Comunitario ──
  const handleCloneHabit = (habito: any) => {
    const id = habito.idhabito || habito.id;
    const nombre = habito.nombre || 'Hábito';
    setCloningId(id);

    startTransition(async () => {
      const res = await clonarHabitoAction(id);
      showToast(
        res.success ? `¡"${nombre}" ha sido añadido a tus hábitos diarios! 🎯` : (res.message || 'Error al clonar hábito'),
        res.success ? 'success' : 'error'
      );
      if (res.success) router.refresh();
      setCloningId(null);
    });
  };

  // ── Acción: Unirse a Reto ──
  const handleJoinReto = (reto: Reto) => {
    const id = reto.idreto || reto.idReto || reto.id || '';
    setJoiningRetoId(id);

    startTransition(async () => {
      const res = await unirseRetoAction(id);
      if (res.success) {
        showToast(`¡Te uniste a "${reto.titulo}"! 🏆`);
        setSelectedRetoModal((prev: any) => applyRetoJoinOptimistic(prev, id, userId));
        router.refresh();
      } else {
        showToast(res.message || 'Error al unirse al reto', 'error');
      }
      setJoiningRetoId(null);
    });
  };

  // ── Acción: Salir de Reto ──
  const handleLeaveReto = (reto: Reto) => {
    const id = reto.idreto || reto.idReto || reto.id || '';
    setLeavingRetoId(id);

    startTransition(async () => {
      const res = await salirRetoAction(id);
      if (res.success) {
        showToast(`Has salido de "${reto.titulo}"`);
        setSelectedRetoModal((prev: any) => applyRetoLeaveOptimistic(prev, id, userId));
        router.refresh();
      } else {
        showToast(res.message || 'Error al salir del reto', 'error');
      }
      setLeavingRetoId(null);
    });
  };

  // ── Acción: Registrar Avance / Check-in en Reto ──
  const handleCheckinReto = (reto: Reto) => {
    const id = reto.idreto || reto.idReto || reto.id || '';
    setCheckingInRetoId(id);

    startTransition(async () => {
      const res = await checkinRetoAction(id);
      if (res.success) {
        showToast(res.message || '¡Avance registrado! 🎯');
        setSelectedRetoModal((prev: any) => applyRetoCheckinOptimistic(prev, id, res));
        router.refresh();
      } else {
        showToast(res.message || 'Error al registrar avance', 'error');
      }
      setCheckingInRetoId(null);
    });
  };

  // ── Acción: Reaccionar a un Foro ──
  const handleLikeForo = (foro: any) => {
    const id = foro.idforo || foro.idForo;
    setReactingForoId(id);

    startTransition(async () => {
      const res = await reaccionarAction('foro', id, 'like');
      if (res.success) router.refresh();
      setReactingForoId(null);
    });
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-7 pb-16">
      {/* ── Toast de Feedback Flotante ── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 max-w-md break-words border ${
            toast.type === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-800'
              : 'bg-slate-900 text-white border-slate-800 dark:bg-slate-900 dark:text-white dark:border-slate-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          <span className="text-xs sm:text-sm font-semibold break-words leading-snug">{toast.message}</span>
        </div>
      )}

      {/* ── Top Header & Stats ── */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Comunidad &amp; Bienestar
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                {totalMiembros} miembros conectados
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateForoOpen(true)}
            className="sm:hidden self-start px-4 py-2 rounded-xl bg-[#572de4] hover:bg-[#461ebd] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear foro</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Espacio seguro y colaborativo para compartir rutinas, debatir en círculos de apoyo y conectar con especialistas verificados.
        </p>

        {/* ── Barra de Búsqueda con Atajo ⌘K ── */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar foros, hábitos comunitarios, artículos o especialistas..."
            className="w-full h-12 pl-12 pr-20 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#572de4] transition-all"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* ── Pestañas Horizontales de Categorías ── */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('todo')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'todo'
                ? 'bg-[#572de4] text-white'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('foros')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'foros'
                ? 'bg-[#572de4] text-white'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Foros de Apoyo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habitos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'habitos'
                ? 'bg-[#572de4] text-white'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Hábitos Compartidos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('articulos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'articulos'
                ? 'bg-[#572de4] text-white'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Artículos y Guías</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('especialistas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'especialistas'
                ? 'bg-[#572de4] text-white'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Especialistas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('retos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              activeTab === 'retos'
                ? 'bg-[#572de4] text-white'
                : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Retos</span>
          </button>
        </div>
      </div>

      {/* ── Banner Destacado para Crear Foro (Solo en pestaña Foros) ── */}
      {activeTab === 'foros' && (
        <section className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#572de4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-2 max-w-xl relative z-10">
            <div className="flex items-center gap-2 text-[#572de4] dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Iniciativa comunitaria</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ¿Quieres iniciar una conversación?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Crea un foro, comparte tus reflexiones y conecta con otros miembros de la comunidad en un entorno de apoyo y empatía.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateForoOpen(true)}
              className="h-11 px-6 rounded-2xl bg-[#572de4] hover:bg-[#461ebd] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Crear foro</span>
            </button>
          </div>
        </section>
      )}

      {/* ── Banner Destacado para Compartir Hábito (Diseño HabitApp Hábitos de la Comunidad) ── */}
      {activeTab === 'habitos' && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#572de4] via-indigo-600 to-violet-700 text-white p-6 sm:p-8 shadow-md">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold w-fit uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Comunidad en Movimiento</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Inspira a miles compartiendo tu hábito
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                Tus pequeñas victorias diarias pueden encender el cambio que alguien más está buscando hoy. Conecta y crece en colectivo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsShareHabitOpen(true)}
              className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-[#572de4] font-bold text-xs sm:text-sm shadow-md hover:bg-slate-100 transition-all duration-200 hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Compartir hábito</span>
            </button>
          </div>
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />
        </section>
      )}

      {/* ── Multi-Column Grid Layout (2 columnas en vista general, ancho completo en pestañas específicas) ── */}
      <div className={activeTab === 'todo' ? "grid grid-cols-1 xl:grid-cols-12 gap-7 items-start" : "w-full"}>
        {/* ═══════════ COLUMNA PRINCIPAL ═══════════ */}
        <div className={activeTab === 'todo' ? "xl:col-span-8 flex flex-col gap-8" : "w-full flex flex-col gap-8"}>
          {/* ── BLOCK 1: HÁBITOS DE LA COMUNIDAD ── */}
          {(activeTab === 'todo' || activeTab === 'habitos') && (
            <CommunityHabitosSectionView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setIsShareHabitOpen={setIsShareHabitOpen}
              habitosFiltrados={habitosFiltrados}
              cloningId={cloningId}
              isPending={isPending}
              handleCloneHabit={handleCloneHabit}
            />
          )}

          {/* ── BLOCK 2: FOROS Y CÍRCULOS DE APOYO ── */}
          {(activeTab === 'todo' || activeTab === 'foros') && (
            <CommunityForosSectionView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              sortBy={sortBy}
              setSortBy={setSortBy}
              forosFiltrados={forosFiltrados}
              setIsCreateForoOpen={setIsCreateForoOpen}
              userId={userId}
              isAdmin={isAdmin}
              openForoMenuId={openForoMenuId}
              setOpenForoMenuId={setOpenForoMenuId}
              setEditingForo={setEditingForo}
              deletingForoId={deletingForoId}
              isPending={isPending}
              handleDeleteForo={handleDeleteForo}
              reactingForoId={reactingForoId}
              handleLikeForo={handleLikeForo}
            />
          )}

          {/* ── BLOCK 3: ARTÍCULOS Y GUÍAS CLÍNICAS ── */}
          {(activeTab === 'todo' || activeTab === 'articulos') && (
            <CommunityArticulosSectionView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              articulosFiltrados={articulosFiltrados}
              setSelectedArticuloModal={setSelectedArticuloModal}
            />
          )}

          {/* ── BLOCK 4: DIRECTORIO COMPLETO DE ESPECIALISTAS ── */}
          {activeTab === 'especialistas' && (
            <div className="flex flex-col gap-7">
              {/* Hero Banner Especialistas */}
              <section className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative z-10">
                  <div className="max-w-3xl flex flex-col gap-4">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-[#572de4] dark:text-indigo-300 w-fit border border-indigo-100 dark:border-indigo-900/50">
                      <ShieldCheck className="w-4 h-4 text-[#572de4] dark:text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Entrenadores y especialistas verificados</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                      Sesiones 1 a 1 y acompañamiento profesional para tus hábitos
                    </h2>
                    <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                      Conecta con especialistas en fuerza, nutrición y acondicionamiento físico para personalizar tu camino hacia una vida más saludable y consistente.
                    </p>

                    {/* Métricas destacadas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-[#572de4] dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{initialEspecialistas.length}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Especialistas verificados</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-[#572de4] dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">98%</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Valoraciones positivas</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-[#572de4] dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">100%</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personalizado y guiado</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta de asesoría */}
                  <div className="w-full xl:w-80 shrink-0 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-3xl p-6 flex flex-col justify-between">
                    <div className="flex flex-col gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#572de4] text-white flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base pt-1">
                        ¿No sabes cuál especialista elegir?
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Indícanos tu objetivo principal y te emparejamos con el profesional idóneo según tu nivel y metas.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('¡Pronto activaremos el recomendador inteligente de entrenadores!')}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#572de4] hover:bg-[#461ebd] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
                    >
                      <span>Descubrir especialista</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#572de4]/10 blur-3xl pointer-events-none" />
              </section>

              {/* Filtros de Especialidad */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {['Todos', 'Nutrición', 'Fuerza', 'Crossfit'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedEspCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedEspCategory === cat
                          ? 'bg-[#572de4] text-white shadow-sm'
                          : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {especialistasFiltrados.length} profesionales disponibles
                </span>
              </div>

              {/* Cuadrícula de Especialistas */}
              {especialistasFiltrados.length === 0 ? (
                <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No se encontraron especialistas en esta categoría
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {especialistasFiltrados.map((esp) => {
                    const id = esp.idusuario || esp.idEntrenador;
                    const targetId = esp.identrenador || esp.idusuario || esp.id;
                    return (
                      <CommunitySpecialistDirectoryCard
                        key={id}
                        esp={esp}
                        isLinked={isTrainerLinked(esp)}
                        isLinking={linkingTrainerId === targetId}
                        actionLabel={getTrainerActionLabel(esp)}
                        onSelect={setSelectedSpecialist}
                        onToggleLink={(e) => {
                          void handleToggleTrainerLink(e);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── BLOCK 5: DIRECTORIO COMPLETO DE RETOS Y DESAFÍOS ── */}
          {activeTab === 'retos' && (
            <CommunityRetosDirectoryView
              retosVigentesCount={retosVigentesCount}
              setIsCreateRetoOpen={setIsCreateRetoOpen}
              retoFilterTab={retoFilterTab}
              setRetoFilterTab={setRetoFilterTab}
              initialRetosCount={initialRetos.length}
              misRetos={misRetos}
              retosFiltrados={retosFiltrados}
              userId={userId}
              joiningRetoId={joiningRetoId}
              leavingRetoId={leavingRetoId}
              checkingInRetoId={checkingInRetoId}
              isPending={isPending}
              setSelectedRetoModal={setSelectedRetoModal}
              handleJoinReto={handleJoinReto}
              handleLeaveReto={handleLeaveReto}
              handleCheckinReto={handleCheckinReto}
            />
          )}
        </div>

        {/* ═══════════ SIDEBAR LATERAL (4 Cols) - Solo visible en vista general ═══════════ */}
        {activeTab === 'todo' && (
          <CommunitySidebarView
            especialistasFiltrados={especialistasFiltrados}
            retosFiltrados={retosFiltrados}
            isTrainerLinked={isTrainerLinked}
            linkingTrainerId={linkingTrainerId}
            setSelectedSpecialist={setSelectedSpecialist}
            handleToggleTrainerLink={handleToggleTrainerLink}
            setActiveTab={setActiveTab}
            joiningRetoId={joiningRetoId}
            userId={userId}
            isPending={isPending}
            setSelectedRetoModal={setSelectedRetoModal}
            handleJoinReto={handleJoinReto}
          />
        )}
      </div>

      {/* ── Modal para Crear Foro ── */}
      <CreateForoModal
        isOpen={isCreateForoOpen}
        onClose={() => setIsCreateForoOpen(false)}
      />

      {/* ── Modal para Compartir Hábito ── */}
      <ShareHabitModal
        isOpen={isShareHabitOpen}
        onClose={() => setIsShareHabitOpen(false)}
        habitos={userHabitos}
        habitosPublicados={initialHabitosComunidad}
        currentUserId={userId}
        onShared={() => {
          showToast('¡Hábito compartido en la comunidad con éxito! ✨');
          router.refresh();
        }}
      />

      {/* ── Modal para Crear Reto ── */}
      <CreateRetoModal
        isOpen={isCreateRetoOpen}
        onClose={() => setIsCreateRetoOpen(false)}
        onSuccess={() => {
          showToast('¡Reto comunitario creado y te has unido exitosamente! 🏆');
          router.refresh();
        }}
      />

      {/* ── Modal para Editar Foro ── */}
      <EditForoModal
        isOpen={Boolean(editingForo)}
        onClose={() => setEditingForo(null)}
        foro={editingForo}
        onSuccess={() => {
          showToast('¡Foro actualizado con éxito! ✨');
          router.refresh();
        }}
      />

      {/* ── Modal de Lectura de Artículo ── */}
      <ArticleReaderModal
        isOpen={Boolean(selectedArticuloModal)}
        onClose={() => setSelectedArticuloModal(null)}
        articulo={selectedArticuloModal}
      />

      {/* ── Modal de Perfil de Especialista ── */}
      <SpecialistProfileModalView
        selectedSpecialist={selectedSpecialist}
        onClose={() => setSelectedSpecialist(null)}
        isLinked={Boolean(selectedSpecialist && isTrainerLinked(selectedSpecialist))}
        isLinking={Boolean(
          selectedSpecialist &&
          linkingTrainerId === (selectedSpecialist.identrenador || selectedSpecialist.idusuario || selectedSpecialist.id)
        )}
        onToggleLink={() => {
          if (!selectedSpecialist) return;
          void handleToggleTrainerLink(selectedSpecialist).then(() => {
            setSelectedSpecialist(null);
          });
        }}
      />

      {/* ── Modal Interactivo de Detalle de Reto ── */}
      <RetoDetailModal
        reto={selectedRetoModal}
        isOpen={Boolean(selectedRetoModal)}
        onClose={() => setSelectedRetoModal(null)}
        userId={userId}
        isJoining={joiningRetoId === (selectedRetoModal?.idreto || selectedRetoModal?.idReto || selectedRetoModal?.id)}
        isLeaving={leavingRetoId === (selectedRetoModal?.idreto || selectedRetoModal?.idReto || selectedRetoModal?.id)}
        isCheckingIn={checkingInRetoId === (selectedRetoModal?.idreto || selectedRetoModal?.idReto || selectedRetoModal?.id)}
        isPending={isPending}
        onJoin={handleJoinReto}
        onLeave={handleLeaveReto}
        onCheckIn={handleCheckinReto}
      />
    </div>
  );
}
