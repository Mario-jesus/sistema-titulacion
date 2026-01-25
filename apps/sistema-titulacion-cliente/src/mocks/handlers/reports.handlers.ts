import { http, HttpResponse } from 'msw';
import { buildApiUrl, delay } from '../utils';
import { mockStudents } from '../data/students';
import { mockQuotas } from '../data/quotas';
import { mockGenerations } from '../data/generations';
import { mockCareers } from '../data/careers';
import { findGraduationByStudentId } from '../data/graduations';
import { Sex } from '@entities/student';

type ReportType = 'por-generaciones' | 'por-carreras';
type GraduationRateDenominator = 'ingreso' | 'egreso';
type SexFilter = 'general' | Sex.MASCULINO | Sex.FEMENINO;

interface GenerateReportRequest {
  dateRange?: {
    type: 'general' | 'specific';
    startYear?: number;
    endYear?: number;
  };
  careers?: {
    type: 'general' | 'specific';
    selected?: string[];
  };
  startYear?: number; // Compatibilidad con formato anterior
  endYear?: number; // Compatibilidad con formato anterior
  careerIds?: string[]; // Compatibilidad con formato anterior
  graduationRateDenominator: GraduationRateDenominator;
  includeOtherValue: boolean;
  reportType: ReportType;
  sex?: SexFilter; // Filtro de sexo: 'general', 'MASCULINO' o 'FEMENINO'
}

interface ReportMetrics {
  ingreso: number;
  egreso: number;
  titulados: number;
}

interface ReportTotals {
  titulados: number;
  porcentaje: number;
  // El valor del denominador siempre está presente
  ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
  egreso?: number; // Presente si graduationRateDenominator === 'egreso'
  // El valor no seleccionado solo está presente si includeOtherValue es true
}

// Tipo para métricas por carrera en reporte agrupado (similar a ReportTotals pero sin porcentaje en el tipo base)
interface ReportCareerMetrics {
  titulados: number;
  porcentaje: number; // Porcentaje calculado según el graduationRateDenominator
  // El valor del denominador siempre está presente
  ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
  egreso?: number; // Presente si graduationRateDenominator === 'egreso'
  // El valor no seleccionado solo está presente si includeOtherValue es true
}

type ReportGenerationRow = Record<
  string,
  ReportCareerMetrics | ReportTotals
> & {
  totales: ReportTotals;
};

interface ReportByGenerationsGroupedResponse {
  type: ReportType;
  tableType: 'grouped';
  metadata: {
    startYear?: number;
    endYear?: number;
    careerIds: string[];
    graduationRateDenominator: GraduationRateDenominator;
    includeOtherValue: boolean;
    generatedAt: string;
  };
  data: Record<string, ReportGenerationRow>;
  generations: Array<{
    id: string;
    name: string;
    startYear: string;
    endYear: string;
  }>;
  careers: Array<{
    id: string;
    name: string;
    shortName: string;
  }>;
  totalsByGeneration: Record<string, ReportTotals>;
  totalsByCareer: Record<string, ReportMetrics>;
  grandTotal: ReportTotals;
}

interface ReportByGenerationsTableResponse {
  type: ReportType;
  tableType: 'table';
  metadata: {
    startYear?: number;
    endYear?: number;
    careerIds?: undefined;
    graduationRateDenominator: GraduationRateDenominator;
    includeOtherValue: boolean;
    generatedAt: string;
  };
  data: Array<{
    generationId: string;
    generation: {
      id: string;
      name: string;
      startYear: string;
      endYear: string;
    };
    titulados: number;
    porcentaje: number;
    // El valor del denominador siempre está presente
    ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
    egreso?: number; // Presente si graduationRateDenominator === 'egreso'
    // El valor no seleccionado solo está presente si includeOtherValue es true
  }>;
  grandTotal: ReportTotals;
}

interface ReportOverallSummaryResponse {
  type: ReportType;
  tableType: 'summary';
  metadata: {
    dateRange: 'general';
    careers: 'general';
    graduationRateDenominator: GraduationRateDenominator;
    includeOtherValue: boolean;
    generatedAt: string;
  };
  data: {
    titulados: number;
    porcentaje: number;
    // El valor del denominador siempre está presente
    ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
    egreso?: number; // Presente si graduationRateDenominator === 'egreso'
    // El valor no seleccionado solo está presente si includeOtherValue es true
  };
}

