import { coachRepository } from "@/repositories/coach.repository";
import type { Result } from '@/lib/result';

export interface CoachClient {
  assigned_at: string;
  client: {
    id: string;
    idusuario?: string;
    nombre?: string;
    apellido?: string;
    full_name: string;
    email: string;
    correo?: string;
    avatar_url?: string;
    fotoperfil?: string;
    total_points: number;
    puntostotales?: number;
    nombrerol?: string;
    racha_actual?: number;
    racha_maxima?: number;
    cumplimiento?: number;
    completados_hoy?: number;
    total_habitos?: number;
  };
}

export interface RoutineHabit {
  id?: string;
  habit_name: string;
  habit_icon?: string;
  frequency?: string;
  order_index?: number;
}

export interface CoachRoutine {
  id: string;
  name: string;
  description?: string;
  tipo?: string;
  nivel?: string;
  duracion?: number;
  created_at?: string;
  routine_habits: RoutineHabit[];
}

export interface CreateRoutineDto {
  name: string;
  description?: string;
  tipo?: string;
  nivel?: string;
  duracion?: number;
  habits?: {
    habit_name: string;
    habit_icon?: string;
    frequency?: string;
  }[];
}

export interface MyTrainerInfo {
  identrenador: string;
  idusuario: string;
  nombre: string;
  apellido: string;
  full_name: string;
  email: string;
  fotoperfil: string | null;
  especialidad: string;
  experiencia: number;
  certificacion: string;
  fechainicio: string | null;
}

export interface MyAssignedRoutine {
  idrutina: string;
  nombre: string;
  tipo: string;
  nivel: string;
  duracion: number;
  descripcion: string;
  habits: string[];
  fechainicio: string | null;
  estado: string;
  identrenador: string;
}

export interface MyTrainerAndRoutinesResponse {
  trainers: MyTrainerInfo[];
  routines: MyAssignedRoutine[];
}

/** Alias compatible con el tipo que usaba modules/entrenador/types.ts */
export interface RutinaConUsuarios {
  idRutina: string;
  tipo: string;
  descripcion: string | null;
  duracion: number | null;
  objetivo: string | null;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  idEntrenador: string;
  usuariosAsignados: {
    idUsuario: string;
    nombre: string;
    apellido: string;
    fechaInicio: string;
    estado: string;
  }[];
}

export interface UpdateRoutineDto {
  name?: string;
  description?: string;
  tipo?: string;
  nivel?: string;
  duracion?: number;
  habits?: {
    habit_name: string;
    habit_icon?: string;
    frequency?: string;
  }[];
}

export interface ClientProgress {
  userId?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  correo?: string;
  fotoperfil?: string;
  puntos_totales?: number;
  puntostotales?: number;
  cumplimiento_global?: number;
  total_esperado?: number;
  total_cumplido?: number;
  racha_actual?: number;
  racha_maxima?: number;
  volumen_semanal?: number[];
  consistencia_mes?: any[];
  recordsByDate?: Record<string, string[]>;
  activeHabits?: Array<{
    id: string;
    nombre: string;
    descripcion?: string;
    tipo?: string;
    meta?: string;
    completadoHoy?: boolean;
    progreso?: number;
  }>;
  insight?: string;
  currentStreak?: number;
  longestStreak?: number;
  totalPoints?: number;
  habits?: any[];
}

export const coachService = {
  async getClients(): Promise<Result<CoachClient[]>> {
    return coachRepository.get<CoachClient[]>('/coach/clients');
  },

  async getRoutines(): Promise<Result<CoachRoutine[]>> {
    return coachRepository.get<CoachRoutine[]>('/coach/routines');
  },

  async createRoutine(dto: CreateRoutineDto): Promise<Result<CoachRoutine>> {
    return coachRepository.post<CoachRoutine>('/coach/routines', dto);
  },

  async getRoutineById(id: string): Promise<Result<CoachRoutine>> {
    return coachRepository.get<CoachRoutine>(`/coach/routines/${id}`);
  },

  async updateRoutine(id: string, dto: UpdateRoutineDto): Promise<Result<CoachRoutine>> {
    return coachRepository.patch<CoachRoutine>(`/coach/routines/${id}`, dto);
  },

  async deleteRoutine(id: string): Promise<Result<any>> {
    return coachRepository.delete(`/coach/routines/${id}`);
  },

  async assignRoutine(clientId: string, routineId: string): Promise<Result<any>> {
    return coachRepository.post(`/coach/clients/${clientId}/routines/${routineId}/assign`);
  },

  async getClientProgress(clientId: string): Promise<Result<ClientProgress>> {
    return coachRepository.get<ClientProgress>(`/coach/clients/${clientId}/progress`);
  },

  async sendRecommendation(clientId: string, message: string, type: string = 'Recomendación'): Promise<Result<{ message: string }>> {
    return coachRepository.post<{ message: string }>(`/coach/clients/${clientId}/recommendation`, { message, type });
  },

  async linkClient(clientId: string): Promise<Result<any>> {
    return coachRepository.post(`/coach/clients/${clientId}/link`);
  },

  async unlinkClient(clientId: string): Promise<Result<any>> {
    return coachRepository.delete(`/coach/clients/${clientId}/link`);
  },

  async getAvailableClients(): Promise<Result<any[]>> {
    return coachRepository.get<any[]>('/coach/available-clients');
  },

  async getClientRecommendations(clientId: string): Promise<Result<any[]>> {
    return coachRepository.get<any[]>(`/coach/clients/${clientId}/recommendations`);
  },

  async getMyTrainerAndRoutines(): Promise<Result<MyTrainerAndRoutinesResponse>> {
    return coachRepository.get<MyTrainerAndRoutinesResponse>('/users/me/trainer');
  },

  async linkMyTrainer(trainerId: string): Promise<Result<any>> {
    return coachRepository.post(`/users/me/trainer/${trainerId}`);
  },

  async unlinkMyTrainer(trainerId: string): Promise<Result<any>> {
    return coachRepository.delete(`/users/me/trainer/${trainerId}`);
  },
};
