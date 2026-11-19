/**
 * @file src/app/(dashboard)/ajustes/page.tsx
 * @description Página de Ajustes / Configuración.
 * Secciones General y Más opciones con toggles y enlaces.
 */

import { requireUserStrict } from "@/lib/auth/require-user";
import { ReportesService } from "@/services/reportes.service";
import { coachService } from "@/services/coach.service";
import { AjustesClient } from "./AjustesClient";

export const metadata = {
  title: "Ajustes de la Cuenta | HabitApp",
  description: "Personaliza tu experiencia, preferencias de bienestar, privacidad y acompañamiento profesional.",
};

export default async function AjustesPage() {
  const user = await requireUserStrict();
  const reportesService = new ReportesService();

  const [reportesRes, trainerRes] = await Promise.all([
    reportesService.getEstadisticas(user.id, "week"),
    coachService.getMyTrainerAndRoutines(),
  ]);

  const realStreak = reportesRes.success && reportesRes.data ? (reportesRes.data.racha_actual ?? 0) : 0;
  const trainers = trainerRes.success && trainerRes.data?.trainers ? trainerRes.data.trainers : [];
  const routines = trainerRes.success && trainerRes.data?.routines ? trainerRes.data.routines : [];

  const currentUserData = {
    nombre: user.nombre || "Usuario",
    apellido: user.apellido || "",
    email: user.email,
    fotoperfil: (user as any).fotoperfil || null,
    nombrerol: user.nombrerol || "Usuario",
    puntostotales: user.puntostotales ?? 0,
    racha: realStreak,
  };

  return (
    <AjustesClient
      user={currentUserData}
      initialTrainers={trainers}
      initialRoutines={routines}
    />
  );
}