interface ReportByCareersTableResponse {
  type: 'por-carreras';
  tableType: 'table';
  metadata: {
    startYear?: number;
    endYear?: number;
    generationIds?: undefined;
    graduationRateDenominator: GraduationRateDenominator;
    includeOtherValue: boolean;
    generatedAt: string;
  };
  data: Array<{
    careerId: string;
    career: {
      id: string;
      name: string;
      shortName: string;
    };
    // Valores por generación (solo titulados)
    valuesByGeneration: Record<string, number>; // { [generationId]: titulados }
    // Totales de la carrera
    titulados: number;
    porcentaje: number;
    // El valor del denominador siempre está presente
    ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
    egreso?: number; // Presente si graduationRateDenominator === 'egreso'
    // El valor no seleccionado solo está presente si includeOtherValue es true
  }>;
  generations: Array<{
    id: string;
    name: string;
    startYear: string;
    endYear: string;
  }>;
  grandTotal: {
    titulados: number;
    porcentaje: number;
    // El valor del denominador siempre está presente
    ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
    egreso?: number; // Presente si graduationRateDenominator === 'egreso'
    // El valor no seleccionado solo está presente si includeOtherValue es true
  };
}

const calculatePercentage = (
  titulados: number,
  denominador: number
): number => {
  if (denominador <= 0) return 0;
  return Number(((titulados / denominador) * 100).toFixed(2));
};

const calculateMetricsForCombination = (
  generationId: string,
  careerId: string,
  sexFilter?: SexFilter
): ReportMetrics => {
  // Filtrar estudiantes por sexo si se especifica
  const filterBySex = (student: (typeof mockStudents)[0]): boolean => {
    if (!sexFilter || sexFilter === 'general') {
      return true;
    }
    return student.sex === sexFilter;
  };

  // Calcular ingresos según el filtro de sexo
  const ingreso = mockQuotas
    .filter(
      (quota) =>
        quota.isActive === true &&
        quota.generationId === generationId &&
        quota.careerId === careerId
    )
    .reduce((sum, quota) => {
      if (!sexFilter || sexFilter === 'general') {
        // Si no hay filtro, sumar ambos
        return (
          sum + quota.newAdmissionQuotasMale + quota.newAdmissionQuotasFemale
        );
      } else if (sexFilter === Sex.MASCULINO) {
        return sum + quota.newAdmissionQuotasMale;
      } else if (sexFilter === Sex.FEMENINO) {
        return sum + quota.newAdmissionQuotasFemale;
      }
      return sum;
    }, 0);

  // Para egresos y titulados, sí podemos filtrar por sexo ya que tenemos los estudiantes
  const egreso = mockStudents.filter(
    (student) =>
      student.generationId === generationId &&
      student.careerId === careerId &&
      student.isEgressed === true &&
      filterBySex(student)
  ).length;

  const titulados = mockStudents.filter((student) => {
    if (
      student.generationId !== generationId ||
      student.careerId !== careerId ||
      !filterBySex(student)
    ) {
      return false;
    }
    const graduation = findGraduationByStudentId(student.id);
    return graduation !== undefined && graduation.isGraduated === true;
  }).length;

  return { ingreso, egreso, titulados };
};

/**
 * Calcula métricas totales para una generación (suma de todas las carreras activas)
 */
const calculateMetricsForGeneration = (
  generationId: string,
  sexFilter?: SexFilter
): ReportMetrics => {
  // Sumar todas las carreras activas
  const activeCareers = mockCareers.filter((career) => career.isActive);

  let totalIngreso = 0;
  let totalEgreso = 0;
  let totalTitulados = 0;

  activeCareers.forEach((career) => {
    const metrics = calculateMetricsForCombination(
      generationId,
      career.id,
      sexFilter
    );
    totalIngreso += metrics.ingreso;
    totalEgreso += metrics.egreso;
    totalTitulados += metrics.titulados;
  });

  return {
    ingreso: totalIngreso,
    egreso: totalEgreso,
    titulados: totalTitulados,
  };
};

