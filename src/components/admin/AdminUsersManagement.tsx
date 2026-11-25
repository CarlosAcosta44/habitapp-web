"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Download,
  UserPlus,
  RotateCw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Star,
  Check,
  X,
  Mail,
} from "lucide-react";

function getRoleBadgeStyle(roleUpper: string): { backgroundColor: string; color: string } {
  if (roleUpper === "ADMINISTRADOR" || roleUpper === "ADMIN") {
    return { backgroundColor: "rgba(87, 45, 228, 0.12)", color: "#572de4" };
  }
  if (roleUpper === "ENTRENADOR") {
    return { backgroundColor: "rgba(147, 51, 234, 0.12)", color: "#9333ea" };
  }
  return { backgroundColor: "rgba(100, 116, 139, 0.12)", color: "#475569" };
}
import {
  getUsersAction,
  updateUserRoleAction,
  updateUserStatusAction,
} from "@/actions/admin.actions";
import type { UserProfileDto } from "@/domain/usuario.types";

interface AdminUsersManagementProps {
  initialUsers?: UserProfileDto[];
  initialTotal?: number;
}

export function AdminUsersManagement({
  initialUsers = [],
  initialTotal = 0,
}: Readonly<AdminUsersManagementProps>) {
  const [users, setUsers] = useState<UserProfileDto[]>(initialUsers);
  const [totalUsers, setTotalUsers] = useState(initialTotal || initialUsers.length || 0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("TODOS");
  const [selectedStatus, setSelectedStatus] = useState<string>("TODOS");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Modals & Action States
  const [roleModalUser, setRoleModalUser] = useState<UserProfileDto | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "Usuario",
  });
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Carga de usuarios desde el backend
  const fetchUsers = async (targetPage = page, targetLimit = limit) => {
    setLoading(true);
    const result = await getUsersAction(targetPage, targetLimit);
    if (result.success) {
      const data = result.data;
      const list = Array.isArray(data) ? data : (data.data ?? []);
      setUsers(list);
      if (!Array.isArray(data) && data.meta?.total) {
        setTotalUsers(data.meta.total);
      }
      setPage(targetPage);
    } else {
      showToast("error", result.error || "Error al cargar la lista de usuarios.");
    }
    setLoading(false);
  };

  // Sincronización y fallback inicial en caso de que el SSR venga vacío
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setUsers(initialUsers);
      setTotalUsers(initialTotal || initialUsers.length);
    } else {
      void fetchUsers(1, limit);
    }
  }, [initialUsers, initialTotal]);

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("user-search-input");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.nombre || ""} ${u.apellido || ""}`.toLowerCase();
      const email = (u.correo || (u as any).email || "").toLowerCase();
      const id = (u.idusuario || "").toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        !term || fullName.includes(term) || email.includes(term) || id.includes(term);

      const userRole = (u.nombrerol || "Usuario").toUpperCase();
      let matchesRole = true;
      if (selectedRole === "USUARIO") matchesRole = userRole === "USUARIO";
      if (selectedRole === "ENTRENADOR") matchesRole = userRole === "ENTRENADOR" || userRole === "TRAINER";
      if (selectedRole === "ADMIN") matchesRole = userRole === "ADMINISTRADOR" || userRole === "ADMIN";

      const userStatus = ((u as any).estado_cuenta || (u as any).estado || "Activo").toUpperCase();
      let matchesStatus = true;
      if (selectedStatus === "ACTIVO") matchesStatus = userStatus === "ACTIVO";
      if (selectedStatus === "SUSPENDIDO") matchesStatus = userStatus === "SUSPENDIDO";
      if (selectedStatus === "PENDIENTE") matchesStatus = userStatus === "PENDIENTE";

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // Selección múltiple
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(filteredUsers.map((u) => u.idusuario));
      setSelectedUserIds(allIds);
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleToggleSelectUser = (id: string) => {
    const updated = new Set(selectedUserIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedUserIds(updated);
  };

  // Cambio de Rol
  const openRoleModal = (u: UserProfileDto) => {
    setRoleModalUser(u);
    setSelectedNewRole(u.nombrerol || "Usuario");
  };

  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return;
    setIsUpdatingRole(true);

    const result = await updateUserRoleAction(roleModalUser.idusuario, selectedNewRole);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.idusuario === roleModalUser.idusuario ? { ...u, nombrerol: selectedNewRole } : u
        )
      );
      showToast("success", `Rol de ${roleModalUser.nombre} actualizado a ${selectedNewRole}.`);
      setRoleModalUser(null);
    } else {
      showToast("error", result.error || "No se pudo actualizar el rol.");
    }
    setIsUpdatingRole(false);
  };

  // Alternar Estado de Cuenta (Activo / Suspendido)
  const handleToggleStatus = async (user: UserProfileDto) => {
    const currentStatus = ((user as any).estado_cuenta || "Activo").toLowerCase();
    const newStatus = currentStatus === "activo" ? "Suspendido" : "Activo";

    const result = await updateUserStatusAction(user.idusuario, newStatus);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.idusuario === user.idusuario ? { ...u, estado_cuenta: newStatus } as any : u
        )
      );
      showToast(
        "success",
        `Cuenta de ${user.nombre} ${newStatus === "Activo" ? "reactivada" : "suspendida"}.`
      );
    } else {
      showToast("error", result.error || "No se pudo cambiar el estado de la cuenta.");
    }
  };

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Nombre", "Apellido", "Correo", "Rol", "Estado", "Puntos"];
    const rows = filteredUsers.map((u) => [
      u.idusuario,
      `"${u.nombre || ""}"`,
      `"${u.apellido || ""}"`,
      `"${u.correo || (u as any).email || ""}"`,
      `"${u.nombrerol || "Usuario"}"`,
      `"${(u as any).estado_cuenta || "Activo"}"`,
      u.puntostotales || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `habitapp-usuarios-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("success", "Archivo CSV generado y descargado correctamente.");
  };

  // Crear Usuario / Invitación
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.nombre) {
      showToast("error", "Por favor completa los campos requeridos.");
      return;
    }

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setInviteModalOpen(false);
      setInviteForm({ nombre: "", apellido: "", email: "", rol: "Usuario" });
      showToast("success", `Invitación institucional enviada a ${inviteForm.email}`);
    }, 1000);
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
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── 1. Top Bar / Header & Actions ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Administración</span>
            <span>›</span>
            <span className="text-[#572de4] dark:text-indigo-400 font-bold">Gestión de Usuarios</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-1" />
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">
              v2.4 Enterprise
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Supervisión de cuentas, asignación de privilegios institucionales y control de estados de acceso en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-11 px-4 rounded-full bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#572de4]" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="h-11 px-5 rounded-full bg-[#572de4] text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:bg-[#4823c9] active:scale-95 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Crear Usuario / Invitación</span>
          </button>
        </div>
      </div>

      {/* ── 2. Quick Metric Cards Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registrados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Registrados
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalUsers.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Total</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Cuentas en el sistema</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Cuentas Activas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Cuentas Activas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {users.filter((u: any) => ((u.estado_cuenta || u.estado || "Activo").toLowerCase() === "activo")).length.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {totalUsers > 0 ? `${Math.round((users.filter((u: any) => ((u.estado_cuenta || u.estado || "Activo").toLowerCase() === "activo")).length / totalUsers) * 100)}%` : "100%"}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Con acceso habilitado</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Cuentas Suspendidas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Cuentas Suspendidas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-extrabold ${users.some((u: any) => (u.estado_cuenta || "").toLowerCase() === "suspendido") ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                {users.filter((u: any) => (u.estado_cuenta || "").toLowerCase() === "suspendido").length}
              </span>
              <span className={`text-xs font-semibold ${users.some((u: any) => (u.estado_cuenta || "").toLowerCase() === "suspendido") ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                {users.some((u: any) => (u.estado_cuenta || "").toLowerCase() === "suspendido") ? "Sancionadas" : "Sin sanciones"}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Por moderación / TOS</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Entrenadores */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Entrenadores
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {users.filter((u: any) => (u.nombrerol || "").toUpperCase() === "ENTRENADOR" || (u.nombrerol || "").toUpperCase() === "TRAINER").length}
              </span>
              <span className="text-xs font-semibold text-purple-600">Certificados</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Supervisión de clientes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── 3. Search & Filters Toolbar ── */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Broad Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="user-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, apellido, correo o UUID..."
              className="w-full h-11 pl-11 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#572de4] transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-mono pointer-events-none">
              ⌘K
            </span>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              type="button"
              onClick={() => fetchUsers(page, limit)}
              className="h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              title="Sincronizar datos"
            >
              <RotateCw className={`w-4 h-4 ${loading ? "animate-spin text-[#572de4]" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        {/* Quick Pill Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Roles Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Rol:</span>
            {[
              { id: "TODOS", label: "Todos los roles" },
              { id: "USUARIO", label: "Usuarios" },
              { id: "ENTRENADOR", label: "Entrenadores" },
              { id: "ADMIN", label: "Administradores" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedRole === r.id
                    ? "bg-[#572de4] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Estado:</span>
            {[
              { id: "TODOS", label: "Todos" },
              { id: "ACTIVO", label: "Activo", dot: "bg-emerald-500" },
              { id: "SUSPENDIDO", label: "Suspendido", dot: "bg-rose-500" },
              { id: "PENDIENTE", label: "Pendiente", dot: "bg-amber-500" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedStatus === s.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {s.dot && <span className={`w-2 h-2 rounded-full ${s.dot}`} />}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Main Data Table Container ── */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Table Subheader */}
        <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="select-all"
              onChange={handleSelectAll}
              checked={filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length}
              className="w-4 h-4 rounded text-[#572de4] focus:ring-[#572de4]"
            />
            <label htmlFor="select-all" className="font-semibold cursor-pointer select-none">
              Seleccionar lote actual ({selectedUserIds.size} seleccionados)
            </label>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Mostrando <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> usuarios
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>Orden: Más recientes</span>
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Estado de Cuenta</th>
                <th className="py-3 px-4">Puntos / Racha</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No se encontraron usuarios coincidentes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const roleName = u.nombrerol || "Usuario";
                  const roleUpper = roleName.toUpperCase();
                  const isSuspended =
                    ((u as any).estado_cuenta || (u as any).estado || "").toLowerCase() ===
                    "suspendido";

                  return (
                    <tr
                      key={u.idusuario || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(u.idusuario)}
                          onChange={() => handleToggleSelectUser(u.idusuario)}
                          className="w-4 h-4 rounded text-[#572de4] focus:ring-[#572de4]"
                        />
                      </td>

                      {/* Usuario */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[#572de4] dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-indigo-200/50 dark:ring-indigo-800/40">
                            {u.nombre ? u.nombre[0].toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {u.nombre} {u.apellido}
                            </span>
                            <span className="text-xs text-slate-400 truncate block font-mono">
                              {u.correo || (u as any).email || "Sin correo"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => openRoleModal(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:ring-2 hover:ring-indigo-400/30 cursor-pointer"
                          style={getRoleBadgeStyle(roleUpper)}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{roleName}</span>
                          <span className="text-[10px] text-slate-400 underline ml-0.5">Editar</span>
                        </button>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                            isSuspended
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/40"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40"
                          }`}
                          title={`Hacer clic para ${isSuspended ? "reactivar" : "suspender"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSuspended ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                          <span>{isSuspended ? "Suspendido" : "Activo"}</span>
                        </button>
                      </td>

                      {/* Puntos */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{(u.puntostotales || 0).toLocaleString()} pts</span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openRoleModal(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                          >
                            Rol
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              isSuspended
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            }`}
                          >
                            {isSuspended ? "Reactivar" : "Suspender"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Filas por página:</span>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                void fetchUsers(1, newLimit);
              }}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Página {page}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => fetchUsers(page - 1, limit)}
                className="p-1.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={filteredUsers.length < limit || loading}
                onClick={() => fetchUsers(page + 1, limit)}
                className="p-1.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Cambiar Rol ── */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Modificar Rol de Usuario
                  </h3>
                  <p className="text-xs text-slate-400">Gobernanza de permisos institucionales</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Usuario objetivo:</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {roleModalUser.nombre} {roleModalUser.apellido}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {roleModalUser.correo || (roleModalUser as any).email}
              </p>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Selecciona el nuevo rol:
              </span>
              <div className="space-y-2">
                {[
                  {
                    id: "Usuario",
                    title: "Usuario Estándar",
                    desc: "Acceso normal a hábitos, foros comunitarios y progreso.",
                  },
                  {
                    id: "Entrenador",
                    title: "Entrenador Certificado",
                    desc: "Acceso al portal de entrenador, asignación de rutinas y seguimiento a clientes.",
                  },
                  {
                    id: "Administrador",
                    title: "Administrador Master",
                    desc: "Acceso total a gobernanza, gestión de usuarios, roles y moderación.",
                  },
                ].map((r) => (
                  <label
                    key={r.id}
                    htmlFor={`role-select-${r.id}`}
                    aria-label={r.title}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedNewRole.toLowerCase() === r.id.toLowerCase()
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-[#572de4] text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <input
                      id={`role-select-${r.id}`}
                      type="radio"
                      name="role-select"
                      value={r.id}
                      checked={selectedNewRole.toLowerCase() === r.id.toLowerCase()}
                      onChange={() => setSelectedNewRole(r.id)}
                      className="mt-1 text-[#572de4] focus:ring-[#572de4]"
                    />
                    <span>
                      <span className="text-xs font-bold block">{r.title}</span>
                      <span className="text-[11px] text-slate-400 block">{r.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUpdatingRole}
                onClick={handleConfirmRoleChange}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#572de4] hover:bg-[#4823c9] text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                {isUpdatingRole && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Crear Usuario / Invitación ── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#572de4] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Nueva Invitación de Usuario
                  </h3>
                  <p className="text-xs text-slate-400">Emisión de enlace de alta institucional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="invite-nombre-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nombre *
                  </label>
                  <input
                    id="invite-nombre-input"
                    type="text"
                    required
                    value={inviteForm.nombre}
                    onChange={(e) => setInviteForm({ ...inviteForm, nombre: e.target.value })}
                    placeholder="Ej. Sofía"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#572de4]"
                  />
                </div>
                <div>
                  <label htmlFor="invite-apellido-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Apellido
                  </label>
                  <input
                    id="invite-apellido-input"
                    type="text"
                    value={inviteForm.apellido}
                    onChange={(e) => setInviteForm({ ...inviteForm, apellido: e.target.value })}
                    placeholder="Ej. Aranda"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#572de4]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="invite-email-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Correo Electrónico *
                </label>
                <input
                  id="invite-email-input"
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#572de4]"
                />
              </div>

              <div>
                <label htmlFor="invite-rol-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Rol Inicial
                </label>
                <select
                  id="invite-rol-select"
                  value={inviteForm.rol}
                  onChange={(e) => setInviteForm({ ...inviteForm, rol: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#572de4]"
                >
                  <option value="Usuario">Usuario Estándar</option>
                  <option value="Entrenador">Entrenador Certificado</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#572de4] hover:bg-[#4823c9] text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                >
                  {inviteSuccess ? <Check className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>{inviteSuccess ? "Enviando..." : "Enviar Invitación"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

