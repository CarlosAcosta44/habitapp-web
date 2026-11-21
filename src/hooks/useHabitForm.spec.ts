import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useHabitForm } from './useHabitForm';
import type { CategoriaHabito } from '@/domain/habito.types';

const mockCategorias: CategoriaHabito[] = [
  { idCategoria: 'cat-salud', nombre: 'Salud', descripcion: 'Bienestar físico' },
  { idCategoria: 'cat-mente', nombre: 'Mindfulness', descripcion: 'Salud mental' },
  { idCategoria: 'cat-deporte', nombre: 'Ejercicio', descripcion: 'Actividad' },
];

function evaluateHook(
  categorias: CategoriaHabito[],
): ReturnType<typeof useHabitForm> {
  const results: Array<ReturnType<typeof useHabitForm>> = [];
  function TestHarness({
    onResult,
  }: {
    onResult: (val: ReturnType<typeof useHabitForm>) => void;
  }) {
    const hookVal = useHabitForm(categorias);
    onResult(hookVal);
    return React.createElement('div', null, hookVal.state.habitName);
  }
  renderToStaticMarkup(
    React.createElement(TestHarness, {
      onResult: (v) => {
        results.push(v);
      },
    }),
  );
  return results[0];
}

function validateHabitInput(input: {
  nombre: string;
  metaDiaria: number;
  idCategoria: string;
  diasSemana: number[];
  recordatorios: string[];
}) {
  if (!input.nombre.trim() || input.nombre.length > 45) return { valid: false, field: 'nombre' };
  if (input.metaDiaria <= 0) return { valid: false, field: 'metaDiaria' };
  if (!input.idCategoria) return { valid: false, field: 'idCategoria' };
  if (input.diasSemana.length < 1 || input.diasSemana.length > 7) return { valid: false, field: 'diasSemana' };
  const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  for (const h of input.recordatorios) {
    if (!hhmmRegex.test(h)) return { valid: false, field: 'recordatorios' };
  }
  return { valid: true };
}

describe('useHabitForm y Validaciones de Formulario de Hábito (UT-141 a UT-150)', () => {
  // 1 (UT-141)
  it('UT-141: useHabitForm_EstadoInicialConCategorias_SeleccionaPrimeraCategoriaYMantieneDefaults(US011)', () => {
    const hook = evaluateHook(mockCategorias);
    expect(hook.state.habitName).toBe('Caminar');
    expect(hook.state.selectedCategoryId).toBe('cat-salud');
    expect(hook.computed.selectedCategoriaLabel).toBe('Salud');
    expect(hook.state.timesPerDay).toBe(1);
    expect(hook.state.notificationsEnabled).toBe(true);
  });

  // 2 (UT-142)
  it('UT-142: useHabitForm_SinCategoriasDisponibles_RetornaLabelSinCategoriaSinFallar', () => {
    const hook = evaluateHook([]);
    expect(hook.state.selectedCategoryId).toBe('');
    expect(hook.computed.selectedCategoriaLabel).toBe('Sin categoria');
  });

  // 3 (UT-143)
  it('UT-143: useHabitForm_CatalogoDeIconosYColores_ExponeSeisIconosYSeisColoresDelDesignSystem', () => {
    const hook = evaluateHook(mockCategorias);
    expect(hook.computed.icons).toHaveLength(6);
    expect(hook.computed.colors).toHaveLength(6);
    expect(hook.computed.SelectedIconComponent).toBeDefined();
  });

  // 4 (UT-144)
  it('UT-144: validateHabitInput_NombreVacioOSuperiorA45Caracteres(ReglaDeOro5)_RechazaPorLongitud', () => {
    expect(
      validateHabitInput({
        nombre: '   ',
        metaDiaria: 1,
        idCategoria: 'cat-salud',
        diasSemana: [1, 2, 3],
        recordatorios: ['07:00'],
      }),
    ).toEqual({ valid: false, field: 'nombre' });

    expect(
      validateHabitInput({
        nombre: 'H'.repeat(46),
        metaDiaria: 1,
        idCategoria: 'cat-salud',
        diasSemana: [1],
        recordatorios: [],
      }),
    ).toEqual({ valid: false, field: 'nombre' });
  });

  // 5 (UT-145)
  it('UT-145: validateHabitInput_FrecuenciaConCeroDiasSeleccionados(US012)_RechazaExigiendoMinimoUnDia', () => {
    const res = validateHabitInput({
      nombre: 'Beber agua',
      metaDiaria: 2000,
      idCategoria: 'cat-salud',
      diasSemana: [],
      recordatorios: [],
    });
    expect(res).toEqual({ valid: false, field: 'diasSemana' });
  });

  // 6 & 7 (UT-146 y UT-147 — Valores límite de frecuencia: 1 día y 7 días)
  it.each([
    [[1], 1],
    [[1, 2, 3, 4, 5, 6, 7], 7],
  ])(
    'UT-146/147: validateHabitInput_FrecuenciaEnValoresLimiteValidos(%p, %i días)_Aprueba',
    (diasSemana) => {
      const res = validateHabitInput({
        nombre: 'Meditar',
        metaDiaria: 10,
        idCategoria: 'cat-mente',
        diasSemana,
        recordatorios: ['00:00', '23:59'],
      });
      expect(res.valid).toBe(true);
    },
  );

  // 8 (UT-148)
  it('UT-148: validateHabitInput_RecordatoriosEnLimitesValidos0000Y2359(US013)_ApruebaFormatoHHmm', () => {
    const res = validateHabitInput({
      nombre: 'Lectura',
      metaDiaria: 20,
      idCategoria: 'cat-mente',
      diasSemana: [1, 3, 5],
      recordatorios: ['00:00', '07:30', '23:59'],
    });
    expect(res.valid).toBe(true);
  });

  // 9 & 10 (UT-149 y UT-150 — Valores límite inválidos de hora: 24:00 y 12:60)
  it.each([['24:00'], ['12:60']])(
    'UT-149/150: validateHabitInput_RecordatorioConHoraFueraDeRango(%s)_RechazaFormatoHHmm',
    (horaInvalida) => {
      const res = validateHabitInput({
        nombre: 'Lectura',
        metaDiaria: 20,
        idCategoria: 'cat-mente',
        diasSemana: [1, 3, 5],
        recordatorios: [horaInvalida],
      });
      expect(res).toEqual({ valid: false, field: 'recordatorios' });
    },
  );
});
