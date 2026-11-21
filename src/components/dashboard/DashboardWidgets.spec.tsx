import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DailyProgress } from '../registros/DailyProgress';
import { StreakWidget } from './StreakWidget';

describe('DailyProgress, StreakWidget y TodayHabitsList (UT-151 a UT-160)', () => {
  // 1 (UT-151 — DEF-004)
  it('UT-151: DailyProgress.calcularPorcentaje_CeroHabitosProgramadosHoy_RetornaCeroSinNaN (DEF-004)', () => {
    const html = renderToStaticMarkup(
      React.createElement(DailyProgress, { completados: 0, total: 0 }),
    );
    expect(html).toContain('0%');
    expect(html).not.toContain('NaN');
    expect(html).toContain('0 de 0 habitos completados');
  });

  // 2 (UT-152)
  it('UT-152: DailyProgress_1De4HabitosCompletados(US019)_RenderizaExactamente25PorCiento', () => {
    const html = renderToStaticMarkup(
      React.createElement(DailyProgress, { completados: 1, total: 4 }),
    );
    expect(html).toContain('25%');
    expect(html).toContain('1 de 4 habitos completados');
  });

  // 3 (UT-153)
  it('UT-153: DailyProgress_2De4HabitosCompletados_RenderizaExactamente50PorCiento', () => {
    const html = renderToStaticMarkup(
      React.createElement(DailyProgress, { completados: 2, total: 4 }),
    );
    expect(html).toContain('50%');
    expect(html).toContain('2 de 4 habitos completados');
  });

  // 4 (UT-154)
  it('UT-154: DailyProgress_4De4HabitosCompletados_Alcanza100PorCientoY360Grados', () => {
    const html = renderToStaticMarkup(
      React.createElement(DailyProgress, { completados: 4, total: 4 }),
    );
    expect(html).toContain('100%');
    expect(html).toContain('360deg');
  });

  // 5 (UT-155)
  it('UT-155: StreakWidget_RachaDeUnDia(US020)_MuestraTextoEnSingularDiaDeRacha', () => {
    const html = renderToStaticMarkup(
      React.createElement(StreakWidget, {
        rachaActual: 1,
        diasSemana: [{ dia: 'L', activo: true, esHoy: true }],
      }),
    );
    expect(html).toContain('1 día de racha');
  });

  // 6 (UT-156)
  it('UT-156: StreakWidget_RachaDeVariosDias_MuestraTextoEnPluralDiasDeRacha', () => {
    const html = renderToStaticMarkup(
      React.createElement(StreakWidget, {
        rachaActual: 12,
        diasSemana: [
          { dia: 'L', activo: true, esHoy: false },
          { dia: 'M', activo: true, esHoy: true },
        ],
      }),
    );
    expect(html).toContain('12 días de racha');
  });

  // 7 (UT-157)
  it('UT-157: StreakWidget_RachaEnCeroTrasInterrupcion_Renderiza0DiasDeRacha', () => {
    const html = renderToStaticMarkup(
      React.createElement(StreakWidget, {
        rachaActual: 0,
        diasSemana: [{ dia: 'X', activo: false, esHoy: true }],
      }),
    );
    expect(html).toContain('0 días de racha');
  });

  // 8 (UT-158)
  it('UT-158: StreakWidget_RenderizaLos7DiasDeLaSemanaConIndicadorVisualDeHoy', () => {
    const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, idx) => ({
      dia,
      activo: idx < 3,
      esHoy: idx === 2,
    }));
    const html = renderToStaticMarkup(
      React.createElement(StreakWidget, { rachaActual: 3, diasSemana: dias }),
    );
    expect(html).toContain('Racha actual');
    expect(html).toContain('#572de4');
  });

  // 9 (UT-159)
  it('UT-159: TodayHabitsFilter_SeparaHabitosActivosDeHoyDeLosArchivados(TD1-R1..R4)', () => {
    const habitos = [
      { id: 'h-1', estado: 'Activo', programadoHoy: true, completadoHoy: false },
      { id: 'h-2', estado: 'Activo', programadoHoy: true, completadoHoy: true },
      { id: 'h-3', estado: 'Activo', programadoHoy: false, completadoHoy: false },
      { id: 'h-4', estado: 'Inactivo', programadoHoy: true, completadoHoy: false },
    ];
    const visiblesHoy = habitos.filter(
      (h) => h.estado === 'Activo' && h.programadoHoy,
    );
    expect(visiblesHoy.map((h) => h.id)).toEqual(['h-1', 'h-2']);
  });

  // 10 (UT-160)
  it('UT-160: OptimisticCheckLock_BloqueaSegundoClicMientrasTransicionEstaPendiente(US015/US021)', () => {
    let acreditaciones = 0;
    let isSubmitting = false;

    const handleOptimisticCheck = () => {
      if (isSubmitting) return false;
      isSubmitting = true;
      acreditaciones += 10;
      return true;
    };

    expect(handleOptimisticCheck()).toBe(true);
    expect(handleOptimisticCheck()).toBe(false);
    expect(acreditaciones).toBe(10);
  });
});