const filterGenerationsByYear = (startYear?: number, endYear?: number) => {
  // Si no hay filtro de años, retornar todas las generaciones
  if (!startYear && !endYear) {
    return mockGenerations;
  }

  return mockGenerations.filter((generation) => {
    // Filtrar basándose en el startYear de la generación
    const generationStartYear = generation.startYear.getFullYear();

    // Si hay startYear, la generación debe empezar en o después de ese año
    if (startYear && generationStartYear < startYear) {
      return false;
    }

    // Si hay endYear, la generación debe empezar en o antes de ese año
    if (endYear && generationStartYear > endYear) {
      return false;
    }

    return true;
  });
};

/**
 * Calcula métricas totales para todas las generaciones y todas las carreras activas
 */
const calculateOverallGrandTotal = (sexFilter?: SexFilter): ReportMetrics => {
  const activeCareers = mockCareers.filter((career) => career.isActive);
  let totalIngreso = 0;
  let totalEgreso = 0;
  let totalTitulados = 0;

  mockGenerations.forEach((generation) => {
    activeCareers.forEach((career) => {
      const metrics = calculateMetricsForCombination(
        generation.id,
        career.id,
        sexFilter
      );
      totalIngreso += metrics.ingreso;
      totalEgreso += metrics.egreso;
      totalTitulados += metrics.titulados;
    });
  });

  return {
    ingreso: totalIngreso,
    egreso: totalEgreso,
    titulados: totalTitulados,
  };
};

