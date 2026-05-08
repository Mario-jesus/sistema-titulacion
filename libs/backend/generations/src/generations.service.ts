import type { Model } from 'mongoose';
import { AppError } from '@backend/shared';
import type { IGeneration } from './models/Generation.model.js';
import {
  buildPagination,
  parsePaginationQuery,
  type PaginationResult,
} from './utils/pagination.js';
import type {
  CreateGenerationInput,
  UpdateGenerationInput,
} from './schemas/generations.schemas.js';

export interface GenerationPublic {
  id: string;
  name: string | null;
  startYear: string;
  endYear: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListGenerationsParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELDS = [
  'name',
  'startYear',
  'endYear',
  'createdAt',
  'isActive',
] as const;

type GenerationDoc = {
  _id: { toString: () => string };
  name: string | null;
  startYear: Date;
  endYear: Date;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toGenerationPublic(doc: GenerationDoc): GenerationPublic {
  return {
    id: doc._id.toString(),
    name: doc.name ?? null,
    startYear: doc.startYear.toISOString(),
    endYear: doc.endYear.toISOString(),
    description: doc.description ?? null,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class GenerationsService {
  constructor(private readonly generationModel: Model<IGeneration>) {}

  async listGenerations(
    params: ListGenerationsParams,
    query: Record<string, unknown>
  ): Promise<{ data: GenerationPublic[]; pagination: PaginationResult }> {
    const { page, limit, skip } = parsePaginationQuery(
      query as { page?: string; limit?: string }
    );
    const sortBy = params.sortBy ?? 'startYear';
    const sortByField = SORT_FIELDS.includes(
      sortBy as (typeof SORT_FIELDS)[number]
    )
      ? sortBy
      : 'startYear';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    const sortObj = { [sortByField]: sortOrder } as Record<string, 1 | -1>;

    const filter: Record<string, unknown> = {};
    if (params.activeOnly) filter.isActive = true;
    if (params.search?.trim()) {
      const search = params.search.trim();
      filter.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.generationModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.generationModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => toGenerationPublic(d as GenerationDoc)),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getGenerationById(id: string): Promise<GenerationPublic | null> {
    const gen = await this.generationModel.findById(id).lean().exec();
    return gen ? toGenerationPublic(gen as GenerationDoc) : null;
  }

  async createGeneration(
    input: CreateGenerationInput
  ): Promise<GenerationPublic> {
    const startYear = new Date(input.startYear);
    const endYear = new Date(input.endYear);

    if (startYear.getTime() >= endYear.getTime()) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'startYear debe ser menor que endYear'
      );
    }

    if (input.name?.trim()) {
      const existing = await this.generationModel.findOne({
        name: { $regex: new RegExp(`^${input.name.trim()}$`, 'i') },
      });
      if (existing) {
        throw new AppError(
          409,
          'DUPLICATE_ERROR',
          'Ya existe una generación con ese nombre'
        );
      }
    }

    const gen = await this.generationModel.create({
      name: input.name?.trim() || null,
      startYear,
      endYear,
      description: input.description?.trim() || null,
      isActive: input.isActive ?? true,
    });

    const doc = await this.generationModel.findById(gen._id).lean().exec();
    return toGenerationPublic(doc as GenerationDoc);
  }

  async updateGeneration(
    id: string,
    input: UpdateGenerationInput
  ): Promise<GenerationPublic> {
    const gen = await this.generationModel.findById(id);
    if (!gen) {
      throw new AppError(
        404,
        'GENERATION_NOT_FOUND',
        'Generación no encontrada'
      );
    }

    if (input.name !== undefined) {
      const nameVal = input.name?.trim() || null;
      if (nameVal) {
        const existing = await this.generationModel.findOne({
          name: { $regex: new RegExp(`^${nameVal}$`, 'i') },
          _id: { $ne: id },
        });
        if (existing) {
          throw new AppError(
            409,
            'DUPLICATE_ERROR',
            'Ya existe una generación con ese nombre'
          );
        }
      }
      gen.name = nameVal;
    }

    const newStartYear = input.startYear
      ? new Date(input.startYear)
      : gen.startYear;
    const newEndYear = input.endYear ? new Date(input.endYear) : gen.endYear;

    if (newStartYear.getTime() >= newEndYear.getTime()) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'startYear debe ser menor que endYear'
      );
    }

    gen.startYear = newStartYear;
    gen.endYear = newEndYear;
    if (input.description !== undefined)
      gen.description = input.description?.trim() || null;
    if (input.isActive !== undefined) gen.isActive = input.isActive;

    await gen.save();
    const doc = await this.generationModel.findById(id).lean().exec();
    return toGenerationPublic(doc as GenerationDoc);
  }

  async deleteGeneration(id: string): Promise<void> {
    const result = await this.generationModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(
        404,
        'GENERATION_NOT_FOUND',
        'Generación no encontrada'
      );
    }
  }

  async activateGeneration(id: string): Promise<GenerationPublic> {
    const gen = await this.generationModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .lean()
      .exec();
    if (!gen) {
      throw new AppError(
        404,
        'GENERATION_NOT_FOUND',
        'Generación no encontrada'
      );
    }
    return toGenerationPublic(gen as GenerationDoc);
  }

  async deactivateGeneration(id: string): Promise<GenerationPublic> {
    const gen = await this.generationModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean()
      .exec();
    if (!gen) {
      throw new AppError(
        404,
        'GENERATION_NOT_FOUND',
        'Generación no encontrada'
      );
    }
    return toGenerationPublic(gen as GenerationDoc);
  }
}
