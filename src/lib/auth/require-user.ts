import { cookies } from "next/headers";
import { apiClient, getValidAccessToken } from "@/lib/api/client";
import { ok, err, Result } from "@/lib/result";
import { redirect } from "next/navigation";
import { cache } from "react";

export interface AppUser {
  id: string;
  idusuario?: string;
  email: string;
  nombre?: string;
  apellido?: string;
  fotoperfil?: string | null;
  telefono?: string | null;
  genero?: string | null;
  fechanacimiento?: string | null;
  puntostotales?: number;
  idrol?: string | number;
  nombrerol?: string;
}

/**
 * Obtención deduplicada en memoria durante el ciclo de renderizado de la misma petición.
 */
const fetchCurrentUser = cache(async (): Promise<Result<AppUser>> => {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get("access_token")?.value);
  const hasRefreshToken = Boolean(cookieStore.get("refresh_token")?.value);

  if (!hasAccessToken && !hasRefreshToken) {
    return err("No autorizado. Inicia sesión para continuar.");
  }

  // apiClient ahora renueva silenciosamente el access_token en memoria y cookies si recibe 401
  const result = await apiClient.get<any>("/users/me");

  if (!result.success || !result.data) {
    return err("Sesión expirada o inválida.");
  }

  const token = await getValidAccessToken(false);

  let jwtEmail = "";
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const jsonStr = Buffer.from(padded, "base64").toString("utf8");
        const payload = JSON.parse(jsonStr);
        jwtEmail = payload.email || payload.user_metadata?.email || "";
      }
    } catch {
      // Ignorar errores al decodificar JWT
    }
  }

  // Mapear idusuario (del backend NestJS) a id (esperado por el frontend)
  const mappedUser: AppUser = {
    ...result.data,
    id: result.data.idusuario || result.data.id,
    email: result.data.email || result.data.correo || jwtEmail || "",
  };

  return ok(mappedUser);
});

/**
 * Helper para validar el usuario autenticado en Server Actions y Server Components.
 * Devuelve un Result<AppUser> o redirige automáticamente.
 */
export async function requireUser(options?: { redirectToLogin?: boolean }): Promise<Result<AppUser>> {
  const result = await fetchCurrentUser();
  if (!result.success && options?.redirectToLogin) {
    redirect("/login");
  }
  return result;
}

/**
 * Helper para Server Components que requieren un usuario puro.
 * Si falla, redirige automáticamente a /login.
 */
export async function requireUserStrict(): Promise<AppUser> {
  const result = await requireUser({ redirectToLogin: true });
  if (!result.success || !result.data) {
    redirect("/login");
  }
  return result.data;
}
