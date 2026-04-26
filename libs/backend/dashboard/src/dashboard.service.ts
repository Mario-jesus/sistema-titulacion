import { NewAdmissionModel } from '@backend/new-admissions';
import { StudentModel } from '@backend/students';
import { GenerationModel } from '@backend/generations';
import { CareerModel } from '@backend/careers';

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

export class DashboardService {
  constructor(
    private readonly newAdmissionModel: typeof NewAdmissionModel,
    private readonly studentModel: typeof StudentModel,
    private readonly generationModel: typeof GenerationModel,
    private readonly careerModel: typeof CareerModel
  ) {}

  async getDashboard(): Promise<DashboardResponse> {
    const [students, admissions, generations, careers] = await Promise.all([
      this.studentModel.find({}).lean(),
      this.newAdmissionModel.find({ isActive: true }).lean(),
      this.generationModel.find({}).lean(),
      this.careerModel.find({}).lean(),
    ]);

    const careerMap = new Map(careers.map((c) => [c._id.toString(), c.name]));

    // --- stats ---
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'ACTIVO').length;
    const inProgress = students.filter(
      (s) => s.processStatus === 'IN_PROCESS'
    ).length;
    const scheduled = students.filter(
      (s) => s.processStatus === 'SCHEDULED'
    ).length;
    const graduatedStudents = students.filter(
      (s) => s.processStatus === 'GRADUATED'
    ).length;
    const egressedStudents = students.filter((s) => s.isEgressed).length;

    const totalAdmissions = admissions.reduce(
      (sum, a) => sum + a.maleCount + a.femaleCount,
      0
    );
    const totalEgresses = egressedStudents;

    const egressRate =
      totalAdmissions > 0
        ? Number(((totalEgresses / totalAdmissions) * 100).toFixed(2))
        : 0;
    const graduationRate =
      totalEgresses > 0
        ? Number(((graduatedStudents / totalEgresses) * 100).toFixed(2))
        : 0;

    const stats: DashboardStats = {
      totalStudents,
      activeStudents,
      inProgress,
      scheduled,
      graduatedStudents,
      egressedStudents,
      totalAdmissions,
      totalEgresses,
      egressRate,
      graduationRate,
    };

    // --- ingressEgressByGeneration ---
    const ingressEgressByGeneration: IngressEgressByGeneration[] = generations
      .map((gen) => {
        const genId = gen._id.toString();
        const genAdmissions = admissions
          .filter((a) => a.generationId.toString() === genId)
          .reduce((sum, a) => sum + a.maleCount + a.femaleCount, 0);
        const genEgresses = students.filter(
          (s) => s.generationId.toString() === genId && s.isEgressed
        ).length;
        const startYear = gen.startYear.getFullYear();
        const endYear = gen.endYear.getFullYear();
        return {
          generation: `${startYear}-${endYear}`,
          generationId: genId,
          admissions: genAdmissions,
          egresses: genEgresses,
        };
      })
      .sort((a, b) => {
        const aYear = parseInt(a.generation.split('-')[0] ?? '0', 10);
        const bYear = parseInt(b.generation.split('-')[0] ?? '0', 10);
        return aYear - bYear;
      })
      .slice(-6);

    // --- statusDistribution ---
    const statusDistribution: StatusDistribution[] = [
      { name: 'Ingreso', value: totalAdmissions },
      { name: 'Egreso', value: egressedStudents },
      { name: 'Titulados', value: graduatedStudents },
    ];

    // --- studentsByCareer ---
    const careerCounts = new Map<string, number>();
    for (const s of students) {
      const cid = s.careerId.toString();
      careerCounts.set(cid, (careerCounts.get(cid) ?? 0) + 1);
    }
    const studentsByCareer: StudentsByCareer[] = Array.from(
      careerCounts.entries()
    )
      .map(([careerId, count]) => ({
        career: careerMap.get(careerId) ?? careerId,
        careerId,
        students: count,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 6);

    // --- recentStudents ---
    const recentStudents: RecentStudent[] = students
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((s) => ({
        id: s._id.toString(),
        fullName:
          `${s.firstName} ${s.paternalLastName} ${s.maternalLastName}`.trim(),
        career: careerMap.get(s.careerId.toString()) ?? s.careerId.toString(),
        careerId: s.careerId.toString(),
        createdAt: s.createdAt.toISOString(),
      }));

    return {
      stats,
      ingressEgressByGeneration,
      statusDistribution,
      studentsByCareer,
      recentStudents,
    };
  }
}
