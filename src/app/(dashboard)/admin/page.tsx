import React from "react";
import { getUsersAction } from "@/actions/admin.actions";
import { ComunidadService } from "@/services/comunidad.service";
import { AdminDashboardInteractive } from "@/components/admin/AdminDashboardInteractive";

export const metadata = {
  title: "Panel de Control Operativo | HabitApp Admin",
  description: "Gobernanza global, monitoreo en tiempo real y auditoría institucional de HabitApp.",
};

export default async function AdminDashboardPage() {
  const comunidadService = new ComunidadService();
  const [usersResult, forosResult] = await Promise.all([
    getUsersAction(1, 100),
    comunidadService.getForos(),
  ]);

  const usersData = usersResult.success && usersResult.data ? usersResult.data : null;

  const rawUsers: any[] = usersData
    ? Array.isArray(usersData)
      ? usersData
      : (usersData.data ?? [])
    : [];

  const totalUsers =
    usersData && !Array.isArray(usersData) && usersData.meta
      ? usersData.meta.total
      : rawUsers.length;

  const totalCoaches = rawUsers.filter(
    (u) =>
      u.nombrerol?.toUpperCase() === "ENTRENADOR" ||
      u.idrol?.toString().toUpperCase() === "ENTRENADOR" ||
      u.nombrerol?.toUpperCase() === "TRAINER"
  ).length;

  const activeUsers = rawUsers.filter(
    (u) => (u.estado_cuenta || "Activo").toLowerCase() === "activo"
  ).length;

  const suspendedUsers = rawUsers.filter(
    (u) => (u.estado_cuenta || "").toLowerCase() === "suspendido"
  ).length;

  const forosList = forosResult.success && Array.isArray(forosResult.data) ? forosResult.data : [];
  const totalForos = forosList.length;

  const recentUsers = rawUsers.slice(0, 5).map((u, idx) => ({
    id: u.idusuario || String(idx),
    nombre: u.nombre || "Usuario",
    apellido: u.apellido || "",
    email: u.correo || u.email || "",
    rol: u.nombrerol || "Usuario",
    estado: u.estado_cuenta || "Activo",
    fecha: u.created_at || "Reciente",
  }));

  return (
    <AdminDashboardInteractive
      initialTotalUsers={totalUsers}
      initialTotalCoaches={totalCoaches}
      initialActiveUsers={activeUsers}
      initialSuspendedUsers={suspendedUsers}
      initialTotalForums={totalForos}
      recentUsers={recentUsers}
    />
  );
}
