import type { Model } from 'mongoose';
import { AppError } from '@backend/shared';
import type { ICareer } from './models/Career.model.js';
import type { IModality } from '@backend/modalities';
import {
  buildPagination,
  parsePaginationQuery,
  type PaginationResult,
} from './utils/pagination.js';
import type {
  CreateCareerInput,
  UpdateCareerInput,
} from './schemas/careers.schemas.js';

export interface CareerPublic {
  id: string;
  name: string;
  shortName: string;
  modalityId: string;
  modality: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListCareersParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELDS = ['name', 'shortName', 'createdAt', 'isActive'] as const;

type PopulatedModality = {
  _id: { toString: () => string };
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CareerDoc = {
  _id: { toString: () => string };
  name: string;
  shortName: string;
  modalityId: { toString: () => string } | PopulatedModality | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function isPopulatedModality(v: unknown): v is PopulatedModality {
  return v !== null && typeof v === 'object' && '_id' in v && 'name' in v;
}

function toCareerPublic(doc: CareerDoc): CareerPublic {
  const modalityId = isPopulatedModality(doc.modalityId)
    ? doc.modalityId._id.toString()
    : doc.modalityId?.toString() ?? '';

  const modality = isPopulatedModality(doc.modalityId)
    ? {
        id: doc.modalityId._id.toString(),
        name: doc.modalityId.name,
        description: doc.modalityId.description ?? null,
        isActive: doc.modalityId.isActive,
        createdAt: doc.modalityId.createdAt.toISOString(),
        updatedAt: doc.modalityId.updatedAt.toISOString(),
      }
    : (null as unknown as CareerPublic['modality']);

  return {
    id: doc._id.toString(),
    name: doc.name,
    shortName: doc.shortName,
    modalityId,
    modality,
    description: doc.description ?? null,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class CareersService {
  constructor(
    private readonly careerModel: Model<ICareer>,
    private readonly modalityModel: Model<IModality>
  ) {}

  async listCareers(
    params: ListCareersParams,
    query: Record<string, unknown>
  ): Promise<{ data: CareerPublic[]; pagination: PaginationResult }> {
    const { page, limit, skip } = parsePaginationQuery(
      query as { page?: string; limit?: string }
    );
    const sortBy = params.sortBy ?? 'name';
    const sortByField = SORT_FIELDS.includes(
      sortBy as (typeof SORT_FIELDS)[number]
    )
      ? sortBy
      : 'name';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    const sortObj = { [sortByField]: sortOrder } as Record<string, 1 | -1>;

    const filter: Record<string, unknown> = {};
    if (params.activeOnly) filter.isActive = true;
    if (params.search?.trim()) {
      const search = params.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.careerModel
        .find(filter)
        .populate('modalityId', 'name description isActive createdAt updatedAt')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.careerModel.countDocuments(filter),
    ]);

    return {
      data: (data as CareerDoc[]).map((d) => toCareerPublic(d)),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getCareerById(id: string): Promise<CareerPublic | null> {
    const career = await this.careerModel
      .findById(id)
      .populate('modalityId', 'name description isActive createdAt updatedAt')
      .lean()
      .exec();

    if (!career) return null;

    return toCareerPublic(career as CareerDoc);
  }

  async createCareer(input: CreateCareerInput): Promise<CareerPublic> {
    const modality = await this.modalityModel.findById(input.modalityId);
    if (!modality) {
      throw new AppError(404, 'MODALITY_NOT_FOUND', 'Modalidad no encontrada');
    }

    const name = input.name.trim();
    const shortName = input.shortName.trim();

    const existing = await this.careerModel.findOne({
      $or: [
        {
          name: {
            $regex: new RegExp(
              `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              'i'
            ),
          },
        },
        {
          shortName: {
            $regex: new RegExp(
              `^${shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              'i'
            ),
          },
        },
      ],
    });

    if (existing) {
      throw new AppError(409, 'DUPLICATE_ERROR', 'name o shortName ya existe');
    }

    const career = await this.careerModel.create({
      name,
      shortName,
      modalityId: input.modalityId,
      description: input.description ?? null,
      isActive: input.isActive,
    });

    const doc = await this.careerModel
      .findById(career._id)
      .populate('modalityId', 'name description isActive createdAt updatedAt')
      .lean()
      .exec();

    return toCareerPublic(doc as CareerDoc);
  }

  async updateCareer(
    id: string,
    input: UpdateCareerInput
  ): Promise<CareerPublic> {
    const career = await this.careerModel.findById(id);
    if (!career) {
      throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
    }

    if (input.modalityId !== undefined) {
      const modality = await this.modalityModel.findById(input.modalityId);
      if (!modality) {
        throw new AppError(
          404,
          'MODALITY_NOT_FOUND',
          'Modalidad no encontrada'
        );
      }
      career.modalityId =
        input.modalityId as unknown as typeof career.modalityId;
    }

    if (input.name !== undefined) {
      const existing = await this.careerModel.findOne({
        name: {
          $regex: new RegExp(
            `^${input.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError(409, 'DUPLICATE_ERROR', 'name ya existe');
      }
      career.name = input.name.trim();
    }

    if (input.shortName !== undefined) {
      const existing = await this.careerModel.findOne({
        shortName: {
          $regex: new RegExp(
            `^${input.shortName
              .trim()
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError(409, 'DUPLICATE_ERROR', 'shortName ya existe');
      }
      career.shortName = input.shortName.trim();
    }

    if (input.description !== undefined) career.description = input.description;
    if (input.isActive !== undefined) career.isActive = input.isActive;

    await career.save();

    const doc = await this.careerModel
      .findById(id)
      .populate('modalityId', 'name description isActive createdAt updatedAt')
      .lean()
      .exec();

    return toCareerPublic(doc as CareerDoc);
  }

  async deleteCareer(id: string): Promise<void> {
    const result = await this.careerModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
    }
  }

  async activateCareer(id: string): Promise<CareerPublic> {
    const career = await this.careerModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .populate('modalityId', 'name description isActive createdAt updatedAt')
      .lean()
      .exec();

    if (!career) {
      throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
    }

    return toCareerPublic(career as CareerDoc);
  }

  async deactivateCareer(id: string): Promise<CareerPublic> {
    const career = await this.careerModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .populate('modalityId', 'name description isActive createdAt updatedAt')
      .lean()
      .exec();

    if (!career) {
      throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
    }

    return toCareerPublic(career as CareerDoc);
  }
}
