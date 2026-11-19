/**
 * @file src/app/(dashboard)/comunidad/page.tsx
 * @description Centro neurálgico de Comunidad & Bienestar — HabitApp.
 * Vista interactiva completa con datos reales, búsqueda con ⌘K, filtros de foros,
 * clonación de hábitos, unión a retos y directorio de especialistas.
 */

import { requireUserStrict as requireUser } from "@/lib/auth/require-user";
import { ComunidadService } from "@/services/comunidad.service";
import { HabitoService } from "@/services/habito.service";
import { coachService } from "@/services/coach.service";
import { ComunidadInteractiveView } from "@/components/comunidad/ComunidadInteractiveView";

export const metadata = {
  title: "Comunidad & Bienestar | HabitApp",
  description: "Espacio seguro y colaborativo para compartir rutinas, debatir y conectar con profesionales.",
};

const comunidadService = new ComunidadService();
const habitoService = new HabitoService();

export default async function ComunidadPage() {
  const user = await requireUser();

  // ── Obtener datos reales en paralelo para máxima velocidad ───────────────────
  const [
    forosRes,
    habitosRes,
    articulosRes,
    especialistasRes,
    retosRes,
    userHabitosRes,
    statsRes,
    trainerRes,
  ] = await Promise.all([
    comunidadService.getForos(),
    comunidadService.getHabitosComunidad(),
    comunidadService.getArticulos(),
    comunidadService.getEspecialistas(),
    comunidadService.getRetos(),
    habitoService.getAll("Activo"),
    comunidadService.getStats(),
    coachService.getMyTrainerAndRoutines(),
  ]);

  const foros = forosRes.success && Array.isArray(forosRes.data) ? forosRes.data : [];
  const habitosComunidad = habitosRes.success && Array.isArray(habitosRes.data) ? habitosRes.data : [];
  const articulos = articulosRes.success && Array.isArray(articulosRes.data) ? articulosRes.data : [];
  const especialistas = especialistasRes.success && Array.isArray(especialistasRes.data) ? especialistasRes.data : [];
  const retos = retosRes.success && Array.isArray(retosRes.data) ? retosRes.data : [];
  const userHabitos = userHabitosRes.success && Array.isArray(userHabitosRes.data) ? userHabitosRes.data : [];
  const linkedTrainerIds =
    trainerRes.success && trainerRes.data?.trainers
      ? trainerRes.data.trainers.flatMap((t) => [t.identrenador, t.idusuario].filter(Boolean))
      : [];

  const roleUpper = (user.nombrerol || '').toUpperCase();
  const isAdmin = roleUpper === "ADMINISTRADOR" || roleUpper === "ADMIN";
  const totalMiembros = statsRes.success && statsRes.data?.totalMiembros ? statsRes.data.totalMiembros : 0;

  return (
    <ComunidadInteractiveView
      initialForos={foros}
      initialHabitosComunidad={habitosComunidad}
      initialArticulos={articulos}
      initialEspecialistas={especialistas}
      initialRetos={retos}
      userHabitos={userHabitos}
      userId={user.id}
      isAdmin={isAdmin}
      totalMiembros={totalMiembros}
      initialLinkedTrainerIds={linkedTrainerIds}
    />
  );
}