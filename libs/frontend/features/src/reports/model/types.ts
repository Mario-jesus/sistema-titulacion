/**
 * Tipos e interfaces para el módulo de Reportes
 */

import type { Sex } from '@entities/student';

export type ReportType = 'por-generaciones' | 'por-carreras';
export type GraduationRateDenominator = 'ingreso' | 'egreso';
export type SexFilter = 'general' | Sex.MASCULINO | Sex.FEMENINO;

/**
 * Request para generar un reporte
 */
export interface GenerateReportRequest {
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
  sex?: SexFilter;
}

/**
 * Métricas básicas de reporte
 */
export interface ReportMetrics {
  ingreso: number;
  egreso: number;
  titulados: number;
}

/**
 * Totales de reporte
 */
export interface ReportTotals {
  titulados: number;
  porcentaje: number;
  // El valor del denominador siempre está presente
  ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
  egreso?: number; // Presente si graduationRateDenominator === 'egreso'
  // El valor no seleccionado solo está presente si includeOtherValue es true
}

/**
 * Métricas por carrera en reporte agrupado
 */
export interface ReportCareerMetrics {
  titulados: number;
  porcentaje: number; // Porcentaje calculado según el graduationRateDenominator
  // El valor del denominador siempre está presente
  ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
  egreso?: number; // Presente si graduationRateDenominator === 'egreso'
  // El valor no seleccionado solo está presente si includeOtherValue es true
}

/**
 * Fila de datos para reporte agrupado por generaciones
 */
export type ReportGenerationRow = Record<
  string,
  ReportCareerMetrics | ReportTotals
> & {
  totales: ReportTotals;
};

/**
 * Información de generación en reportes
 */
export interface ReportGeneration {
  id: string;
  name: string;
  startYear: string;
  endYear: string;
}

/**
 * Información de carrera en reportes
 */
export interface ReportCareer {
  id: string;
  name: string;
  shortName: string;
}

/**
 * Respuesta para reporte agrupado por generaciones (con carreras específicas)
 */
export interface ReportByGenerationsGroupedResponse {
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
  generations: ReportGeneration[];
  careers: ReportCareer[];
  totalsByGeneration: Record<string, ReportTotals>;
  totalsByCareer: Record<string, ReportMetrics>;
  grandTotal: ReportTotals;
}

/**
 * Respuesta para reporte por generaciones (tabla plana, todas las carreras)
 */
export interface ReportByGenerationsTableResponse {
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
    generation: ReportGeneration;
    titulados: number;
    porcentaje: number;
    // El valor del denominador siempre está presente
    ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
    egreso?: number; // Presente si graduationRateDenominator === 'egreso'
    // El valor no seleccionado solo está presente si includeOtherValue es true
  }>;
  grandTotal: ReportTotals;
}

/**
 * Respuesta para reporte de resumen general (todas las generaciones y carreras)
 */
export interface ReportOverallSummaryResponse {
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

/**
 * Respuesta para reporte por carreras (tabla plana)
 */
export interface ReportByCareersTableResponse {
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
    career: ReportCareer;
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
  generations: ReportGeneration[];
  grandTotal: {
    titulados: number;
    porcentaje: number;
    // El valor del denominador siempre está presente
    ingreso?: number; // Presente si graduationRateDenominator === 'ingreso'
    egreso?: number; // Presente si graduationRateDenominator === 'egreso'
    // El valor no seleccionado solo está presente si includeOtherValue es true
  };
}

/**
 * Unión de todos los tipos de respuesta de reportes
 */
export type ReportResponse =
  | ReportByGenerationsGroupedResponse
  | ReportByGenerationsTableResponse
  | ReportOverallSummaryResponse
  | ReportByCareersTableResponse;
