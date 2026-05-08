import type { Model } from 'mongoose';
import { AppError } from '@backend/shared';
import { CareerModel } from '@backend/careers';
import { GenerationModel } from '@backend/generations';
import type { INewAdmission } from './models/NewAdmission.model.js';
import {
  buildPagination,
  parsePaginationQuery,
  type PaginationResult,
} from './utils/pagination.js';
import type {
  CreateNewAdmissionInput,
  UpdateNewAdmissionInput,
} from './schemas/new-admissions.schemas.js';

export interface NewAdmissionPublic {
  id: string;
  generationId: string;
  careerId: string;
  maleCount: number;
  femaleCount: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListNewAdmissionsParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  search?: string;
  careerId?: string;
  generationId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELDS = [
  'maleCount',
  'femaleCount',
  'createdAt',
  'isActive',
] as const;

type NewAdmissionDoc = {
  _id: { toString: () => string };
  generationId: { toString: () => string };
  careerId: { toString: () => string };
  maleCount: number;
  femaleCount: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toNewAdmissionPublic(doc: NewAdmissionDoc): NewAdmissionPublic {
  return {
    id: doc._id.toString(),
    generationId: doc.generationId.toString(),
    careerId: doc.careerId.toString(),
    maleCount: doc.maleCount,
    femaleCount: doc.femaleCount,
    description: doc.description ?? null,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class NewAdmissionsService {
  constructor(
    private readonly newAdmissionModel: Model<INewAdmission>,
    private readonly careerModel: typeof CareerModel,
    private readonly generationModel: typeof GenerationModel
  ) {}

  async listNewAdmissions(
    params: ListNewAdmissionsParams,
    query: Record<string, unknown>
  ): Promise<{ data: NewAdmissionPublic[]; pagination: PaginationResult }> {
    const { page, limit, skip } = parsePaginationQuery(
      query as { page?: string; limit?: string }
    );
    const sortBy = params.sortBy ?? 'createdAt';
    const sortByField = SORT_FIELDS.includes(
      sortBy as (typeof SORT_FIELDS)[number]
    )
      ? sortBy
      : 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortByField]: sortOrder } as Record<string, 1 | -1>;

    const filter: Record<string, unknown> = {};
    if (params.activeOnly) filter.isActive = true;
    if (params.careerId) filter.careerId = params.careerId;
    if (params.generationId) filter.generationId = params.generationId;
    if (params.search?.trim()) {
      const search = params.search.trim();
      filter.description = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.newAdmissionModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.newAdmissionModel.countDocuments(filter),
    ]);

    return {
      data: (data as NewAdmissionDoc[]).map((d) => toNewAdmissionPublic(d)),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getNewAdmissionById(id: string): Promise<NewAdmissionPublic | null> {
    const doc = await this.newAdmissionModel.findById(id).lean().exec();
    if (!doc) return null;
    return toNewAdmissionPublic(doc as NewAdmissionDoc);
  }

  async createNewAdmission(
    input: CreateNewAdmissionInput
  ): Promise<NewAdmissionPublic> {
    const career = await this.careerModel.findById(input.careerId);
    if (!career) {
      throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
    }

    const generation = await this.generationModel.findById(input.generationId);
    if (!generation) {
      throw new AppError(
        404,
        'GENERATION_NOT_FOUND',
        'Generación no encontrada'
      );
    }

    const existing = await this.newAdmissionModel.findOne({
      careerId: input.careerId,
      generationId: input.generationId,
    });
    if (existing) {
      throw new AppError(
        409,
        'DUPLICATE_ERROR',
        'Ya existe un registro de admisiones para esta carrera y generación'
      );
    }

    const doc = await this.newAdmissionModel.create({
      careerId: input.careerId,
      generationId: input.generationId,
      maleCount: input.maleCount ?? 0,
      femaleCount: input.femaleCount ?? 0,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
    });

    const created = await this.newAdmissionModel
      .findById(doc._id)
      .lean()
      .exec();
    return toNewAdmissionPublic(created as NewAdmissionDoc);
  }

  async updateNewAdmission(
    id: string,
    input: UpdateNewAdmissionInput
  ): Promise<NewAdmissionPublic> {
    const doc = await this.newAdmissionModel.findById(id);
    if (!doc) {
      throw new AppError(
        404,
        'NEW_ADMISSION_NOT_FOUND',
        'Registro de admisiones no encontrado'
      );
    }

    if (input.careerId !== undefined) {
      const career = await this.careerModel.findById(input.careerId);
      if (!career) {
        throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
      }
      doc.careerId = input.careerId as unknown as typeof doc.careerId;
    }

    if (input.generationId !== undefined) {
      const generation = await this.generationModel.findById(
        input.generationId
      );
      if (!generation) {
        throw new AppError(
          404,
          'GENERATION_NOT_FOUND',
          'Generación no encontrada'
        );
      }
      doc.generationId =
        input.generationId as unknown as typeof doc.generationId;
    }

    if (input.maleCount !== undefined) doc.maleCount = input.maleCount;
    if (input.femaleCount !== undefined) doc.femaleCount = input.femaleCount;
    if (input.description !== undefined) doc.description = input.description;
    if (input.isActive !== undefined) doc.isActive = input.isActive;

    const duplicateFilter: Record<string, unknown> = {
      careerId: doc.careerId,
      generationId: doc.generationId,
      _id: { $ne: id },
    };
    const duplicate = await this.newAdmissionModel.findOne(duplicateFilter);
    if (duplicate) {
      throw new AppError(
        409,
        'DUPLICATE_ERROR',
        'Ya existe un registro de admisiones para esta carrera y generación'
      );
    }

    await doc.save();

    const updated = await this.newAdmissionModel.findById(id).lean().exec();
    return toNewAdmissionPublic(updated as NewAdmissionDoc);
  }

  async patchNewAdmission(
    id: string,
    input: Partial<UpdateNewAdmissionInput>
  ): Promise<NewAdmissionPublic> {
    return this.updateNewAdmission(id, input);
  }

  async deleteNewAdmission(id: string): Promise<void> {
    const result = await this.newAdmissionModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(
        404,
        'NEW_ADMISSION_NOT_FOUND',
        'Registro de admisiones no encontrado'
      );
    }
  }

  async activateNewAdmission(id: string): Promise<NewAdmissionPublic> {
    const doc = await this.newAdmissionModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .lean()
      .exec();

    if (!doc) {
      throw new AppError(
        404,
        'NEW_ADMISSION_NOT_FOUND',
        'Registro de admisiones no encontrado'
      );
    }
    return toNewAdmissionPublic(doc as NewAdmissionDoc);
  }

  async deactivateNewAdmission(id: string): Promise<NewAdmissionPublic> {
    const doc = await this.newAdmissionModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean()
      .exec();

    if (!doc) {
      throw new AppError(
        404,
        'NEW_ADMISSION_NOT_FOUND',
        'Registro de admisiones no encontrado'
      );
    }
    return toNewAdmissionPublic(doc as NewAdmissionDoc);
  }
}
