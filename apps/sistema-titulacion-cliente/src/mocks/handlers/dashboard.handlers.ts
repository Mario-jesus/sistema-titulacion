import { http, HttpResponse } from 'msw';
import { buildApiUrl, delay } from '../utils';
import { mockStudents } from '../data/students';
import { mockQuotas } from '../data/quotas';
import { mockGenerations } from '../data/generations';
import { mockCareers } from '../data/careers';
import { StudentStatus, StudentProcessStatus } from '@entities/student';

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

  // Estudiantes en proceso - NUEVA LÓGICA
  const inProgress = mockStudents.filter(
    (student) => student.processStatus === StudentProcessStatus.IN_PROCESS
  ).length;

  // Estudiantes programados - NUEVA LÓGICA
  const scheduled = mockStudents.filter(
    (student) => student.processStatus === StudentProcessStatus.SCHEDULED
  ).length;

  // Estudiantes graduados - NUEVA LÓGICA
  const graduatedStudents = mockStudents.filter(
    (student) => student.processStatus === StudentProcessStatus.GRADUATED
  ).length;

  // Estudiantes egresados
  const egressedStudents = mockStudents.filter(
    (student) => student.isEgressed === true
  ).length;

  // Total de ingresos (suma de newAdmissionQuotas)
  const totalAdmissions = mockQuotas.reduce(
    (sum, quota) =>
      sum + quota.newAdmissionQuotasMale + quota.newAdmissionQuotasFemale,
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
    // Calcular ingresos (suma de newAdmissionQuotasMale + newAdmissionQuotasFemale para esta generación)
    const admissions = mockQuotas
      .filter((quota) => quota.generationId === generation.id)
      .reduce(
        (sum, quota) =>
          sum + quota.newAdmissionQuotasMale + quota.newAdmissionQuotasFemale,
        0
      );

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
  // Total de ingresos (suma de newAdmissionQuotasMale + newAdmissionQuotasFemale)
  const totalAdmissions = mockQuotas.reduce(
    (sum, quota) =>
      sum + quota.newAdmissionQuotasMale + quota.newAdmissionQuotasFemale,
    0
  );

  // Total de egresos (estudiantes egresados)
  const totalEgresses = mockStudents.filter(
    (student) => student.isEgressed === true
  ).length;

  // Total de titulados - NUEVA LÓGICA
  const totalTitulados = mockStudents.filter(
    (student) => student.processStatus === StudentProcessStatus.GRADUATED
  ).length;

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
