/**
 * @file src/services/amigos.service.ts
 * @description Service Layer para la gestión de amigos — llamadas pasan por apiClient hacia NestJS.
 * @layer Business Logic (Capa 3)
 */

import { amigosRepository } from "@/repositories/amigos.repository";
import type { Result } from "@/lib/result";

export class AmigosService {
  async addFriend(targetUserId: string): Promise<Result<any>> {
    return amigosRepository.post<any>("users/friends", { targetUserId });
  }

  async getFriends(): Promise<Result<any[]>> {
    return amigosRepository.get<any[]>("users/friends");
  }

  async getFriendSuggestions(limit = 12): Promise<Result<any[]>> {
    return amigosRepository.get<any[]>(`users/friends/suggestions?limit=${limit}`);
  }
}
