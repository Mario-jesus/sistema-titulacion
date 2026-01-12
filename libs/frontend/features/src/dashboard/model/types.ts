/**
 * Tipos para el Dashboard
 */

export interface DashboardStats {
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

export interface IngressEgressByGeneration {
  generation: string;
  generationId: string;
  admissions: number;
  egresses: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
}

export interface StudentsByCareer {
  career: string;
  careerId: string;
  students: number;
}

export interface RecentStudent {
  id: string;
  fullName: string;
  career: string;
  careerId: string;
  createdAt: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  ingressEgressByGeneration: IngressEgressByGeneration[];
  statusDistribution: StatusDistribution[];
  studentsByCareer: StudentsByCareer[];
  recentStudents: RecentStudent[];
}
