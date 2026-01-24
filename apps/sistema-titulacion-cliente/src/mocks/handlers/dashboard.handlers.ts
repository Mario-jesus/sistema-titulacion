import { http, HttpResponse } from 'msw';
import { buildApiUrl, delay } from '../utils';
import { mockStudents } from '../data/students';
import { mockQuotas } from '../data/quotas';
import { mockGenerations } from '../data/generations';
import { mockCareers } from '../data/careers';
import { findGraduationByStudentId } from '../data/graduations';
import { findCapturedFieldsByStudentId } from '../data/captured-fields';
import { StudentStatus } from '@entities/student';

/**
 * Handlers para endpoints del dashboard
 */

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  inProgress: number;
  scheduled: number;
  graduatedStudents: number;
  egressedStudents: number;
  totalAdmissions: number;
  totalEgresses: number;
  egressRate: number;
  graduationRate: number;
}

interface IngressEgressByGeneration {
  generation: string;
  generationId: string;
  admissions: number;
  egresses: number;
}

interface StatusDistribution {
  name: string;
  value: number;
}

interface StudentsByCareer {
  career: string;
  careerId: string;
  students: number;
}

interface RecentStudent {
  id: string;
  fullName: string;
  career: string;
  careerId: string;
  createdAt: string;
}

interface DashboardResponse {
  stats: DashboardStats;
  ingressEgressByGeneration: IngressEgressByGeneration[];
  statusDistribution: StatusDistribution[];
  studentsByCareer: StudentsByCareer[];
  recentStudents: RecentStudent[];
}

/**
 * Calcula las estadísticas del dashboard
 */
function calculateDashboardStats(): DashboardStats {
  // Total de estudiantes
  const totalStudents = mockStudents.length;

  // Estudiantes activos
  const activeStudents = mockStudents.filter(
    (student) => student.status === StudentStatus.ACTIVO
  ).length;

  // Estudiantes en proceso
  // Un estudiante está en proceso si:
  // 1. Tiene status ACTIVO
  // 2. No está titulado (no tiene Graduation o isGraduated=false)
  // 3. No tiene datos en CapturedFields O no tiene datos en Graduation
  const inProgress = mockStudents.filter((student) => {
    if (student.status !== StudentStatus.ACTIVO) {
      return false;
    }

    const graduation = findGraduationByStudentId(student.id);
    if (graduation && graduation.isGraduated === true) {
      return false;
    }

    const capturedFields = findCapturedFieldsByStudentId(student.id);
    const hasCapturedFields = capturedFields !== null;
    const hasGraduation = graduation !== null;

    // Si tiene datos en ambas tablas, aunque no esté titulado, NO es un estudiante en proceso
    if (hasCapturedFields && hasGraduation) {
      return false;
    }

    return true;
  }).length;

  // Estudiantes programados
  // Un estudiante está programado si:
  // 1. Tiene status ACTIVO
  // 2. No está titulado (isGraduated=false)
  // 3. Ya tiene datos en AMBAS tablas: Graduation Y CapturedFields
  const scheduled = mockStudents.filter((student) => {
    if (student.status !== StudentStatus.ACTIVO) {
      return false;
    }

    const graduation = findGraduationByStudentId(student.id);
    if (graduation && graduation.isGraduated === true) {
      return false;
    }

    const capturedFields = findCapturedFieldsByStudentId(student.id);
    const hasCapturedFields = capturedFields !== null;
    const hasGraduation = graduation !== null;

    return hasCapturedFields && hasGraduation;
  }).length;

  // Estudiantes graduados
  const graduatedStudents = mockStudents.filter((student) => {
    const graduation = findGraduationByStudentId(student.id);
    return graduation !== undefined && graduation.isGraduated === true;
  }).length;

  // Estudiantes egresados
  const egressedStudents = mockStudents.filter(
    (student) => student.isEgressed === true
  ).length;

  // Total de ingresos (suma de newAdmissionQuotas)
  const totalAdmissions = mockQuotas.reduce(
    (sum, quota) => sum + quota.newAdmissionQuotas,
    0
  );

  // Total de egresos (contar estudiantes egresados)
  const totalEgresses = egressedStudents;

  // Tasa de egreso (egresos / ingresos * 100)
  const egressRate =
    totalAdmissions > 0 ? (totalEgresses / totalAdmissions) * 100 : 0;

  // Tasa de titulación (graduados / egresados * 100)
  const graduationRate =
    totalEgresses > 0 ? (graduatedStudents / totalEgresses) * 100 : 0;

  return {
    totalStudents,
    activeStudents,
    inProgress,
    scheduled,
    graduatedStudents,
    egressedStudents,
    totalAdmissions,
    totalEgresses,
    egressRate: Number(egressRate.toFixed(2)),
    graduationRate: Number(graduationRate.toFixed(2)),
  };
}

