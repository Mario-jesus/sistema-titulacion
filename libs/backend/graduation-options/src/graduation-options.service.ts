import type { Model } from 'mongoose';
import { AppError } from '@backend/shared';
import type { IGraduationOption } from './models/GraduationOption.model.js';
import {
  buildPagination,
  parsePaginationQuery,
  type PaginationResult,
} from './utils/pagination.js';
import type {
  CreateGraduationOptionInput,
  UpdateGraduationOptionInput,
} from './schemas/graduation-options.schemas.js';

export interface GraduationOptionPublic {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListGraduationOptionsParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELDS = ['name', 'createdAt', 'isActive'] as const;

type GraduationOptionDoc = {
  _id: { toString: () => string };
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toGraduationOptionPublic(
  doc: GraduationOptionDoc
): GraduationOptionPublic {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? null,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class GraduationOptionsService {
  constructor(
    private readonly graduationOptionModel: Model<IGraduationOption>
  ) {}

  async listGraduationOptions(
    params: ListGraduationOptionsParams,
    query: Record<string, unknown>
  ): Promise<{
    data: GraduationOptionPublic[];
    pagination: PaginationResult;
  }> {
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
      filter.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.graduationOptionModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.graduationOptionModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => toGraduationOptionPublic(d as GraduationOptionDoc)),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getGraduationOptionById(
    id: string
  ): Promise<GraduationOptionPublic | null> {
    const option = await this.graduationOptionModel.findById(id).lean().exec();
    return option
      ? toGraduationOptionPublic(option as GraduationOptionDoc)
      : null;
  }

  async createGraduationOption(
    input: CreateGraduationOptionInput
  ): Promise<GraduationOptionPublic> {
    const name = input.name.trim();

    const existing = await this.graduationOptionModel.findOne({
      name: {
        $regex: new RegExp(
          `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          'i'
        ),
      },
    });

    if (existing) {
      throw new AppError(
        409,
        'DUPLICATE_ERROR',
        'Ya existe una opción de titulación con ese nombre'
      );
    }

    const option = await this.graduationOptionModel.create({
      name,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
    });

    const doc = await this.graduationOptionModel
      .findById(option._id)
      .lean()
      .exec();
    return toGraduationOptionPublic(doc as GraduationOptionDoc);
  }

  async updateGraduationOption(
    id: string,
    input: UpdateGraduationOptionInput
  ): Promise<GraduationOptionPublic> {
    const option = await this.graduationOptionModel.findById(id);
    if (!option) {
      throw new AppError(
        404,
        'GRADUATION_OPTION_NOT_FOUND',
        'Opción de titulación no encontrada'
      );
    }

    if (input.name !== undefined) {
      const name = input.name.trim();
      const existing = await this.graduationOptionModel.findOne({
        name: {
          $regex: new RegExp(
            `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError(
          409,
          'DUPLICATE_ERROR',
          'Ya existe una opción de titulación con ese nombre'
        );
      }
      option.name = name;
    }
    if (input.description !== undefined) option.description = input.description;
    if (input.isActive !== undefined) option.isActive = input.isActive;

    await option.save();
    const doc = await this.graduationOptionModel.findById(id).lean().exec();
    return toGraduationOptionPublic(doc as GraduationOptionDoc);
  }

  async deleteGraduationOption(id: string): Promise<void> {
    const result = await this.graduationOptionModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(
        404,
        'GRADUATION_OPTION_NOT_FOUND',
        'Opción de titulación no encontrada'
      );
    }
  }

  async activateGraduationOption(id: string): Promise<GraduationOptionPublic> {
    const option = await this.graduationOptionModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .lean()
      .exec();
    if (!option) {
      throw new AppError(
        404,
        'GRADUATION_OPTION_NOT_FOUND',
        'Opción de titulación no encontrada'
      );
    }
    return toGraduationOptionPublic(option as GraduationOptionDoc);
  }

  async deactivateGraduationOption(
    id: string
  ): Promise<GraduationOptionPublic> {
    const option = await this.graduationOptionModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean()
      .exec();
    if (!option) {
      throw new AppError(
        404,
        'GRADUATION_OPTION_NOT_FOUND',
        'Opción de titulación no encontrada'
      );
    }
    return toGraduationOptionPublic(option as GraduationOptionDoc);
  }
}
