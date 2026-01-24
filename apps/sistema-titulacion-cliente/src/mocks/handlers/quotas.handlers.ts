import { http, HttpResponse } from 'msw';
import type { Quota } from '@entities/quota';
import { buildApiUrl, delay } from '../utils';
import { findCareerById } from '../data/careers';
import { findGenerationById } from '../data/generations';
import {
  mockQuotas,
  findQuotaById,
  findQuotaByCareerAndGeneration,
  generateQuotaId,
} from '../data';

/**
 * Handlers para endpoints de cupos
 */

interface CreateQuotaRequest {
  generationId: string;
  careerId: string;
  newAdmissionQuotas: number;
  description: string | null;
  isActive: boolean;
}

interface UpdateQuotaRequest {
  generationId?: string;
  careerId?: string;
  newAdmissionQuotas?: number;
  description?: string | null;
  isActive?: boolean;
}

interface PaginationData {
  total: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface ListResponse {
  data: Quota[];
  pagination: PaginationData;
}

export const quotasHandlers = [
  // GET /quotas (List)
  http.get(buildApiUrl('/quotas'), async ({ request }) => {
    await delay();

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const careerId = url.searchParams.get('careerId');
    const generationId = url.searchParams.get('generationId');
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const search =
      url.searchParams.get('search') || url.searchParams.get('q') || '';

    const validSortFields = ['newAdmissionQuotas', 'createdAt', 'isActive'];
    const requestedSortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortBy = validSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : 'createdAt';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'desc';
    const sortOrder =
      requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = [...mockQuotas];

    if (careerId) {
      filteredData = filteredData.filter(
        (quota: Quota) => quota.careerId === careerId
      );
    }

    if (generationId) {
      filteredData = filteredData.filter(
        (quota: Quota) => quota.generationId === generationId
      );
    }

    if (activeOnly) {
      filteredData = filteredData.filter((quota: Quota) => quota.isActive);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = filteredData.filter((quota: Quota) => {
        return quota.description?.toLowerCase().includes(searchLower) ?? false;
      });
    }

    filteredData.sort((a, b) => {
      let aValue: string | number | boolean | Date | null;
      let bValue: string | number | boolean | Date | null;

      switch (sortBy) {
        case 'newAdmissionQuotas':
          aValue = a.newAdmissionQuotas;
          bValue = b.newAdmissionQuotas;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedData = filteredData.slice(offset, offset + limit);

    const pagingCounter = total > 0 ? offset + 1 : 0;
    const currentPage = Math.min(page, totalPages);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    const response: ListResponse = {
      data: paginatedData.map((quota) => ({
        ...quota,
        createdAt: quota.createdAt.toISOString(),
        updatedAt: quota.updatedAt.toISOString(),
      })) as unknown as Quota[],
      pagination: {
        total,
        limit,
        totalPages,
        page: currentPage,
        pagingCounter,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? currentPage - 1 : null,
        nextPage: hasNextPage ? currentPage + 1 : null,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /quotas/:id (Detail)
  http.get(buildApiUrl('/quotas/:id'), async ({ params }) => {
    await delay();

    const { id } = params;
    const quota = findQuotaById(id as string);

    if (!quota) {
      return HttpResponse.json(
        {
          error: 'Cupo no encontrado',
          code: 'QUOTA_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...quota,
      createdAt: quota.createdAt.toISOString(),
      updatedAt: quota.updatedAt.toISOString(),
    });
  }),

  // POST /quotas (Create)
  http.post(buildApiUrl('/quotas'), async ({ request }) => {
    await delay();

    const body = (await request.json()) as CreateQuotaRequest;

    // Validaciones básicas
    if (!body.careerId) {
      return HttpResponse.json(
        {
          error: 'La carrera es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.generationId) {
      return HttpResponse.json(
        {
          error: 'La generación es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.newAdmissionQuotas === undefined || body.newAdmissionQuotas < 0) {
      return HttpResponse.json(
        {
          error: 'El número de cupos debe ser un número positivo',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que la carrera existe
    const career = findCareerById(body.careerId);
    if (!career) {
      return HttpResponse.json(
        {
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Verificar que la generación existe
    const generation = findGenerationById(body.generationId);
    if (!generation) {
      return HttpResponse.json(
        {
          error: 'Generacion no encontrada',
          code: 'GENERATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Verificar que no exista ya un cupo para esta carrera y generación
    const existingQuota = findQuotaByCareerAndGeneration(
      body.careerId,
      body.generationId
    );
    if (existingQuota) {
      return HttpResponse.json(
        {
          error: 'Ya existe un cupo para esta carrera y generación',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newQuota: Quota = {
      id: generateQuotaId(),
      generationId: body.generationId,
      careerId: body.careerId,
      newAdmissionQuotas: body.newAdmissionQuotas,
      description: body.description?.trim() || null,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockQuotas.push(newQuota);

    return HttpResponse.json(
      {
        ...newQuota,
        createdAt: newQuota.createdAt.toISOString(),
        updatedAt: newQuota.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /quotas/:id (Update)
  http.put(buildApiUrl('/quotas/:id'), async ({ params, request }) => {
    await delay();

    const { id } = params;
    const quota = findQuotaById(id as string);

    if (!quota) {
      return HttpResponse.json(
        {
          error: 'Cupo no encontrado',
          code: 'QUOTA_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateQuotaRequest;

    // Validaciones
    if (body.newAdmissionQuotas !== undefined && body.newAdmissionQuotas < 0) {
      return HttpResponse.json(
        {
          error: 'El número de cupos debe ser un número positivo',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.careerId !== undefined) {
      const career = findCareerById(body.careerId);
      if (!career) {
        return HttpResponse.json(
          {
            error: 'Carrera no encontrada',
            code: 'CAREER_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    if (body.generationId !== undefined) {
      const generation = findGenerationById(body.generationId);
      if (!generation) {
        return HttpResponse.json(
          {
            error: 'Generacion no encontrada',
            code: 'GENERATION_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    // Verificar duplicados si se cambia carrera o generación
    const newCareerId = body.careerId ?? quota.careerId;
    const newGenerationId = body.generationId ?? quota.generationId;

    if (
      newCareerId !== quota.careerId ||
      newGenerationId !== quota.generationId
    ) {
      const existingQuota = findQuotaByCareerAndGeneration(
        newCareerId,
        newGenerationId
      );
      if (existingQuota && existingQuota.id !== id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un cupo para esta carrera y generación',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar
    quota.generationId = body.generationId ?? quota.generationId;
    quota.careerId = body.careerId ?? quota.careerId;
    quota.newAdmissionQuotas =
      body.newAdmissionQuotas ?? quota.newAdmissionQuotas;
    quota.description =
      body.description !== undefined ? body.description : quota.description;
    quota.isActive = body.isActive ?? quota.isActive;
    quota.updatedAt = new Date();

    return HttpResponse.json({
      ...quota,
      createdAt: quota.createdAt.toISOString(),
      updatedAt: quota.updatedAt.toISOString(),
    });
  }),

  // PATCH /quotas/:id (Partial Update)
  http.patch(buildApiUrl('/quotas/:id'), async ({ params, request }) => {
    await delay();

    const { id } = params;
    const quota = findQuotaById(id as string);

    if (!quota) {
      return HttpResponse.json(
        {
          error: 'Cupo no encontrado',
          code: 'QUOTA_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<UpdateQuotaRequest>;

    // Validaciones
    if (body.newAdmissionQuotas !== undefined && body.newAdmissionQuotas < 0) {
      return HttpResponse.json(
        {
          error: 'El número de cupos debe ser un número positivo',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.careerId !== undefined) {
      const career = findCareerById(body.careerId);
      if (!career) {
        return HttpResponse.json(
          {
            error: 'Carrera no encontrada',
            code: 'CAREER_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    if (body.generationId !== undefined) {
      const generation = findGenerationById(body.generationId);
      if (!generation) {
        return HttpResponse.json(
          {
            error: 'Generacion no encontrada',
            code: 'GENERATION_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    // Verificar duplicados si se cambia carrera o generación
    const newCareerId = body.careerId ?? quota.careerId;
    const newGenerationId = body.generationId ?? quota.generationId;

    if (
      newCareerId !== quota.careerId ||
      newGenerationId !== quota.generationId
    ) {
      const existingQuota = findQuotaByCareerAndGeneration(
        newCareerId,
        newGenerationId
      );
      if (existingQuota && existingQuota.id !== id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un cupo para esta carrera y generación',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar solo campos proporcionados
    if (body.generationId !== undefined) {
      quota.generationId = body.generationId;
    }
    if (body.careerId !== undefined) {
      quota.careerId = body.careerId;
    }
    if (body.newAdmissionQuotas !== undefined) {
      quota.newAdmissionQuotas = body.newAdmissionQuotas;
    }
    if (body.description !== undefined) {
      quota.description = body.description;
    }
    if (body.isActive !== undefined) {
      quota.isActive = body.isActive;
    }
    quota.updatedAt = new Date();

    return HttpResponse.json({
      ...quota,
      createdAt: quota.createdAt.toISOString(),
      updatedAt: quota.updatedAt.toISOString(),
    });
  }),

  // DELETE /quotas/:id
  http.delete(buildApiUrl('/quotas/:id'), async ({ params }) => {
    await delay();

    const { id } = params;
    const index = mockQuotas.findIndex((quota: Quota) => quota.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Cupo no encontrado',
          code: 'QUOTA_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockQuotas.splice(index, 1);

    return HttpResponse.json({
      message: 'Cupo eliminado exitosamente',
    });
  }),

  // POST /quotas/:id/activate
  http.post(buildApiUrl('/quotas/:id/activate'), async ({ params }) => {
    await delay();

    const { id } = params;
    const quota = findQuotaById(id as string);

    if (!quota) {
      return HttpResponse.json(
        {
          error: 'Cupo no encontrado',
          code: 'QUOTA_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    quota.isActive = true;
    quota.updatedAt = new Date();

    return HttpResponse.json({
      ...quota,
      createdAt: quota.createdAt.toISOString(),
      updatedAt: quota.updatedAt.toISOString(),
    });
  }),

  // POST /quotas/:id/deactivate
  http.post(buildApiUrl('/quotas/:id/deactivate'), async ({ params }) => {
    await delay();

    const { id } = params;
    const quota = findQuotaById(id as string);

    if (!quota) {
      return HttpResponse.json(
        {
          error: 'Cupo no encontrado',
          code: 'QUOTA_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    quota.isActive = false;
    quota.updatedAt = new Date();

    return HttpResponse.json({
      ...quota,
      createdAt: quota.createdAt.toISOString(),
      updatedAt: quota.updatedAt.toISOString(),
    });
  }),
];
