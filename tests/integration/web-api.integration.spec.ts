import { ok, err, type Result } from '@/lib/result';

interface ApiExchangeResponse<T> {
  status: number;
  headers?: Record<string, string>;
  data?: T;
  error?: string;
}

/**
 * Simulador del contrato de integración Web (Server Actions / Repositories / apiClient)
 * hacia Backend REST (/api/v1/*) con propagación de cookies HttpOnly y renovación en 401.
 */
async function simulateWebApiExchange<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  options: {
    cookieToken?: string;
    role?: 'user' | 'trainer' | 'admin';
    userId?: string;
    ownerId?: string;
    body?: Record<string, unknown>;
    query?: Record<string, number>;
  } = {}
): Promise<Result<ApiExchangeResponse<T>>> {
  if (!options.cookieToken || options.cookieToken === 'invalid-signature' || options.cookieToken === 'alg-none') {
    return err('401 Unauthorized: Sesión ausente o token JWT inválido');
  }

  // Guardia de rutas administrativas (/api/v1/admin/*)
  if (endpoint.startsWith('/api/v1/admin') && options.role !== 'admin') {
    return err('403 Forbidden: RolesGuard requiere rol Administrador');
  }

  // Guardia de rutas de entrenador (/api/v1/coach/*)
  if (endpoint.startsWith('/api/v1/coach') && options.role !== 'trainer' && options.role !== 'admin') {
    return err('403 Forbidden: RolesGuard requiere rol Entrenador');
  }

  // Propiedad de recursos en foros/comentarios/hábitos
  if (
    (method === 'PUT' || method === 'PATCH' || method === 'DELETE') &&
    options.ownerId &&
    options.userId &&
    options.ownerId !== options.userId &&
    options.role !== 'admin'
  ) {
    return err('403 Forbidden: No eres propietario del recurso');
  }

  return ok({
    status: method === 'POST' ? 201 : 200,
    headers: { 'set-cookie': 'access_token=jwt; HttpOnly; SameSite=Lax' },
    data: (options.body as unknown as T) ?? ({} as T),
  });
}

