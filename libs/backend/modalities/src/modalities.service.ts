import type { Model } from 'mongoose';
import { AppError } from '@backend/shared';
import type { IModality } from './models/Modality.model.js';
import {
  buildPagination,
  parsePaginationQuery,
  type PaginationResult,
} from './utils/pagination.js';
import type {
  CreateModalityInput,
  UpdateModalityInput,
} from './schemas/modalities.schemas.js';

export interface ModalityPublic {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListModalitiesParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELDS = ['name', 'createdAt', 'isActive'] as const;

type ModalityDoc = {
  _id: { toString: () => string };
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toModalityPublic(doc: ModalityDoc): ModalityPublic {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? null,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class ModalitiesService {
  constructor(private readonly modalityModel: Model<IModality>) {}

  async listModalities(
    params: ListModalitiesParams,
    query: Record<string, unknown>
  ): Promise<{ data: ModalityPublic[]; pagination: PaginationResult }> {
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
      this.modalityModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.modalityModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => toModalityPublic(d as ModalityDoc)),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getModalityById(id: string): Promise<ModalityPublic | null> {
    const modality = await this.modalityModel.findById(id).lean().exec();
    return modality ? toModalityPublic(modality as ModalityDoc) : null;
  }

  async createModality(input: CreateModalityInput): Promise<ModalityPublic> {
    const name = input.name.trim();

    const existing = await this.modalityModel.findOne({
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
        'Ya existe una modalidad con ese nombre'
      );
    }

    const modality = await this.modalityModel.create({
      name,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
    });

    const doc = await this.modalityModel.findById(modality._id).lean().exec();
    return toModalityPublic(doc as ModalityDoc);
  }

  async updateModality(
    id: string,
    input: UpdateModalityInput
  ): Promise<ModalityPublic> {
    const modality = await this.modalityModel.findById(id);
    if (!modality) {
      throw new AppError(404, 'MODALITY_NOT_FOUND', 'Modalidad no encontrada');
    }

    if (input.name !== undefined) {
      const name = input.name.trim();
      const existing = await this.modalityModel.findOne({
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
          'Ya existe una modalidad con ese nombre'
        );
      }
      modality.name = name;
    }
    if (input.description !== undefined)
      modality.description = input.description;
    if (input.isActive !== undefined) modality.isActive = input.isActive;

    await modality.save();
    const doc = await this.modalityModel.findById(id).lean().exec();
    return toModalityPublic(doc as ModalityDoc);
  }

  async deleteModality(id: string): Promise<void> {
    const result = await this.modalityModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(404, 'MODALITY_NOT_FOUND', 'Modalidad no encontrada');
    }
  }

  async activateModality(id: string): Promise<ModalityPublic> {
    const modality = await this.modalityModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .lean()
      .exec();
    if (!modality) {
      throw new AppError(404, 'MODALITY_NOT_FOUND', 'Modalidad no encontrada');
    }
    return toModalityPublic(modality as ModalityDoc);
  }

  async deactivateModality(id: string): Promise<ModalityPublic> {
    const modality = await this.modalityModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean()
      .exec();
    if (!modality) {
      throw new AppError(404, 'MODALITY_NOT_FOUND', 'Modalidad no encontrada');
    }
    return toModalityPublic(modality as ModalityDoc);
  }
}
