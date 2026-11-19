/**
 * @file src/lib/api/client.ts
 * @description Cliente de API centralizado para comunicarse con el backend en NestJS.
 * Extrae y pasa el token JWT de Supabase de manera automática.
 * @layer Presentation & Integration (Capa 1/2 — Server-side)
 */

import { ok, err }       from "@/lib/result";
import type { Result }   from "@/lib/result";
import { cookies } from "next/headers";
import { setSessionCookies } from "@/lib/auth/session-cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

/**
 * Caché en memoria de tokens renovados durante renders de Server Components
 * (donde Next.js no permite mutar cookies directement) para que todas las peticiones
 * paralelas o subsecuentes usen el access_token fresco sin fallar con 401.
 */
const refreshedAccessTokens = new Map<string, string>();
const inFlightRefreshes = new Map<string, Promise<string | null>>();

/**
 * Renueva silenciosamente el access_token usando el refresh_token disponible.
 */
export async function refreshAccessTokenSilently(refreshToken: string): Promise<string | null> {
  const existingPromise = inFlightRefreshes.get(refreshToken);
  if (existingPromise) {
    return existingPromise;
  }

  const refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      const newAccessToken = data?.access_token as string | undefined;
      const newRefreshToken = data?.refresh_token as string | undefined;

      if (!newAccessToken) return null;

      refreshedAccessTokens.set(refreshToken, newAccessToken);
      if (newRefreshToken) {
        refreshedAccessTokens.set(newRefreshToken, newAccessToken);
      }

      try {
        await setSessionCookies({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch {
        // Ignorar si se ejecuta dentro de un Server Component render donde cookies.set no está permitido
      }

      return newAccessToken;
    } catch {
      return null;
    } finally {
      inFlightRefreshes.delete(refreshToken);
    }
  })();

  inFlightRefreshes.set(refreshToken, refreshPromise);
  return refreshPromise;
}

/**
 * Obtiene un access_token válido (desde cookies o desde la caché de renovación silenciosa).
 */
export async function getValidAccessToken(forceRefresh = false): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("access_token")?.value || null;
    const refreshToken = cookieStore.get("refresh_token")?.value || null;

    if (forceRefresh && refreshToken) {
      return await refreshAccessTokenSilently(refreshToken);
    }

    if (refreshToken && refreshedAccessTokens.has(refreshToken)) {
      return refreshedAccessTokens.get(refreshToken) || cookieToken;
    }

    if (!cookieToken && refreshToken) {
      return await refreshAccessTokenSilently(refreshToken);
    }

    return cookieToken;
  } catch {
    return null;
  }
}

/**
 * Obtiene las cabeceras de autorización con el Bearer JWT del usuario autenticado.
 */
async function getAuthHeader(forceRefresh = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "x-timezone-offset": new Date().getTimezoneOffset().toString(),
  };
  const token = await getValidAccessToken(forceRefresh);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Wrapper genérico de fetch que gestiona la comunicación de red, renovación automática en 401 y errores.
 */
async function request<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Result<T>> {
  const { params, headers: customHeaders, ...rest } = options;

  const cleanEndpoint = endpoint.replace(/^\//, "");
  let url = `${API_URL}/${cleanEndpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const authHeader = await getAuthHeader(false);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader,
    ...(customHeaders as Record<string, string>),
  };

  try {
    let response = await fetch(url, {
      ...rest,
      headers,
    });

    // Si recibimos 401 y no es un endpoint de login/refresh, intentamos renovar con refresh_token y reintentar
    if (
      response.status === 401 &&
      !cleanEndpoint.startsWith("auth/login") &&
      !cleanEndpoint.startsWith("auth/refresh")
    ) {
      const refreshedAuthHeader = await getAuthHeader(true);
      if (refreshedAuthHeader["Authorization"]) {
        response = await fetch(url, {
          ...rest,
          headers: {
            ...headers,
            ...refreshedAuthHeader,
          },
        });
      }
    }

    if (!response.ok) {
      let errorMessage = `Error en la petición: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message;
        }
      } catch {
        // Ignorar si el cuerpo no es JSON legible
      }
      return err(errorMessage);
    }

    if (response.status === 204) {
      return ok({} as T);
    }

    const data = await response.json();
    return ok(data);
  } catch (error: any) {
    console.error(`Error de red en endpoint "${endpoint}":`, error);
    return err(error?.message || "Error de red al conectar con el servidor backend");
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
