import { GenerationModel } from '@backend/generations';
import { CareerModel } from '@backend/careers';
import { NewAdmissionModel } from '@backend/new-admissions';
import { StudentModel } from '@backend/students';
import { AppError } from '@backend/shared';
import type { GenerateReportInput } from './schemas/reports.schemas.js';

type ReportType = 'por-generaciones' | 'por-carreras';
type GraduationRateDenominator = 'ingreso' | 'egreso';
type SexFilter = 'general' | 'MASCULINO' | 'FEMENINO';

interface ReportMetrics {
  ingreso: number;
  egreso: number;
  titulados: number;
}

interface ReportTotals {
  titulados: number;
  porcentaje: number;
  ingreso?: number;
  egreso?: number;
}

interface ReportCareerMetrics {
  titulados: number;
  porcentaje: number;
  ingreso?: number;
  egreso?: number;
}

interface ReportGeneration {
  id: string;
  name: string;
  startYear: string;
  endYear: string;
}

type GenerationDoc = {
  _id: { toString(): string };
  name: string | null;
  startYear: Date;
  endYear: Date;
};

type CareerDoc = {
  _id: { toString(): string };
  name: string;
  shortName: string;
  isActive: boolean;
};

type AdmissionDoc = {
  _id: { toString(): string };
  generationId: { toString(): string };
  careerId: { toString(): string };
  maleCount: number;
  femaleCount: number;
  isActive: boolean;
};

type StudentDoc = {
  _id: { toString(): string };
  generationId: { toString(): string };
  careerId: { toString(): string };
  sex: string;
  isEgressed: boolean;
  processStatus: string;
};

function calculatePercentage(titulados: number, denominador: number): number {
  if (denominador <= 0) return 0;
  return Number(((titulados / denominador) * 100).toFixed(2));
}

function buildGenerationInfo(gen: GenerationDoc): ReportGeneration {
  const sy = gen.startYear.getFullYear();
  const ey = gen.endYear.getFullYear();
  return {
    id: gen._id.toString(),
    name: gen.name ?? `${sy}-${ey}`,
    startYear: String(sy),
    endYear: String(ey),
  };
}

function calcMetrics(
  generationId: string,
  careerId: string,
  admissions: AdmissionDoc[],
  students: StudentDoc[],
  sexFilter: SexFilter
): ReportMetrics {
  const ingreso = admissions
    .filter(
      (a) =>
        a.isActive &&
        a.generationId.toString() === generationId &&
        a.careerId.toString() === careerId
    )
    .reduce((sum, a) => {
      if (sexFilter === 'general') return sum + a.maleCount + a.femaleCount;
      if (sexFilter === 'MASCULINO') return sum + a.maleCount;
      return sum + a.femaleCount;
    }, 0);

  const egreso = students.filter(
    (s) =>
      s.generationId.toString() === generationId &&
      s.careerId.toString() === careerId &&
      s.isEgressed &&
      (sexFilter === 'general' || s.sex === sexFilter)
  ).length;

  const titulados = students.filter(
    (s) =>
      s.generationId.toString() === generationId &&
      s.careerId.toString() === careerId &&
      s.processStatus === 'GRADUATED' &&
      (sexFilter === 'general' || s.sex === sexFilter)
  ).length;

  return { ingreso, egreso, titulados };
}

function buildTotals(
  metrics: ReportMetrics,
  denom: GraduationRateDenominator,
  includeOtherValue: boolean
): ReportTotals {
  const denominador = denom === 'ingreso' ? metrics.ingreso : metrics.egreso;
  const base: ReportTotals = {
    titulados: metrics.titulados,
    porcentaje: calculatePercentage(metrics.titulados, denominador),
  };
  if (denom === 'ingreso') {
    base.ingreso = metrics.ingreso;
    if (includeOtherValue) base.egreso = metrics.egreso;
  } else {
    base.egreso = metrics.egreso;
    if (includeOtherValue) base.ingreso = metrics.ingreso;
  }
  return base;
}

function buildCareerMetrics(
  metrics: ReportMetrics,
  denom: GraduationRateDenominator,
  includeOtherValue: boolean
): ReportCareerMetrics {
  const denominador = denom === 'ingreso' ? metrics.ingreso : metrics.egreso;
  const base: ReportCareerMetrics = {
    titulados: metrics.titulados,
    porcentaje: calculatePercentage(metrics.titulados, denominador),
  };
  if (denom === 'ingreso') {
    base.ingreso = metrics.ingreso;
    if (includeOtherValue) base.egreso = metrics.egreso;
  } else {
    base.egreso = metrics.egreso;
    if (includeOtherValue) base.ingreso = metrics.ingreso;
  }
  return base;
}

