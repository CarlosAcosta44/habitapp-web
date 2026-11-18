/**
 * @file src/app/(dashboard)/perfil/page.tsx
 * @description Página de Perfil del usuario. Refactorizada para usar PerfilService y subcomponentes.
 * @layer Presentation (Capa 1)
 */

import { requireUserStrict as requireUser } from "@/lib/auth/require-user";
import { UsuarioService } from "@/services/usuario.service";
import { HabitoService } from "@/services/habito.service";
import { ReportesService } from "@/services/reportes.service";
import { PerfilInteractiveView } from "@/components/perfil/PerfilInteractiveView";

export const metadata = {
  title: "Perfil de Usuario | HabitApp",
  description: "Gestiona tu identidad, revisa tus logros de bienestar y conecta con tu comunidad de hábitos diarios.",
};

export default async function PerfilPage() {
  const user = await requireUser();
  const perfilService = new UsuarioService();
  const habitoService = new HabitoService();
  const reportesService = new ReportesService();

  const [result, habitosRes, reportesRes] = await Promise.all([
    perfilService.getPerfilDashboardData(),
    habitoService.getAll("Activo"),
    reportesService.getEstadisticas(user.id, "month"),
  ]);

  const reportesData = reportesRes && reportesRes.success ? reportesRes.data : null;
  const activeHabitsCount =
    habitosRes.success && Array.isArray(habitosRes.data) ? habitosRes.data.length : 0;

  const dashboardData = result.success ? result.data : null;

  const data = {
    ...dashboardData,
    perfil: {
      ...dashboardData?.perfil,
      id: user.id,
      idusuario: user.id,
      nombre: user.nombre || dashboardData?.perfil?.nombre || "Usuario",
      apellido: user.apellido || dashboardData?.perfil?.apellido || "",
      email: user.email || (dashboardData?.perfil as any)?.email || "",
      correo: user.email || (dashboardData?.perfil as any)?.correo || "",
      fotoperfil: user.fotoperfil || dashboardData?.perfil?.fotoperfil || null,
      puntostotales: user.puntostotales ?? dashboardData?.perfil?.puntos ?? 0,
      puntos: user.puntostotales ?? dashboardData?.perfil?.puntos ?? 0,
    },
    rachaGlobal: reportesData?.racha_actual ?? dashboardData?.rachaGlobal ?? 0,
    diasActivosMensuales: reportesData?.total_cumplido ?? dashboardData?.diasActivosMensuales ?? 0,
    eficienciaMensual: reportesData?.cumplimiento_global ?? dashboardData?.eficienciaMensual ?? 0,
    totalHabitosActivos: activeHabitsCount,
    amigos: dashboardData?.amigos ?? [],
    logros: dashboardData?.logros ?? [],
  };

  return <PerfilInteractiveView data={data as any} />;
}
