import { http, HttpResponse } from 'msw';
import type { NewAdmission } from '@entities/new-admission';
import { buildApiUrl, delay } from '../utils';
import { forbidStaffWrite } from '../utils/staffGuard';
import { findCareerById } from '../data/careers';
import { findGenerationById } from '../data/generations';
import {
  mockNewAdmissions,
  findNewAdmissionById,
  findNewAdmissionByCareerAndGeneration,
  generateNewAdmissionId,
} from '../data';

/**
 * Handlers para endpoints de nuevo ingreso
 */

interface CreateNewAdmissionRequest {
  generationId: string;
  careerId: string;
  maleCount: number;
  femaleCount: number;
  description: string | null;
  isActive: boolean;
}

interface UpdateNewAdmissionRequest {
  generationId?: string;
  careerId?: string;
  maleCount?: number;
  femaleCount?: number;
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
  data: NewAdmission[];
  pagination: PaginationData;
}

export const newAdmissionsHandlers = [
  // GET /new-admissions (List)
  http.get(buildApiUrl('/new-admissions'), async ({ request }) => {
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

    const validSortFields = [
      'maleCount',
      'femaleCount',
      'createdAt',
      'isActive',
    ];
    const requestedSortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortBy = validSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : 'createdAt';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'desc';
    const sortOrder =
      requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = [...mockNewAdmissions];

    if (careerId) {
      filteredData = filteredData.filter(
        (entry: NewAdmission) => entry.careerId === careerId
      );
    }

    if (generationId) {
      filteredData = filteredData.filter(
        (entry: NewAdmission) => entry.generationId === generationId
      );
    }

    if (activeOnly) {
      filteredData = filteredData.filter(
        (entry: NewAdmission) => entry.isActive
      );
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = filteredData.filter((entry: NewAdmission) => {
        return entry.description?.toLowerCase().includes(searchLower) ?? false;
      });
    }

    filteredData.sort((a, b) => {
      let aValue: string | number | boolean | Date | null;
      let bValue: string | number | boolean | Date | null;

      switch (sortBy) {
        case 'maleCount':
          aValue = a.maleCount;
          bValue = b.maleCount;
          break;
        case 'femaleCount':
          aValue = a.femaleCount;
          bValue = b.femaleCount;
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
      data: paginatedData.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })) as unknown as NewAdmission[],
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

  // GET /new-admissions/:id (Detail)
  http.get(buildApiUrl('/new-admissions/:id'), async ({ params }) => {
    await delay();

    const { id } = params;
    const entry = findNewAdmissionById(id as string);

    if (!entry) {
      return HttpResponse.json(
        {
          error: 'Registro de ingreso no encontrado',
          code: 'NEW_ADMISSION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    });
  }),

  // POST /new-admissions (Create)
  http.post(buildApiUrl('/new-admissions'), async ({ request }) => {
    await delay();
    const forbidden = forbidStaffWrite(request);
    if (forbidden) return forbidden;

    const body = (await request.json()) as CreateNewAdmissionRequest;

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

    if (body.maleCount === undefined || body.maleCount < 0) {
      return HttpResponse.json(
        {
          error: 'El número de alumnos hombres debe ser un número positivo',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.femaleCount === undefined || body.femaleCount < 0) {
      return HttpResponse.json(
        {
          error: 'El número de alumnas mujeres debe ser un número positivo',
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

    // Verificar que no exista ya un registro para esta carrera y generación
    const existingEntry = findNewAdmissionByCareerAndGeneration(
      body.careerId,
      body.generationId
    );
    if (existingEntry) {
      return HttpResponse.json(
        {
          error:
            'Ya existe un registro de ingreso para esta carrera y generación',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newEntry: NewAdmission = {
      id: generateNewAdmissionId(),
      generationId: body.generationId,
      careerId: body.careerId,
      maleCount: body.maleCount,
      femaleCount: body.femaleCount,
      description: body.description?.trim() || null,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockNewAdmissions.push(newEntry);

    return HttpResponse.json(
      {
        ...newEntry,
        createdAt: newEntry.createdAt.toISOString(),
        updatedAt: newEntry.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /new-admissions/:id (Update)
  http.put(buildApiUrl('/new-admissions/:id'), async ({ params, request }) => {
    await delay();
    const forbidden = forbidStaffWrite(request);
    if (forbidden) return forbidden;

    const { id } = params;
    const entry = findNewAdmissionById(id as string);

    if (!entry) {
      return HttpResponse.json(
        {
          error: 'Registro de ingreso no encontrado',
          code: 'NEW_ADMISSION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateNewAdmissionRequest;

    // Validaciones
    if (body.maleCount !== undefined && body.maleCount < 0) {
      return HttpResponse.json(
        {
          error: 'El número de alumnos hombres debe ser un número positivo',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.femaleCount !== undefined && body.femaleCount < 0) {
      return HttpResponse.json(
        {
          error: 'El número de alumnas mujeres debe ser un número positivo',
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
    const newCareerId = body.careerId ?? entry.careerId;
    const newGenerationId = body.generationId ?? entry.generationId;

    if (
      newCareerId !== entry.careerId ||
      newGenerationId !== entry.generationId
    ) {
      const existingEntry = findNewAdmissionByCareerAndGeneration(
        newCareerId,
        newGenerationId
      );
      if (existingEntry && existingEntry.id !== id) {
        return HttpResponse.json(
          {
            error:
              'Ya existe un registro de ingreso para esta carrera y generación',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar
    entry.generationId = body.generationId ?? entry.generationId;
    entry.careerId = body.careerId ?? entry.careerId;
    entry.maleCount = body.maleCount ?? entry.maleCount;
    entry.femaleCount = body.femaleCount ?? entry.femaleCount;
    entry.description =
      body.description !== undefined ? body.description : entry.description;
    entry.isActive = body.isActive ?? entry.isActive;
    entry.updatedAt = new Date();

    return HttpResponse.json({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    });
  }),

  // PATCH /new-admissions/:id (Partial Update)
  http.patch(
    buildApiUrl('/new-admissions/:id'),
    async ({ params, request }) => {
      await delay();
      const forbidden = forbidStaffWrite(request);
      if (forbidden) return forbidden;

      const { id } = params;
      const entry = findNewAdmissionById(id as string);

      if (!entry) {
        return HttpResponse.json(
          {
            error: 'Registro de ingreso no encontrado',
            code: 'NEW_ADMISSION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const body = (await request.json()) as Partial<UpdateNewAdmissionRequest>;

      // Validaciones
      if (body.maleCount !== undefined && body.maleCount < 0) {
        return HttpResponse.json(
          {
            error: 'El número de alumnos hombres debe ser un número positivo',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      if (body.femaleCount !== undefined && body.femaleCount < 0) {
        return HttpResponse.json(
          {
            error: 'El número de alumnas mujeres debe ser un número positivo',
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
      const newCareerId = body.careerId ?? entry.careerId;
      const newGenerationId = body.generationId ?? entry.generationId;

      if (
        newCareerId !== entry.careerId ||
        newGenerationId !== entry.generationId
      ) {
        const existingEntry = findNewAdmissionByCareerAndGeneration(
          newCareerId,
          newGenerationId
        );
        if (existingEntry && existingEntry.id !== id) {
          return HttpResponse.json(
            {
              error:
                'Ya existe un registro de ingreso para esta carrera y generación',
              code: 'DUPLICATE_ERROR',
            },
            { status: 409 }
          );
        }
      }

      // Actualizar solo campos proporcionados
      if (body.generationId !== undefined) {
        entry.generationId = body.generationId;
      }
      if (body.careerId !== undefined) {
        entry.careerId = body.careerId;
      }
      if (body.maleCount !== undefined) {
        entry.maleCount = body.maleCount;
      }
      if (body.femaleCount !== undefined) {
        entry.femaleCount = body.femaleCount;
      }
      if (body.description !== undefined) {
        entry.description = body.description;
      }
      if (body.isActive !== undefined) {
        entry.isActive = body.isActive;
      }
      entry.updatedAt = new Date();

      return HttpResponse.json({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      });
    }
  ),

  // DELETE /new-admissions/:id
  http.delete(
    buildApiUrl('/new-admissions/:id'),
    async ({ params, request }) => {
      await delay();
      const forbidden = forbidStaffWrite(request);
      if (forbidden) return forbidden;

      const { id } = params;
      const index = mockNewAdmissions.findIndex(
        (entry: NewAdmission) => entry.id === id
      );

      if (index === -1) {
        return HttpResponse.json(
          {
            error: 'Registro de ingreso no encontrado',
            code: 'NEW_ADMISSION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      mockNewAdmissions.splice(index, 1);

      return HttpResponse.json({
        message: 'Registro eliminado exitosamente',
      });
    }
  ),

  // POST /new-admissions/:id/activate
  http.post(
    buildApiUrl('/new-admissions/:id/activate'),
    async ({ params, request }) => {
      await delay();
      const forbidden = forbidStaffWrite(request);
      if (forbidden) return forbidden;

      const { id } = params;
      const entry = findNewAdmissionById(id as string);

      if (!entry) {
        return HttpResponse.json(
          {
            error: 'Registro de ingreso no encontrado',
            code: 'NEW_ADMISSION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      entry.isActive = true;
      entry.updatedAt = new Date();

      return HttpResponse.json({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      });
    }
  ),

  // POST /new-admissions/:id/deactivate
  http.post(
    buildApiUrl('/new-admissions/:id/deactivate'),
    async ({ params, request }) => {
      await delay();
      const forbidden = forbidStaffWrite(request);
      if (forbidden) return forbidden;

      const { id } = params;
      const entry = findNewAdmissionById(id as string);

      if (!entry) {
        return HttpResponse.json(
          {
            error: 'Registro de ingreso no encontrado',
            code: 'NEW_ADMISSION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      entry.isActive = false;
      entry.updatedAt = new Date();

      return HttpResponse.json({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      });
    }
  ),
];