/**
 * Calcula ingreso vs egreso por generación
 */
function calculateIngressEgressByGeneration(): IngressEgressByGeneration[] {
  const result: Map<string, IngressEgressByGeneration> = new Map();

  // Agrupar por generación
  mockGenerations.forEach((generation) => {
    // Calcular ingresos (suma de newAdmissionQuotas para esta generación)
    const admissions = mockQuotas
      .filter((quota) => quota.generationId === generation.id)
      .reduce((sum, quota) => sum + quota.newAdmissionQuotas, 0);

    // Calcular egresos (estudiantes egresados de esta generación)
    const egresses = mockStudents.filter(
      (student) =>
        student.generationId === generation.id && student.isEgressed === true
    ).length;

    // Formato: "startYear-endYear"
    const startYear = generation.startYear.getFullYear();
    const endYear = generation.endYear.getFullYear();
    const generationLabel = `${startYear}-${endYear}`;

    result.set(generation.id, {
      generation: generationLabel,
      generationId: generation.id,
      admissions,
      egresses,
    });
  });

  return Array.from(result.values())
    .sort((a, b) => {
      // Ordenar por año de inicio (ascendente)
      const aStartYear = parseInt(a.generation.split('-')[0] || '0', 10);
      const bStartYear = parseInt(b.generation.split('-')[0] || '0', 10);
      return aStartYear - bStartYear;
    })
    .slice(-6); // Máximo 6 generaciones más recientes
}

/**
 * Calcula la distribución: Ingreso, Egreso y Titulación
 */
function calculateStatusDistribution(): StatusDistribution[] {
  // Total de ingresos (suma de newAdmissionQuotas)
  const totalAdmissions = mockQuotas.reduce(
    (sum, quota) => sum + quota.newAdmissionQuotas,
    0
  );

  // Total de egresos (estudiantes egresados)
  const totalEgresses = mockStudents.filter(
    (student) => student.isEgressed === true
  ).length;

  // Total de titulados (estudiantes con isGraduated = true)
  const totalTitulados = mockStudents.filter((student) => {
    const graduation = findGraduationByStudentId(student.id);
    return graduation !== undefined && graduation.isGraduated === true;
  }).length;

  return [
    { name: 'Ingreso', value: totalAdmissions },
    { name: 'Egreso', value: totalEgresses },
    { name: 'Titulados', value: totalTitulados },
  ];
}

/**
 * Calcula estudiantes por carrera (Top 6)
 */
function calculateStudentsByCareer(): StudentsByCareer[] {
  const careerCounts = new Map<string, number>();

  mockStudents.forEach((student) => {
    const count = careerCounts.get(student.careerId) || 0;
    careerCounts.set(student.careerId, count + 1);
  });

  return Array.from(careerCounts.entries())
    .map(([careerId, students]) => {
      const career = mockCareers.find((c) => c.id === careerId);
      return {
        career: (career?.name ?? careerId) as string,
        careerId,
        students,
      };
    })
    .sort((a, b) => b.students - a.students)
    .slice(0, 6);
}

/**
 * Obtiene los últimos estudiantes agregados (Top 5)
 */
function getRecentStudents(): RecentStudent[] {
  return mockStudents
    .slice()
    .sort((a, b) => {
      // Ordenar por createdAt descendente (más recientes primero)
      const dateA =
        a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB =
        b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5)
    .map((student) => {
      const career = mockCareers.find((c) => c.id === student.careerId);
      const fullName =
        `${student.firstName} ${student.paternalLastName} ${student.maternalLastName}`.trim();
      const createdAt = student.createdAt.toISOString();

      return {
        id: student.id,
        fullName,
        career: (career?.name ?? student.careerId) as string,
        careerId: student.careerId,
        createdAt,
      };
    });
}

/**
 * GET /dashboard
 */
export const dashboardHandlers = [
  http.get(buildApiUrl('/dashboard'), async () => {
    await delay();

    const stats = calculateDashboardStats();
    const ingressEgressByGeneration = calculateIngressEgressByGeneration();
    const statusDistribution = calculateStatusDistribution();
    const studentsByCareer = calculateStudentsByCareer();
    const recentStudents = getRecentStudents();

    const response: DashboardResponse = {
      stats,
      ingressEgressByGeneration,
      statusDistribution,
      studentsByCareer,
      recentStudents,
    };

    return HttpResponse.json(response);
  }),
];
