import mongoose from 'mongoose';
import { AppError } from '@backend/shared';
import { NewAdmissionModel } from '@backend/new-admissions';
import { StudentModel } from '@backend/students';
import { GenerationModel } from '@backend/generations';
import { CareerModel } from '@backend/careers';
import type { ListIngressEgressQuery } from './schemas/ingress-egress.schemas.js';

export interface IngressEgressPublic {
  id: string;
  generationId: string;
  careerId: string;
  generationName: string | null;
  careerName: string;
  admissionNumber: number;
  egressNumber: number;
}

export interface ListIngressEgressResult {
  data: IngressEgressPublic[];
  pagination: {
    total: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
}

interface AggregateEntry {
  generationId: string;
  careerId: string;
  admissionNumber: number;
  egressNumber: number;
}

function buildPagination(
  page: number,
  limit: number,
  total: number
): ListIngressEgressResult['pagination'] {
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * limit;
  return {
    total,
    limit,
    totalPages,
    page: currentPage,
    pagingCounter: total > 0 ? offset + 1 : 0,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
  };
}

export class IngressEgressService {
  constructor(
    private readonly newAdmissionModel: typeof NewAdmissionModel,
    private readonly studentModel: typeof StudentModel,
    private readonly generationModel: typeof GenerationModel,
    private readonly careerModel: typeof CareerModel
  ) {}

  async list(query: ListIngressEgressQuery): Promise<ListIngressEgressResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const searchRaw = query.search ?? query.q ?? '';
    const search = searchRaw.trim().toLowerCase();
    const includeInactive = query.includeInactiveAdmissions ?? false;
    const sortBy = query.sortBy ?? 'careerName';
    const sortOrder = query.sortOrder ?? 'asc';

    const admissionFilter: Record<string, unknown> = {};
    if (!includeInactive) admissionFilter['isActive'] = true;
    if (query.careerId)
      admissionFilter['careerId'] = new mongoose.Types.ObjectId(query.careerId);
    if (query.generationId)
      admissionFilter['generationId'] = new mongoose.Types.ObjectId(
        query.generationId
      );

    const studentFilter: Record<string, unknown> = {};
    if (query.careerId)
      studentFilter['careerId'] = new mongoose.Types.ObjectId(query.careerId);
    if (query.generationId)
      studentFilter['generationId'] = new mongoose.Types.ObjectId(
        query.generationId
      );

    const [admissions, students] = await Promise.all([
      this.newAdmissionModel.find(admissionFilter).lean(),
      this.studentModel.find(studentFilter).lean(),
    ]);

    const map = new Map<string, AggregateEntry>();

    for (const a of admissions) {
      const gid = a.generationId.toString();
      const cid = a.careerId.toString();
      const key = `${gid}-${cid}`;
      const entry = map.get(key);
      if (entry) {
        entry.admissionNumber += a.maleCount + a.femaleCount;
      } else {
        map.set(key, {
          generationId: gid,
          careerId: cid,
          admissionNumber: a.maleCount + a.femaleCount,
          egressNumber: 0,
        });
      }
    }

    for (const s of students) {
      const gid = s.generationId.toString();
      const cid = s.careerId.toString();
      const key = `${gid}-${cid}`;
      const entry = map.get(key);
      if (entry) {
        if (s.isEgressed) entry.egressNumber += 1;
      } else {
        map.set(key, {
          generationId: gid,
          careerId: cid,
          admissionNumber: 0,
          egressNumber: s.isEgressed ? 1 : 0,
        });
      }
    }

    if (map.size === 0) {
      return { data: [], pagination: buildPagination(page, limit, 0) };
    }

    const genIds = [
      ...new Set([...map.values()].map((v) => v.generationId)),
    ].map((id) => new mongoose.Types.ObjectId(id));
    const carIds = [...new Set([...map.values()].map((v) => v.careerId))].map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const [generations, careers] = await Promise.all([
      this.generationModel.find({ _id: { $in: genIds } }).lean(),
      this.careerModel.find({ _id: { $in: carIds } }).lean(),
    ]);

    const genMap = new Map(
      generations.map((g) => [g._id.toString(), g.name ?? null])
    );
    const carMap = new Map(careers.map((c) => [c._id.toString(), c.name]));

    let data: IngressEgressPublic[] = [];
    for (const [key, item] of map) {
      data.push({
        id: key,
        generationId: item.generationId,
        careerId: item.careerId,
        generationName: genMap.get(item.generationId) ?? null,
        careerName: carMap.get(item.careerId) ?? '',
        admissionNumber: item.admissionNumber,
        egressNumber: item.egressNumber,
      });
    }

    if (search) {
      data = data.filter(
        (item) =>
          item.careerName.toLowerCase().includes(search) ||
          (item.generationName?.toLowerCase().includes(search) ?? false)
      );
    }

    data.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortBy) {
        case 'careerName':
          av = a.careerName.toLowerCase();
          bv = b.careerName.toLowerCase();
          break;
        case 'generationName':
          av = (a.generationName ?? '').toLowerCase();
          bv = (b.generationName ?? '').toLowerCase();
          break;
        case 'admissionNumber':
          av = a.admissionNumber;
          bv = b.admissionNumber;
          break;
        case 'egressNumber':
          av = a.egressNumber;
          bv = b.egressNumber;
          break;
        default:
          av = a.careerName.toLowerCase();
          bv = b.careerName.toLowerCase();
      }
      const cmp =
        typeof av === 'string'
          ? av.localeCompare(bv as string)
          : av - (bv as number);
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    const total = data.length;
    const skip = (page - 1) * limit;
    const paginatedData = data.slice(skip, skip + limit);

    return {
      data: paginatedData,
      pagination: buildPagination(page, limit, total),
    };
  }

  async getDetail(
    generationId: string,
    careerId: string
  ): Promise<IngressEgressPublic> {
    const generation = await this.generationModel.findById(generationId);
    if (!generation) {
      throw new AppError(
        404,
        'GENERATION_NOT_FOUND',
        'Generación no encontrada'
      );
    }

    const career = await this.careerModel.findById(careerId);
    if (!career) {
      throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
    }

    const admissionDocs = await this.newAdmissionModel
      .find({ generationId, careerId, isActive: true })
      .lean();

    const admissionNumber = admissionDocs.reduce(
      (sum, d) => sum + d.maleCount + d.femaleCount,
      0
    );

    const egressNumber = await this.studentModel.countDocuments({
      generationId,
      careerId,
      isEgressed: true,
    });

    return {
      id: `${generationId}-${careerId}`,
      generationId,
      careerId,
      generationName: generation.name ?? null,
      careerName: career.name,
      admissionNumber,
      egressNumber,
    };
  }
}
