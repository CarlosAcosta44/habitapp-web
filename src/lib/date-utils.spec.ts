import { getLocalDateString } from './date-utils';
import { ok, err, type Result } from './result';

describe('date-utils y mónada Result<T> (UT-131 a UT-140)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  // 1 (UT-131)
  it('UT-131: getLocalDateString_FechaEstandar_RetornaFormatoYYYYMMDD', () => {
    const d = new Date(2026, 10, 5, 14, 30, 0); // 5 de noviembre de 2026 local
    expect(getLocalDateString(d)).toBe('2026-11-05');
  });

  // 2 (UT-132)
  it('UT-132: getLocalDateString_MesYDiaDeUnDigito_AplicaZeroPaddingCorrecto', () => {
    const d = new Date(2026, 0, 9, 8, 5, 0); // 9 de enero de 2026
    expect(getLocalDateString(d)).toBe('2026-01-09');
  });

  // 3 (UT-133)
  it('UT-133: getLocalDateString_MedianocheLocal2359UTC5_NoSaltaAlDiaUTCSiguiente(US015)', () => {
    const d = new Date(2026, 5, 15, 23, 59, 59); // 15 de junio 23:59 local
    expect(getLocalDateString(d)).toBe('2026-06-15');
  });

  // 4 (UT-134)
  it('UT-134: getLocalDateString_CruceExacto0000Local_CambiaAlNuevoDiaLocal', () => {
    const d = new Date(2026, 5, 16, 0, 0, 0); // 16 de junio 00:00 local
    expect(getLocalDateString(d)).toBe('2026-06-16');
  });

  // 5 (UT-135)
  it('UT-135: getLocalDateString_SinParametrosConRelojSimulado_UsaFechaActualDelSistema', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 9, 12, 0, 0));
    expect(getLocalDateString()).toBe('2026-11-09');
  });

  // 6 (UT-136)
  it('UT-136: getLocalDateString_FinDeAnio31Diciembre2359_ConservaAnioLocal', () => {
    const d = new Date(2026, 11, 31, 23, 59, 0);
    expect(getLocalDateString(d)).toBe('2026-12-31');
  });

  // 7 (UT-137)
  it('UT-137: Result.ok_ValorPrimitivoUObjeto_RetornaSuccessTrueYDataTipada(ReglaDeOro7)', () => {
    const resultado = ok({ idHabito: 'h-1', nombre: 'Meditar' });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.nombre).toBe('Meditar');
    }
  });

  // 8 (UT-138)
  it('UT-138: Result.err_MensajeDeErrorDeDominio_RetornaSuccessFalseYErrorExplicito', () => {
    const resultado: Result<string> = err('El nombre del hábito es obligatorio');
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error).toBe('El nombre del hábito es obligatorio');
    }
  });

  // 9 (UT-139)
  it('UT-139: Result.ok_ListaVaciaEnZeroMockPolicy_RetornaSuccessTrueConArrayVacio', () => {
    const resultado = ok<string[]>([]);
    expect(resultado).toEqual({ success: true, data: [] });
  });

  // 10 (UT-140)
  it('UT-140: DiscriminacionDeTiposResult_PermiteDesestructurarSinLanzarExcepciones', () => {
    const procesar = (r: Result<number>) => (r.success ? r.data * 2 : -1);
    expect(procesar(ok(10))).toBe(20);
    expect(procesar(err('Fallo de red'))).toBe(-1);
  });
});

