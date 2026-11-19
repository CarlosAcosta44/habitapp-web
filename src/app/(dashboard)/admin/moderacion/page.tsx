import React from "react";
import { ComunidadService } from "@/services/comunidad.service";
import { AdminModerationInteractive } from "@/components/admin/AdminModerationInteractive";

export const metadata = {
  title: "Centro de Moderación Comunitaria | HabitApp Admin",
  description: "Supervisión de contenido, saneamiento de hilos y atención de reportes de convivencia.",
};

export default async function AdminModerationPage() {
  const comunidadService = new ComunidadService();
  const forosRes = await comunidadService.getForos();
  const forums = forosRes.success && Array.isArray(forosRes.data) ? forosRes.data : [];

  return <AdminModerationInteractive initialForums={forums} />;
}

