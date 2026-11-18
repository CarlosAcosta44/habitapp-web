import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import { ok, err, Result } from "@/lib/result";
import { redirect } from "next/navigation";
import { cache } from "react";
import { setSessionCookies } from "./session-cookies";

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
  let token = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!token && !refreshToken) {
    return err("No autorizado. Inicia sesión para continuar.");
  }

  // Intentamos obtener el perfil del usuario desde el backend
  let result = token ? await apiClient.get<any>("/users/me") : { success: false, data: null };

  // Si falló (ej. access_token expirado) y contamos con refresh_token, renovamos silenciosamente
  if (!result.success && refreshToken) {
    const refreshResult = await apiClient.post<any>("/auth/refresh", {
      refreshToken,
    });

    if (refreshResult.success && refreshResult.data?.access_token) {
      token = refreshResult.data.access_token as string;
      try {
        await setSessionCookies({
          accessToken: token,
          refreshToken: refreshResult.data.refresh_token as string | undefined,
        });
      } catch {
        // Ignore cookie mutation errors when requireUser runs inside a Server Component render
      }

      // Reintentamos /users/me con el token recién emitido
      result = await apiClient.get<any>("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  if (!result.success || !result.data) {
    return err("Sesión expirada o inválida.");
  }

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
