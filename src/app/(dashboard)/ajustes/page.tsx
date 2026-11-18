/**
 * @file src/app/(dashboard)/ajustes/page.tsx
 * @description Página de Ajustes / Configuración.
 * Secciones General y Más opciones con toggles y enlaces.
 */

import { requireUserStrict } from "@/lib/auth/require-user";
import { AjustesClient } from "./AjustesClient";

export const metadata = {
  title: "Ajustes de la Cuenta | HabitApp",
  description: "Personaliza tu experiencia, preferencias de bienestar, privacidad y acompañamiento profesional.",
};

export default async function AjustesPage() {
  const user = await requireUserStrict();

  const currentUserData = {
    nombre: user.nombre || "Usuario",
    apellido: user.apellido || "",
    email: user.email,
    fotoperfil: (user as any).fotoperfil || null,
    nombrerol: user.nombrerol || "Usuario",
    puntostotales: user.puntostotales ?? 0,
    racha: (user as any).rachaActual ?? 24,
  };

  return <AjustesClient user={currentUserData} />;
}
