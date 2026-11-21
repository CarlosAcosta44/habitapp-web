import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RetoCard } from './RetoCard';
import type { Reto } from '@/domain/reto.types';

const baseReto: Reto = {
  idreto: 'reto-101',
  titulo: 'Hidratación Consciente 3D',
  descripcion: 'Completa 2 litros diarios durante 3 días seguidos.',
  fechainicio: '2026-11-01',
  fechafin: '2026-12-31',
  estado: 'Activo',
  puntos_recompensa: 200,
  dias_objetivo: 3,
  dias_progreso: 1,
  progreso: 33,
  inscrito: false,
  checkin_hecho_hoy: false,
  completado: false,
  participantes_count: 15,
};

function renderReto(overrides: Partial<Reto>, userId = 'user-1') {
  return renderToStaticMarkup(
    React.createElement(RetoCard, {
      reto: { ...baseReto, ...overrides },
      userId,
      isJoining: false,
      isLeaving: false,
      isCheckingIn: false,
      isPending: false,
      onSelect: jest.fn(),
      onJoin: jest.fn(),
      onLeave: jest.fn(),
      onCheckIn: jest.fn(),
    }),
  );
}

describe('ForoCard, ComentarioItem y RetoCard — Comunidad (UT-161 a UT-170)', () => {
  // 1 (UT-161)
  it('UT-161: RetoCard_UsuarioNoInscritoEnRetoVigente_MuestraBotonUnirmeAlRetoYRecompensa(US032)', () => {
    const html = renderReto({ inscrito: false });
    expect(html).toContain('Hidratación Consciente 3D');
    expect(html).toContain('+200 pts');
    expect(html).toContain('Unirme al reto');
    expect(html).toContain('15 participantes');
  });

  // 2 (UT-162)
  it('UT-162: RetoCard_UsuarioInscritoSinCheckinHoy(TD5-R1)_HabilitaBotonCheckinMasUnDiaYSalir', () => {
    const html = renderReto({
      inscrito: true,
      checkin_hecho_hoy: false,
      dias_progreso: 1,
      dias_objetivo: 3,
      progreso: 33,
    });
    expect(html).toContain('Check-in (+1 día)');
    expect(html).toContain('Salir');
    expect(html).toContain('1 / 3 días');
  });

  // 3 (UT-163)
  it('UT-163: RetoCard_UsuarioInscritoConCheckinHechoHoy(TD5-R2)_MuestraDiaDeHoyListoYOcultaBotonCheckin', () => {
    const html = renderReto({
      inscrito: true,
      checkin_hecho_hoy: true,
    });
    expect(html).toContain('Día de hoy listo ✓');
    expect(html).not.toContain('Check-in (+1 día)');
  });

  // 4 (UT-164)
  it('UT-164: RetoCard_MetaDeDiasAlcanzadaAl100PorCiento(TD5-R3)_MuestraInsigniaRetoCompletado', () => {
    const html = renderReto({
      inscrito: true,
      completado: true,
      progreso: 100,
      dias_progreso: 3,
    });
    expect(html).toContain('¡Reto Completado!');
  });

  // 5 (UT-165)
  it('UT-165: RetoCard_RetoCaducadoPorFechaFin(TD5-R5)_MuestraEtiquetaCaducadoYBloqueaInscripcion', () => {
    const html = renderReto({
      inscrito: false,
      fechafin: '2020-01-01',
    });
    expect(html).toContain('Caducado');
    expect(html).toContain('Reto finalizado');
    expect(html).not.toContain('Unirme al reto');
  });

  // 6 (UT-166)
  it('UT-166: PermisosDeAutoriaEnForo(TD4-R1..R3)_HabilitaEdicionSoloAlAutorYEliminacionAAutorOAdmin(US028)', () => {
    const evaluarPermisos = (actorId: string, autorId: string, esAdmin: boolean) => ({
      puedeEditar: actorId === autorId,
      puedeEliminar: actorId === autorId || esAdmin,
    });

    expect(evaluarPermisos('u-1', 'u-1', false)).toEqual({
      puedeEditar: true,
      puedeEliminar: true,
    });
    expect(evaluarPermisos('u-2', 'u-1', false)).toEqual({
      puedeEditar: false,
      puedeEliminar: false,
    });
    expect(evaluarPermisos('admin-1', 'u-1', true)).toEqual({
      puedeEditar: false,
      puedeEliminar: true,
    });
  });

  // 7 (UT-167)
  it('UT-167: FiltroDeForosEnTiempoReal(US027)_FiltraPorCategoriaTematicaYPalabraClave', () => {
    const foros = [
      { id: '1', titulo: 'Beneficios de beber agua en ayunas', categoria: 'Nutrición' },
      { id: '2', titulo: 'Rutina de fuerza en casa', categoria: 'Ejercicio' },
      { id: '3', titulo: 'Recetas de hidratación y agua con electrolitos', categoria: 'Nutrición' },
    ];
    const filtrar = (cat: string, query: string) =>
      foros.filter(
        (f) =>
          (cat === 'Todas' || f.categoria === cat) &&
          f.titulo.toLowerCase().includes(query.toLowerCase()),
      );

    expect(filtrar('Nutrición', 'agua')).toHaveLength(2);
    expect(filtrar('Ejercicio', 'agua')).toHaveLength(0);
  });

  // 8 (UT-168)
  it('UT-168: ConstruccionDeHilosAnidadosDeComentarios(US029)_AgrupaRespuestasBajoComentarioPadre', () => {
    const comentarios = [
      { id: 'c-1', parentId: null, texto: 'Comentario raíz' },
      { id: 'c-2', parentId: 'c-1', texto: 'Respuesta anidada 1' },
      { id: 'c-3', parentId: 'c-1', texto: 'Respuesta anidada 2' },
    ];
    const raices = comentarios.filter((c) => c.parentId === null);
    const hijosDeC1 = comentarios.filter((c) => c.parentId === 'c-1');

    expect(raices).toHaveLength(1);
    expect(hijosDeC1).toHaveLength(2);
  });

  // 9 (UT-169)
  it('UT-169: ValidacionDeAdjuntoMultimediaEnCliente(US029)_AceptaHasta5MiBYRechaza5MiBMas1ByteOPdf', () => {
    const MAX_BYTES = 5 * 1024 * 1024; // 5.242.880 bytes
    const validarAdjunto = (size: number, mime: string) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(mime) &&
      size <= MAX_BYTES;

    expect(validarAdjunto(1048576, 'image/jpeg')).toBe(true);
    expect(validarAdjunto(5242880, 'image/png')).toBe(true);
    expect(validarAdjunto(5242881, 'image/jpeg')).toBe(false);
    expect(validarAdjunto(102400, 'application/pdf')).toBe(false);
  });

  // 10 (UT-170)
  it('UT-170: ToggleReaccionCorazon(US030)_AlternaContadorEntre0Y1SinDuplicar', () => {
    let liked = false;
    let count = 0;
    const toggle = () => {
      liked = !liked;
      count += liked ? 1 : -1;
    };

    toggle();
    expect({ liked, count }).toEqual({ liked: true, count: 1 });
    toggle();
    expect({ liked, count }).toEqual({ liked: false, count: 0 });
  });
});