function accumulateMetrics(
  acc: ReportMetrics,
  m: ReportMetrics
): ReportMetrics {
  return {
    ingreso: acc.ingreso + m.ingreso,
    egreso: acc.egreso + m.egreso,
    titulados: acc.titulados + m.titulados,
  };
}

export class ReportsService {
  constructor(
    private readonly newAdmissionModel: typeof NewAdmissionModel,
    private readonly studentModel: typeof StudentModel,
    private readonly generationModel: typeof GenerationModel,
    private readonly careerModel: typeof CareerModel
  ) {}

  async generateReport(input: GenerateReportInput) {
    const startYear =
      input.dateRange?.type === 'specific'
        ? input.dateRange.startYear
        : input.startYear;
    const endYear =
      input.dateRange?.type === 'specific'
        ? input.dateRange.endYear
        : input.endYear;
    const careerIds =
      input.careers?.type === 'specific'
        ? input.careers.selected
        : input.careerIds;

    const sexFilter: SexFilter = input.sex ?? 'general';
    const denom = input.graduationRateDenominator;
    const includeOtherValue = input.includeOtherValue;
    const reportType: ReportType = input.reportType;

    const isGeneralDateRange =
      input.dateRange?.type === 'general' ||
      (!startYear && !endYear && !input.dateRange);
    const isGeneralCareers =
      input.careers?.type === 'general' || !careerIds || careerIds.length === 0;

    // Fetch all generations and filter
    const allGenerations = (await this.generationModel
      .find({})
      .lean()) as GenerationDoc[];

    const filteredGenerations = isGeneralDateRange
      ? allGenerations
      : allGenerations.filter((gen) => {
          const genStartYear = gen.startYear.getFullYear();
          if (startYear !== undefined && genStartYear < startYear) return false;
          if (endYear !== undefined && genStartYear > endYear) return false;
          return true;
        });

    // Fetch all careers and filter
    const allCareers = (await this.careerModel.find({}).lean()) as CareerDoc[];

    const filteredCareers: CareerDoc[] = isGeneralCareers
      ? allCareers.filter((c) => c.isActive)
      : allCareers.filter((c) => (careerIds ?? []).includes(c._id.toString()));

    const [admissions, students] = await Promise.all([
      this.newAdmissionModel.find({ isActive: true }).lean() as Promise<
        AdmissionDoc[]
      >,
      this.studentModel.find({}).lean() as Promise<StudentDoc[]>,
    ]);

    // ===== SUMMARY (both general) =====
    if (isGeneralDateRange && isGeneralCareers) {
      let grand: ReportMetrics = { ingreso: 0, egreso: 0, titulados: 0 };
      for (const gen of allGenerations) {
        for (const career of allCareers.filter((c) => c.isActive)) {
          grand = accumulateMetrics(
            grand,
            calcMetrics(
              gen._id.toString(),
              career._id.toString(),
              admissions,
              students,
              sexFilter
            )
          );
        }
      }
      const denominador = denom === 'ingreso' ? grand.ingreso : grand.egreso;
      const data: Record<string, unknown> = {
        titulados: grand.titulados,
        porcentaje: calculatePercentage(grand.titulados, denominador),
      };
      if (denom === 'ingreso') {
        data.ingreso = grand.ingreso;
        if (includeOtherValue) data.egreso = grand.egreso;
      } else {
        data.egreso = grand.egreso;
        if (includeOtherValue) data.ingreso = grand.ingreso;
      }
      return {
        type: reportType,
        tableType: 'summary' as const,
        metadata: {
          dateRange: 'general' as const,
          careers: 'general' as const,
          graduationRateDenominator: denom,
          includeOtherValue,
          generatedAt: new Date().toISOString(),
        },
        data,
      };
    }

    // ===== POR CARRERAS =====
    if (reportType === 'por-carreras') {
      if (filteredCareers.length === 0) {
        throw new AppError(
          400,
          'NO_CAREERS_FOUND',
          'No se encontraron carreras para el reporte'
        );
      }

      const sortedCareers = [...filteredCareers].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      const grandAcc: ReportMetrics = { ingreso: 0, egreso: 0, titulados: 0 };

      // If dateRange is general — totals only, no generation columns
      if (isGeneralDateRange) {
        const data = sortedCareers.map((career) => {
          let careerTotals: ReportMetrics = {
            ingreso: 0,
            egreso: 0,
            titulados: 0,
          };
          for (const gen of allGenerations) {
            careerTotals = accumulateMetrics(
              careerTotals,
              calcMetrics(
                gen._id.toString(),
                career._id.toString(),
                admissions,
                students,
                sexFilter
              )
            );
          }
          grandAcc.ingreso += careerTotals.ingreso;
          grandAcc.egreso += careerTotals.egreso;
          grandAcc.titulados += careerTotals.titulados;

          const row: Record<string, unknown> = {
            careerId: career._id.toString(),
            career: {
              id: career._id.toString(),
              name: career.name,
              shortName: career.shortName,
            },
            valuesByGeneration: {},
            titulados: careerTotals.titulados,
            porcentaje: calculatePercentage(
              careerTotals.titulados,
              denom === 'ingreso' ? careerTotals.ingreso : careerTotals.egreso
            ),
          };
          if (denom === 'ingreso') {
            row.ingreso = careerTotals.ingreso;
            if (includeOtherValue) row.egreso = careerTotals.egreso;
          } else {
            row.egreso = careerTotals.egreso;
            if (includeOtherValue) row.ingreso = careerTotals.ingreso;
          }
          return row;
        });

        const grandDenom =
          denom === 'ingreso' ? grandAcc.ingreso : grandAcc.egreso;
        const grandTotal: ReportTotals = {
          titulados: grandAcc.titulados,
          porcentaje: calculatePercentage(grandAcc.titulados, grandDenom),
        };
        if (denom === 'ingreso') {
          grandTotal.ingreso = grandAcc.ingreso;
          if (includeOtherValue) grandTotal.egreso = grandAcc.egreso;
        } else {
          grandTotal.egreso = grandAcc.egreso;
          if (includeOtherValue) grandTotal.ingreso = grandAcc.ingreso;
        }

        return {
          type: 'por-carreras' as const,
          tableType: 'table' as const,
          metadata: {
            startYear,
            endYear,
            generationIds: undefined,
            graduationRateDenominator: denom,
            includeOtherValue,
            generatedAt: new Date().toISOString(),
          },
          data,
          generations: [],
          grandTotal,
        };
      }

      // Specific date range — show generation columns
      if (filteredGenerations.length === 0) {
        throw new AppError(
          400,
          'NO_GENERATIONS_FOUND',
          'No se encontraron generaciones en el rango especificado'
        );
      }

      const sortedGenerations = [...filteredGenerations].sort(
        (a, b) => a.startYear.getFullYear() - b.startYear.getFullYear()
      );

      const data = sortedCareers.map((career) => {
        const valuesByGeneration: Record<string, number> = {};
        let careerTotals: ReportMetrics = {
          ingreso: 0,
          egreso: 0,
          titulados: 0,
        };

        for (const gen of sortedGenerations) {
          const m = calcMetrics(
            gen._id.toString(),
            career._id.toString(),
            admissions,
            students,
            sexFilter
          );
          valuesByGeneration[gen._id.toString()] = m.titulados;
          careerTotals = accumulateMetrics(careerTotals, m);
        }

        grandAcc.ingreso += careerTotals.ingreso;
        grandAcc.egreso += careerTotals.egreso;
        grandAcc.titulados += careerTotals.titulados;

        const row: Record<string, unknown> = {
          careerId: career._id.toString(),
          career: {
            id: career._id.toString(),
            name: career.name,
            shortName: career.shortName,
          },
          valuesByGeneration,
          titulados: careerTotals.titulados,
          porcentaje: calculatePercentage(
            careerTotals.titulados,
            denom === 'ingreso' ? careerTotals.ingreso : careerTotals.egreso
          ),
        };
        if (denom === 'ingreso') {
          row.ingreso = careerTotals.ingreso;
          if (includeOtherValue) row.egreso = careerTotals.egreso;
        } else {
          row.egreso = careerTotals.egreso;
          if (includeOtherValue) row.ingreso = careerTotals.ingreso;
        }
        return row;
      });

      const grandDenom =
        denom === 'ingreso' ? grandAcc.ingreso : grandAcc.egreso;
      const grandTotal: ReportTotals = {
        titulados: grandAcc.titulados,
        porcentaje: calculatePercentage(grandAcc.titulados, grandDenom),
      };
      if (denom === 'ingreso') {
        grandTotal.ingreso = grandAcc.ingreso;
        if (includeOtherValue) grandTotal.egreso = grandAcc.egreso;
      } else {
        grandTotal.egreso = grandAcc.egreso;
        if (includeOtherValue) grandTotal.ingreso = grandAcc.ingreso;
      }

      return {
        type: 'por-carreras' as const,
        tableType: 'table' as const,
        metadata: {
          startYear,
          endYear,
          generationIds: undefined,
          graduationRateDenominator: denom,
          includeOtherValue,
          generatedAt: new Date().toISOString(),
        },
        data,
        generations: sortedGenerations.map(buildGenerationInfo),
        grandTotal,
      };
    }

    // ===== POR GENERACIONES =====
    // No specific careers => flat table
    if (isGeneralCareers) {
      if (filteredGenerations.length === 0) {
        throw new AppError(
          400,
          'NO_GENERATIONS_FOUND',
          'No se encontraron generaciones en el rango especificado'
        );
      }

      const sortedGenerations = [...filteredGenerations].sort(
        (a, b) => a.startYear.getFullYear() - b.startYear.getFullYear()
      );

      const activeCareers = allCareers.filter((c) => c.isActive);
      const grandAcc: ReportMetrics = { ingreso: 0, egreso: 0, titulados: 0 };

      const data = sortedGenerations.map((gen) => {
        let genTotals: ReportMetrics = { ingreso: 0, egreso: 0, titulados: 0 };
        for (const career of activeCareers) {
          genTotals = accumulateMetrics(
            genTotals,
            calcMetrics(
              gen._id.toString(),
              career._id.toString(),
              admissions,
              students,
              sexFilter
            )
          );
        }
        grandAcc.ingreso += genTotals.ingreso;
        grandAcc.egreso += genTotals.egreso;
        grandAcc.titulados += genTotals.titulados;

        const row: Record<string, unknown> = {
          generationId: gen._id.toString(),
          generation: buildGenerationInfo(gen),
          titulados: genTotals.titulados,
          porcentaje: calculatePercentage(
            genTotals.titulados,
            denom === 'ingreso' ? genTotals.ingreso : genTotals.egreso
          ),
        };
        if (denom === 'ingreso') {
          row.ingreso = genTotals.ingreso;
          if (includeOtherValue) row.egreso = genTotals.egreso;
        } else {
          row.egreso = genTotals.egreso;
          if (includeOtherValue) row.ingreso = genTotals.ingreso;
        }
        return row;
      });

      const grandDenom =
        denom === 'ingreso' ? grandAcc.ingreso : grandAcc.egreso;
      const grandTotal: ReportTotals = {
        titulados: grandAcc.titulados,
        porcentaje: calculatePercentage(grandAcc.titulados, grandDenom),
      };
      if (denom === 'ingreso') {
        grandTotal.ingreso = grandAcc.ingreso;
      } else {
        grandTotal.egreso = grandAcc.egreso;
      }

      return {
        type: reportType,
        tableType: 'table' as const,
        metadata: {
          startYear,
          endYear,
          careerIds: undefined,
          graduationRateDenominator: denom,
          includeOtherValue,
          generatedAt: new Date().toISOString(),
        },
        data,
        grandTotal,
      };
    }

    // Specific careers => grouped response
    const groupedCareers = filteredCareers;

    const data: Record<string, Record<string, unknown>> = {};
    const totalsByGeneration: Record<string, ReportTotals> = {};
    const totalsByCareer: Record<string, ReportMetrics> = {};
    const grandAcc: ReportMetrics = { ingreso: 0, egreso: 0, titulados: 0 };

    for (const career of groupedCareers) {
      totalsByCareer[career._id.toString()] = {
        ingreso: 0,
        egreso: 0,
        titulados: 0,
      };
    }

    for (const gen of filteredGenerations) {
      const genId = gen._id.toString();
      const generationData: Record<string, unknown> = {};
      let genTotals: ReportMetrics = { ingreso: 0, egreso: 0, titulados: 0 };

      for (const career of groupedCareers) {
        const careerId = career._id.toString();
        const m = calcMetrics(genId, careerId, admissions, students, sexFilter);
        generationData[careerId] = buildCareerMetrics(
          m,
          denom,
          includeOtherValue
        );
        genTotals = accumulateMetrics(genTotals, m);

        const tc = totalsByCareer[careerId];
        if (tc) {
          tc.ingreso += m.ingreso;
          tc.egreso += m.egreso;
          tc.titulados += m.titulados;
        }
      }

      const totals = buildTotals(genTotals, denom, includeOtherValue);
      generationData.totales = totals;
      data[genId] = generationData;
      totalsByGeneration[genId] = totals;

      grandAcc.ingreso += genTotals.ingreso;
      grandAcc.egreso += genTotals.egreso;
      grandAcc.titulados += genTotals.titulados;
    }

    const sortedGenerations = [...filteredGenerations].sort(
      (a, b) => a.startYear.getFullYear() - b.startYear.getFullYear()
    );

    const grandTotal = buildTotals(grandAcc, denom, includeOtherValue);

    return {
      type: reportType,
      tableType: 'grouped' as const,
      metadata: {
        startYear,
        endYear,
        careerIds: careerIds ?? [],
        graduationRateDenominator: denom,
        includeOtherValue,
        generatedAt: new Date().toISOString(),
      },
      data,
      generations: sortedGenerations.map(buildGenerationInfo),
      careers: [...groupedCareers]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({
          id: c._id.toString(),
          name: c.name,
          shortName: c.shortName,
        })),
      totalsByGeneration,
      totalsByCareer,
      grandTotal,
    };
  }
}