export const reportsHandlers = [
  http.post(buildApiUrl('/reports/generate'), async ({ request }) => {
    await delay();

    const body = (await request.json()) as GenerateReportRequest;

    if (
      body.reportType !== 'por-generaciones' &&
      body.reportType !== 'por-carreras'
    ) {
      return HttpResponse.json(
        {
          error: 'Tipo de reporte no soportado en mocks',
          code: 'REPORT_TYPE_NOT_SUPPORTED',
        },
        { status: 400 }
      );
    }

    // Determinar años y carreras según el formato de la petición
    const startYear =
      body.dateRange?.type === 'specific'
        ? body.dateRange.startYear
        : body.startYear;
    const endYear =
      body.dateRange?.type === 'specific'
        ? body.dateRange.endYear
        : body.endYear;
    const careerIds =
      body.careers?.type === 'specific'
        ? body.careers.selected
        : body.careerIds;

    const filteredGenerations = filterGenerationsByYear(startYear, endYear);

    // Obtener filtro de sexo (por defecto 'general')
    const sexFilter: SexFilter = body.sex || 'general';

    // Detectar si es resumen general (todas las generaciones y todas las carreras)
    const isGeneralDateRange =
      body.dateRange?.type === 'general' ||
      (!startYear && !endYear && !body.dateRange);
    const isGeneralCareers =
      body.careers?.type === 'general' || !careerIds || careerIds.length === 0;

    // Si es resumen general, retornar tabla de resumen
    if (isGeneralDateRange && isGeneralCareers) {
      const metrics = calculateOverallGrandTotal(sexFilter);
      const denominator =
        body.graduationRateDenominator === 'ingreso'
          ? metrics.ingreso
          : metrics.egreso;

      // Construir el objeto de datos según el denominador seleccionado
      const responseData: ReportOverallSummaryResponse['data'] =
        body.graduationRateDenominator === 'ingreso'
          ? {
              ingreso: metrics.ingreso,
              titulados: metrics.titulados,
              porcentaje: calculatePercentage(metrics.titulados, denominator),
              ...(body.includeOtherValue ? { egreso: metrics.egreso } : {}),
            }
          : {
              egreso: metrics.egreso,
              titulados: metrics.titulados,
              porcentaje: calculatePercentage(metrics.titulados, denominator),
              ...(body.includeOtherValue ? { ingreso: metrics.ingreso } : {}),
            };

      const response: ReportOverallSummaryResponse = {
        type: body.reportType,
        tableType: 'summary',
        metadata: {
          dateRange: 'general',
          careers: 'general',
          graduationRateDenominator: body.graduationRateDenominator,
          includeOtherValue: body.includeOtherValue,
          generatedAt: new Date().toISOString(),
        },
        data: responseData,
      };

      return HttpResponse.json(response);
    }

    // ===== REPORTE POR CARRERAS =====
    if (body.reportType === 'por-carreras') {
      // Filtrar carreras (si se especificaron, sino todas las activas)
      const filteredCareers =
        careerIds && careerIds.length > 0
          ? mockCareers.filter((career) => careerIds.includes(career.id))
          : mockCareers.filter((career) => career.isActive);

      if (filteredCareers.length === 0) {
        return HttpResponse.json(
          {
            error: 'No se encontraron carreras para el reporte',
            code: 'NO_CAREERS_FOUND',
          },
          { status: 400 }
        );
      }

      const data: ReportByCareersTableResponse['data'] = [];
      const grandTotalsAccumulator = {
        ingreso: 0,
        egreso: 0,
        titulados: 0,
      };

      // Si el rango es "general" (total), solo mostrar totales, no columnas de generaciones
      if (isGeneralDateRange) {
        // Para cada carrera, calcular solo totales (sin valores por generación)
        filteredCareers
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((career) => {
            let careerTotalIngreso = 0;
            let careerTotalEgreso = 0;
            let careerTotalTitulados = 0;

            // Calcular totales sumando todas las generaciones
            mockGenerations.forEach((generation) => {
              const metrics = calculateMetricsForCombination(
                generation.id,
                career.id,
                sexFilter
              );
              careerTotalIngreso += metrics.ingreso;
              careerTotalEgreso += metrics.egreso;
              careerTotalTitulados += metrics.titulados;
            });

            // Calcular porcentaje para la carrera
            const denominator =
              body.graduationRateDenominator === 'ingreso'
                ? careerTotalIngreso
                : careerTotalEgreso;

            const row: ReportByCareersTableResponse['data'][0] = {
              careerId: career.id,
              career: {
                id: career.id,
                name: career.name,
                shortName: career.shortName,
              },
              valuesByGeneration: {}, // Vacío cuando es rango total
              titulados: careerTotalTitulados,
              porcentaje: calculatePercentage(
                careerTotalTitulados,
                denominator
              ),
            };

            // Devolver el valor según el denominador seleccionado
            if (body.graduationRateDenominator === 'ingreso') {
              row.ingreso = careerTotalIngreso;
              // Incluir el valor no seleccionado solo si includeOtherValue es true
              if (body.includeOtherValue) {
                row.egreso = careerTotalEgreso;
              }
            } else {
              row.egreso = careerTotalEgreso;
              // Incluir el valor no seleccionado solo si includeOtherValue es true
              if (body.includeOtherValue) {
                row.ingreso = careerTotalIngreso;
              }
            }

            data.push(row);

            // Acumular para gran total
            grandTotalsAccumulator.ingreso += careerTotalIngreso;
            grandTotalsAccumulator.egreso += careerTotalEgreso;
            grandTotalsAccumulator.titulados += careerTotalTitulados;
          });

        // Calcular gran total
        const grandDenominator =
          body.graduationRateDenominator === 'ingreso'
            ? grandTotalsAccumulator.ingreso
            : grandTotalsAccumulator.egreso;

        const response: ReportByCareersTableResponse = {
          type: 'por-carreras',
          tableType: 'table',
          metadata: {
            startYear: startYear,
            endYear: endYear,
            generationIds: undefined,
            graduationRateDenominator: body.graduationRateDenominator,
            includeOtherValue: body.includeOtherValue,
            generatedAt: new Date().toISOString(),
          },
          data,
          generations: [], // Vacío cuando es rango total
          grandTotal: {
            titulados: grandTotalsAccumulator.titulados,
            porcentaje: calculatePercentage(
              grandTotalsAccumulator.titulados,
              grandDenominator
            ),
            // Devolver el valor según el denominador seleccionado
            ...(body.graduationRateDenominator === 'ingreso'
              ? { ingreso: grandTotalsAccumulator.ingreso }
              : { egreso: grandTotalsAccumulator.egreso }),
            // Incluir el valor no seleccionado solo si includeOtherValue es true
            ...(body.includeOtherValue
              ? body.graduationRateDenominator === 'ingreso'
                ? { egreso: grandTotalsAccumulator.egreso }
                : { ingreso: grandTotalsAccumulator.ingreso }
              : {}),
          },
        };

        return HttpResponse.json(response);
      }

      // Si el rango es específico, mostrar columnas de generaciones + totales
      if (filteredGenerations.length === 0) {
        return HttpResponse.json(
          {
            error: 'No se encontraron generaciones en el rango especificado',
            code: 'NO_GENERATIONS_FOUND',
          },
          { status: 400 }
        );
      }

      // Ordenar generaciones por año
      const sortedGenerations = filteredGenerations.sort(
        (a, b) => a.startYear.getFullYear() - b.startYear.getFullYear()
      );

      // Para cada carrera, calcular valores por generación y totales
      filteredCareers
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((career) => {
          const valuesByGeneration: Record<string, number> = {};
          let careerTotalIngreso = 0;
          let careerTotalEgreso = 0;
          let careerTotalTitulados = 0;

          // Calcular titulados por generación para esta carrera
          sortedGenerations.forEach((generation) => {
            const metrics = calculateMetricsForCombination(
              generation.id,
              career.id,
              sexFilter
            );
            // Solo guardar titulados en valuesByGeneration
            valuesByGeneration[generation.id] = metrics.titulados;

            // Acumular totales de la carrera
            careerTotalIngreso += metrics.ingreso;
            careerTotalEgreso += metrics.egreso;
            careerTotalTitulados += metrics.titulados;
          });

          // Calcular porcentaje para la carrera
          const denominator =
            body.graduationRateDenominator === 'ingreso'
              ? careerTotalIngreso
              : careerTotalEgreso;

          const row: ReportByCareersTableResponse['data'][0] = {
            careerId: career.id,
            career: {
              id: career.id,
              name: career.name,
              shortName: career.shortName,
            },
            valuesByGeneration,
            titulados: careerTotalTitulados,
            porcentaje: calculatePercentage(careerTotalTitulados, denominator),
          };

          // Devolver el valor según el denominador seleccionado
          if (body.graduationRateDenominator === 'ingreso') {
            row.ingreso = careerTotalIngreso;
            // Incluir el valor no seleccionado solo si includeOtherValue es true
            if (body.includeOtherValue) {
              row.egreso = careerTotalEgreso;
            }
          } else {
            row.egreso = careerTotalEgreso;
            // Incluir el valor no seleccionado solo si includeOtherValue es true
            if (body.includeOtherValue) {
              row.ingreso = careerTotalIngreso;
            }
          }

          data.push(row);

          // Acumular para gran total
          grandTotalsAccumulator.ingreso += careerTotalIngreso;
          grandTotalsAccumulator.egreso += careerTotalEgreso;
          grandTotalsAccumulator.titulados += careerTotalTitulados;
        });

      // Calcular gran total
      const grandDenominator =
        body.graduationRateDenominator === 'ingreso'
          ? grandTotalsAccumulator.ingreso
          : grandTotalsAccumulator.egreso;

      const response: ReportByCareersTableResponse = {
        type: 'por-carreras',
        tableType: 'table',
        metadata: {
          startYear: startYear,
          endYear: endYear,
          generationIds: undefined,
          graduationRateDenominator: body.graduationRateDenominator,
          includeOtherValue: body.includeOtherValue,
          generatedAt: new Date().toISOString(),
        },
        data,
        generations: sortedGenerations.map((generation) => {
          const genStartYear = generation.startYear.getFullYear();
          const genEndYear = generation.endYear.getFullYear();
          return {
            id: generation.id,
            name: generation.name ?? `${genStartYear}-${genEndYear}`,
            startYear: String(genStartYear),
            endYear: String(genEndYear),
          };
        }),
        grandTotal: {
          titulados: grandTotalsAccumulator.titulados,
          porcentaje: calculatePercentage(
            grandTotalsAccumulator.titulados,
            grandDenominator
          ),
          // Devolver el valor según el denominador seleccionado
          ...(body.graduationRateDenominator === 'ingreso'
            ? { ingreso: grandTotalsAccumulator.ingreso }
            : { egreso: grandTotalsAccumulator.egreso }),
          // Incluir el valor no seleccionado solo si includeOtherValue es true
          ...(body.includeOtherValue
            ? body.graduationRateDenominator === 'ingreso'
              ? { egreso: grandTotalsAccumulator.egreso }
              : { ingreso: grandTotalsAccumulator.ingreso }
            : {}),
        },
      };

      return HttpResponse.json(response);
    }

    // ===== REPORTE POR GENERACIONES =====
    // Si no hay carreras específicas, generar reporte con tabla normal (totales por generación)
    if (!careerIds || careerIds.length === 0) {
      const data: ReportByGenerationsTableResponse['data'] = [];
      const grandTotalsAccumulator = {
        ingreso: 0,
        egreso: 0,
        titulados: 0,
      };

      filteredGenerations
        .sort((a, b) => a.startYear.getFullYear() - b.startYear.getFullYear())
        .forEach((generation) => {
          const metrics = calculateMetricsForGeneration(
            generation.id,
            sexFilter
          );
          const genStartYear = generation.startYear.getFullYear();
          const genEndYear = generation.endYear.getFullYear();

          const denominator =
            body.graduationRateDenominator === 'ingreso'
              ? metrics.ingreso
              : metrics.egreso;

          const row: ReportByGenerationsTableResponse['data'][0] = {
            generationId: generation.id,
            generation: {
              id: generation.id,
              name: generation.name ?? `${genStartYear}-${genEndYear}`,
              startYear: String(genStartYear),
              endYear: String(genEndYear),
            },
            titulados: metrics.titulados,
            porcentaje: calculatePercentage(metrics.titulados, denominator),
          };

          // Devolver el valor según el denominador seleccionado
          if (body.graduationRateDenominator === 'ingreso') {
            row.ingreso = metrics.ingreso;
            // Incluir el valor no seleccionado solo si includeOtherValue es true
            if (body.includeOtherValue) {
              row.egreso = metrics.egreso;
            }
          } else {
            row.egreso = metrics.egreso;
            // Incluir el valor no seleccionado solo si includeOtherValue es true
            if (body.includeOtherValue) {
              row.ingreso = metrics.ingreso;
            }
          }

          data.push(row);

          grandTotalsAccumulator.ingreso += metrics.ingreso;
          grandTotalsAccumulator.egreso += metrics.egreso;
          grandTotalsAccumulator.titulados += metrics.titulados;
        });

      const grandDenominator =
        body.graduationRateDenominator === 'ingreso'
          ? grandTotalsAccumulator.ingreso
          : grandTotalsAccumulator.egreso;

      const response: ReportByGenerationsTableResponse = {
        type: 'por-generaciones',
        tableType: 'table',
        metadata: {
          startYear: startYear,
          endYear: endYear,
          careerIds: undefined,
          graduationRateDenominator: body.graduationRateDenominator,
          includeOtherValue: body.includeOtherValue,
          generatedAt: new Date().toISOString(),
        },
        data,
        grandTotal: {
          titulados: grandTotalsAccumulator.titulados,
          porcentaje: calculatePercentage(
            grandTotalsAccumulator.titulados,
            grandDenominator
          ),
          // Devolver el valor según el denominador seleccionado
          ...(body.graduationRateDenominator === 'ingreso'
            ? { ingreso: grandTotalsAccumulator.ingreso }
            : { egreso: grandTotalsAccumulator.egreso }),
        },
      };

      return HttpResponse.json(response);
    }

    // Reporte agrupado: carreras específicas
    // En este punto, careerIds debe tener valores (ya se validó arriba)
    if (!careerIds || careerIds.length === 0) {
      return HttpResponse.json(
        {
          error: 'Se requieren carreras específicas para el reporte agrupado',
          code: 'CAREERS_REQUIRED',
        },
        { status: 400 }
      );
    }

    const filteredCareers = mockCareers.filter((career) =>
      careerIds.includes(career.id)
    );

    const data: ReportByGenerationsGroupedResponse['data'] = {};
    const totalsByGeneration: ReportByGenerationsGroupedResponse['totalsByGeneration'] =
      {};
    const totalsByCareer: ReportByGenerationsGroupedResponse['totalsByCareer'] =
      {};

    const grandTotalsAccumulator = {
      ingreso: 0,
      egreso: 0,
      titulados: 0,
    };

    filteredCareers.forEach((career) => {
      totalsByCareer[career.id] = { ingreso: 0, egreso: 0, titulados: 0 };
    });

    filteredGenerations.forEach((generation) => {
      const generationData: Record<string, ReportCareerMetrics | ReportTotals> =
        {};

      let totalIngreso = 0;
      let totalEgreso = 0;
      let totalTitulados = 0;

      filteredCareers.forEach((career) => {
        const metrics = calculateMetricsForCombination(
          generation.id,
          career.id,
          sexFilter
        );

        // Calcular el denominador según el graduationRateDenominator
        const careerDenominator =
          body.graduationRateDenominator === 'ingreso'
            ? metrics.ingreso
            : metrics.egreso;

        // Calcular el porcentaje para esta carrera
        const careerPorcentaje = calculatePercentage(
          metrics.titulados,
          careerDenominator
        );

        // Construir el objeto de métricas según el denominador seleccionado
        const careerMetrics: ReportCareerMetrics = {
          titulados: metrics.titulados,
          porcentaje: careerPorcentaje,
        };

        if (body.graduationRateDenominator === 'ingreso') {
          careerMetrics.ingreso = metrics.ingreso;
          if (body.includeOtherValue) {
            careerMetrics.egreso = metrics.egreso;
          }
        } else {
          careerMetrics.egreso = metrics.egreso;
          if (body.includeOtherValue) {
            careerMetrics.ingreso = metrics.ingreso;
          }
        }

        generationData[career.id] = careerMetrics;

        totalIngreso += metrics.ingreso;
        totalEgreso += metrics.egreso;
        totalTitulados += metrics.titulados;

        totalsByCareer[career.id].ingreso += metrics.ingreso;
        totalsByCareer[career.id].egreso += metrics.egreso;
        totalsByCareer[career.id].titulados += metrics.titulados;
      });

      const denominator =
        body.graduationRateDenominator === 'ingreso'
          ? totalIngreso
          : totalEgreso;

      // Construir totals según el denominador seleccionado
      const totals: ReportTotals =
        body.graduationRateDenominator === 'ingreso'
          ? {
              ingreso: totalIngreso,
              titulados: totalTitulados,
              porcentaje: calculatePercentage(totalTitulados, denominator),
              ...(body.includeOtherValue ? { egreso: totalEgreso } : {}),
            }
          : {
              egreso: totalEgreso,
              titulados: totalTitulados,
              porcentaje: calculatePercentage(totalTitulados, denominator),
              ...(body.includeOtherValue ? { ingreso: totalIngreso } : {}),
            };

      data[generation.id] = {
        ...generationData,
        totales: totals,
      };

      totalsByGeneration[generation.id] = totals;

      grandTotalsAccumulator.ingreso += totalIngreso;
      grandTotalsAccumulator.egreso += totalEgreso;
      grandTotalsAccumulator.titulados += totalTitulados;
    });

    const grandDenominator =
      body.graduationRateDenominator === 'ingreso'
        ? grandTotalsAccumulator.ingreso
        : grandTotalsAccumulator.egreso;

    const response: ReportByGenerationsGroupedResponse = {
      type: 'por-generaciones',
      tableType: 'grouped',
      metadata: {
        startYear: startYear,
        endYear: endYear,
        careerIds: careerIds,
        graduationRateDenominator: body.graduationRateDenominator,
        includeOtherValue: body.includeOtherValue,
        generatedAt: new Date().toISOString(),
      },
      data,
      generations: filteredGenerations
        .sort((a, b) => a.startYear.getFullYear() - b.startYear.getFullYear())
        .map((generation) => {
          const genStartYear = generation.startYear.getFullYear();
          const genEndYear = generation.endYear.getFullYear();
          return {
            id: generation.id,
            name: generation.name ?? `${genStartYear}-${genEndYear}`,
            startYear: String(genStartYear),
            endYear: String(genEndYear),
          };
        }),
      careers: filteredCareers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((career) => ({
          id: career.id,
          name: career.name,
          shortName: career.shortName,
        })),
      totalsByGeneration,
      totalsByCareer,
      grandTotal: {
        titulados: grandTotalsAccumulator.titulados,
        porcentaje: calculatePercentage(
          grandTotalsAccumulator.titulados,
          grandDenominator
        ),
        // Devolver el valor según el denominador seleccionado
        ...(body.graduationRateDenominator === 'ingreso'
          ? { ingreso: grandTotalsAccumulator.ingreso }
          : { egreso: grandTotalsAccumulator.egreso }),
        // Incluir el valor no seleccionado solo si includeOtherValue es true
        ...(body.includeOtherValue
          ? body.graduationRateDenominator === 'ingreso'
            ? { egreso: grandTotalsAccumulator.egreso }
            : { ingreso: grandTotalsAccumulator.ingreso }
          : {}),
      },
    };

    return HttpResponse.json(response);
  }),
];
