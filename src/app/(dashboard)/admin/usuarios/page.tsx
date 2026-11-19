import React from "react";
import { getUsersAction } from "@/actions/admin.actions";
import { AdminUsersManagement } from "@/components/admin/AdminUsersManagement";

export const metadata = {
  title: "Gestión de Usuarios y Roles | HabitApp Admin",
  description: "Supervisión de cuentas, asignación de privilegios institucionales y control de estados de acceso.",
};

export default async function AdminUsersPage() {
  const result = await getUsersAction(1, 10);
  const data = result.success ? result.data : null;

  const initialUsers: any[] = data
    ? Array.isArray(data)
      ? data
      : (data.data ?? [])
    : [];

  const initialTotal = data && !Array.isArray(data) && data.meta?.total
    ? data.meta.total
    : initialUsers.length;

  return (
    <AdminUsersManagement
      initialUsers={initialUsers}
      initialTotal={initialTotal}
    />
  );
}