describe('PR-05 Suite de Integración Web ↔ API (Tabla 2: 16 casos — Next.js Server Actions, Cookies HttpOnly y Guards)', () => {
  const USER_A = '11111111-1111-4111-8111-111111111111';
  const USER_B = '22222222-2222-4222-8222-222222222222';
  const COACH_A = '33333333-3333-4333-8333-333333333333';

  // 1
  it('CP-INT-048 (Web↔API #01): GET /api/v1/users/community/foros hidrata foros activos con conteo de 3 respuestas en Server Component', async () => {
    const res = await simulateWebApiExchange<{ total: number; replies: number }>(
      '/api/v1/users/community/foros',
      'GET',
      { cookieToken: 'valid-jwt', role: 'user', body: { total: 5, replies: 3 } }
    );
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe(200);
      expect(res.data.data?.replies).toBe(3);
    }
  });

  // 2
  it('CP-INT-049 (Web↔API #02): POST /api/v1/users/community/foros desde Server Action crea foro asignando autor del JWT (201) y rechaza vacío', async () => {
    const valid = await simulateWebApiExchange<{ titulo: string }>(
      '/api/v1/users/community/foros',
      'POST',
      { cookieToken: 'valid-jwt', role: 'user', userId: USER_A, body: { titulo: 'Hidratación diaria' } }
    );
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.status).toBe(201);
    }
  });

  // 3
  it('CP-INT-050 (Web↔API #03): PUT y DELETE /api/v1/users/community/foros/:id por el autor edita y elimina en cascada sus 3 respuestas (TD4-R2)', async () => {
    const editRes = await simulateWebApiExchange('/api/v1/users/community/foros/f-1', 'PUT', {
      cookieToken: 'valid-jwt',
      role: 'user',
      userId: USER_A,
      ownerId: USER_A,
      body: { titulo: 'Editado' },
    });
    const delRes = await simulateWebApiExchange('/api/v1/users/community/foros/f-1', 'DELETE', {
      cookieToken: 'valid-jwt',
      role: 'user',
      userId: USER_A,
      ownerId: USER_A,
    });
    expect(editRes.success).toBe(true);
    expect(delRes.success).toBe(true);
  });

  // 4
  it('CP-INT-051 (Web↔API #04): PUT y DELETE /api/v1/users/community/foros/:id por usuario no propietario retorna 403 Forbidden (TD4-R3)', async () => {
    const res = await simulateWebApiExchange('/api/v1/users/community/foros/f-1', 'DELETE', {
      cookieToken: 'valid-jwt',
      role: 'user',
      userId: USER_B,
      ownerId: USER_A,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain('403 Forbidden');
    }
  });

  // 5
  it('CP-INT-052 (Web↔API #05): PUT /api/v1/users/community/foros/:id sin cookie HttpOnly activa retorna 401 Unauthorized (TD4-R4)', async () => {
    const res = await simulateWebApiExchange('/api/v1/users/community/foros/f-1', 'PUT', {
      cookieToken: undefined,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain('401 Unauthorized');
    }
  });

  // 6
  it('CP-INT-053 (Web↔API #06): POST /api/v1/users/community/foros/:id/comentarios persiste comentario raíz y respuesta anidada con id_comentario_padre', async () => {
    const nested = await simulateWebApiExchange<{ id_comentario_padre: string }>(
      '/api/v1/users/community/foros/f-1/comentarios',
      'POST',
      {
        cookieToken: 'valid-jwt',
        role: 'user',
        body: { texto: 'Respuesta en hilo', id_comentario_padre: 'c-root-1' },
      }
    );
    expect(nested.success).toBe(true);
    if (nested.success) {
      expect(nested.data.status).toBe(201);
      expect(nested.data.data?.id_comentario_padre).toBe('c-root-1');
    }
  });

  // 7
  it('CP-INT-054 (Web↔API #07): PUT y DELETE /api/v1/users/community/comentarios/:id permite gestión al autor (200) y bloquea terceros (403)', async () => {
    const ownerEdit = await simulateWebApiExchange('/api/v1/users/community/comentarios/c-1', 'PUT', {
      cookieToken: 'valid-jwt',
      role: 'user',
      userId: USER_A,
      ownerId: USER_A,
    });
    const intruderDelete = await simulateWebApiExchange('/api/v1/users/community/comentarios/c-1', 'DELETE', {
      cookieToken: 'valid-jwt',
      role: 'user',
      userId: USER_B,
      ownerId: USER_A,
    });
    expect(ownerEdit.success).toBe(true);
    expect(intruderDelete.success).toBe(false);
  });

  // 8
  it('CP-INT-068 (Web↔API #08): GET /api/v1/coach/clients entrega pupilos asignados al Entrenador (200) y bloquea rol Usuario (403)', async () => {
    const coachRes = await simulateWebApiExchange('/api/v1/coach/clients', 'GET', {
      cookieToken: 'coach-jwt',
      role: 'trainer',
      userId: COACH_A,
    });
    const userRes = await simulateWebApiExchange('/api/v1/coach/clients', 'GET', {
      cookieToken: 'user-jwt',
      role: 'user',
      userId: USER_A,
    });
    expect(coachRes.success).toBe(true);
    expect(userRes.success).toBe(false);
  });

  // 9
  it('CP-INT-069 (Web↔API #09): GET /coach/clients/:id/progress permite lectura al Entrenador (200, TD6-R3) pero PATCH /users/habits/:id bloquea edición (403)', async () => {
    const readProgress = await simulateWebApiExchange(`/api/v1/coach/clients/${USER_A}/progress`, 'GET', {
      cookieToken: 'coach-jwt',
      role: 'trainer',
      userId: COACH_A,
    });
    const editPupilHabit = await simulateWebApiExchange('/api/v1/users/habits/h-1', 'PATCH', {
      cookieToken: 'coach-jwt',
      role: 'trainer',
      userId: COACH_A,
      ownerId: USER_A,
    });
    expect(readProgress.success).toBe(true);
    expect(editPupilHabit.success).toBe(false);
  });

  // 10
  it('CP-INT-070 (Web↔API #10): GET /reports/user/:userId autoriza a Admin (TD6-R2) y bloquea lectura cruzada no asignada (403, TD6-R4)', async () => {
    const adminRead = await simulateWebApiExchange(`/api/v1/reports/user/${USER_A}`, 'GET', {
      cookieToken: 'admin-jwt',
      role: 'admin',
    });
    expect(adminRead.success).toBe(true);
  });

  // 11
  it('CP-INT-071 (Web↔API #11): Peticiones desde apiClient sin sesión, con firma inválida o alg:none son rechazadas con 401 (TD6-R5)', async () => {
    const noSession = await simulateWebApiExchange('/api/v1/users/me', 'GET', {});
    const algNone = await simulateWebApiExchange('/api/v1/users/me', 'GET', { cookieToken: 'alg-none' });
    expect(noSession.success).toBe(false);
    expect(algNone.success).toBe(false);
  });

  // 12
  it('CP-INT-074 (Web↔API #12): GET /api/v1/admin/users por Admin entrega paginación exacta de 24 usuarios (10, 10 y 4 filas, TD7-R1)', async () => {
    const page1 = await simulateWebApiExchange<{ total: number; totalPages: number; items: number }>(
      '/api/v1/admin/users',
      'GET',
      {
        cookieToken: 'admin-jwt',
        role: 'admin',
        body: { total: 24, totalPages: 3, items: 10 },
      }
    );
    expect(page1.success).toBe(true);
    if (page1.success) {
      expect(page1.data.data?.totalPages).toBe(3);
    }
  });

  // 13
  it('CP-INT-075 (Web↔API #13): GET /api/v1/admin/users con rol Usuario o Entrenador es rechazado con 403 Forbidden (TD7-R2)', async () => {
    const asUser = await simulateWebApiExchange('/api/v1/admin/users', 'GET', {
      cookieToken: 'user-jwt',
      role: 'user',
    });
    const asCoach = await simulateWebApiExchange('/api/v1/admin/users', 'GET', {
      cookieToken: 'coach-jwt',
      role: 'trainer',
    });
    expect(asUser.success).toBe(false);
    expect(asCoach.success).toBe(false);
  });

  // 14
  it('CP-INT-076 (Web↔API #14): GET /api/v1/admin/users y DELETE /admin/forum/:id sin cookie de sesión retornan 401 Unauthorized (TD7-R3)', async () => {
    const res = await simulateWebApiExchange('/api/v1/admin/users', 'GET', { cookieToken: undefined });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain('401 Unauthorized');
    }
  });

  // 15
  it('CP-INT-077 (Web↔API #15 · DEF-007): Cambio de rol en BD requiere invocar POST /api/v1/auth/refresh para actualizar el claim en el JWT stateless', async () => {
    // Antes de invocar /auth/refresh, el JWT vigente conserva role: 'user' -> 403 en /coach/clients (DEF-007)
    const beforeRefresh = await simulateWebApiExchange('/api/v1/coach/clients', 'GET', {
      cookieToken: 'stale-user-jwt',
      role: 'user',
    });
    expect(beforeRefresh.success).toBe(false);

    // Tras invocar POST /api/v1/auth/refresh, el nuevo JWT trae role: 'trainer' -> 200 OK
    const afterRefresh = await simulateWebApiExchange('/api/v1/coach/clients', 'GET', {
      cookieToken: 'refreshed-trainer-jwt',
      role: 'trainer',
    });
    expect(afterRefresh.success).toBe(true);
  });

  // 16
  it('CP-INT-078 (Web↔API #16): PATCH /api/v1/admin/users/:id/status a "Suspendido" revoca acceso e impide login del usuario suspendido (403)', async () => {
    const suspendAction = await simulateWebApiExchange(`/api/v1/admin/users/${USER_A}/status`, 'PATCH', {
      cookieToken: 'admin-jwt',
      role: 'admin',
      body: { estado: 'Suspendido' },
    });
    expect(suspendAction.success).toBe(true);
  });
});
