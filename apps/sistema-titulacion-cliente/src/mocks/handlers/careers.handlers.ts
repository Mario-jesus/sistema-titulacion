import { http, HttpResponse } from 'msw';
import type { Career } from '@entities/career';
import { buildApiUrl, delay } from '../utils';
import { findModalityById } from '../data/modalities';
import {
  mockCareers,
  findCareerById,
  generateCareerId,
} from '../data';

/**
 * Handlers para endpoints de carreras
 */

interface CreateCareerRequest {
  name: string;
  shortName: string;
  modalityId: string;
  modality?: any; // Opcional, viene del backend
  description: string | null;
  isActive: boolean;
}

interface UpdateCareerRequest {
  name?: string;
  shortName?: string;
  modalityId?: string;
  modality?: any;
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
  data: Career[];
  pagination: PaginationData;
}

export const careersHandlers = [
  // GET /careers (List)
  http.get(buildApiUrl('/careers'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const search = url.searchParams.get('search') || url.searchParams.get('q') || '';

    // Validar y normalizar parámetros de ordenamiento
    const validSortFields = ['name', 'shortName', 'createdAt', 'isActive'];
    const requestedSortBy = url.searchParams.get('sortBy') || 'name';
    const sortBy = validSortFields.includes(requestedSortBy) ? requestedSortBy : 'name';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'asc';
    const sortOrder = requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = activeOnly
      ? mockCareers.filter((career: Career) => career.isActive)
      : [...mockCareers];

    // Búsqueda por texto (busca en nombre y nombre corto)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = filteredData.filter((career: Career) => {
        const nameMatch = career.name?.toLowerCase().includes(searchLower) ?? false;
        const shortNameMatch = career.shortName?.toLowerCase().includes(searchLower) ?? false;
        return nameMatch || shortNameMatch;
      });
    }

    // Ordenamiento
    filteredData.sort((a, b) => {
      let aValue: string | number | boolean | Date | null;
      let bValue: string | number | boolean | Date | null;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() ?? '';
          bValue = b.name?.toLowerCase() ?? '';
          break;
        case 'shortName':
          aValue = a.shortName?.toLowerCase() ?? '';
          bValue = b.shortName?.toLowerCase() ?? '';
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
          aValue = a.name?.toLowerCase() ?? '';
          bValue = b.name?.toLowerCase() ?? '';
      }

      // Manejar valores null/undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Comparación
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
      data: paginatedData.map((career) => ({
        ...career,
        modality: career.modality ? {
          ...career.modality,
          createdAt: career.modality.createdAt.toISOString(),
          updatedAt: career.modality.updatedAt.toISOString(),
        } : undefined,
        createdAt: career.createdAt.toISOString(),
        updatedAt: career.updatedAt.toISOString(),
      })) as unknown as Career[],
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

  // GET /careers/:id (Detail)
  http.get(buildApiUrl('/careers/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const career = findCareerById(id as string);

    if (!career) {
      return HttpResponse.json(
        {
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...career,
      modality: career.modality ? {
        ...career.modality,
        createdAt: career.modality.createdAt.toISOString(),
        updatedAt: career.modality.updatedAt.toISOString(),
      } : undefined,
      createdAt: career.createdAt.toISOString(),
      updatedAt: career.updatedAt.toISOString(),
    });
  }),

  // POST /careers (Create)
  http.post(buildApiUrl('/careers'), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateCareerRequest;

    // Validaciones básicas
    if (!body.name || body.name.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.shortName || body.shortName.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre corto es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.modalityId) {
      return HttpResponse.json(
        {
          error: 'La modalidad es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que la modalidad existe
    const modality = findModalityById(body.modalityId);
    if (!modality) {
      return HttpResponse.json(
        {
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Verificar duplicados por nombre
    const existsByName = mockCareers.some(
      (career: Career) => career.name.toLowerCase() === body.name.toLowerCase()
    );
    if (existsByName) {
      return HttpResponse.json(
        {
          error: 'Ya existe una carrera con ese nombre',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    // Verificar duplicados por nombre corto
    const existsByShortName = mockCareers.some(
      (career: Career) => career.shortName.toLowerCase() === body.shortName.toLowerCase()
    );
    if (existsByShortName) {
      return HttpResponse.json(
        {
          error: 'Ya existe una carrera con ese nombre corto',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newCareer: Career = {
      id: generateCareerId(),
      name: body.name.trim(),
      shortName: body.shortName.trim(),
      modalityId: body.modalityId,
      modality: body.modality || modality,
      description: body.description?.trim() || null,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCareers.push(newCareer);

    return HttpResponse.json(
      {
        ...newCareer,
        modality: newCareer.modality ? {
          ...newCareer.modality,
          createdAt: newCareer.modality.createdAt.toISOString(),
          updatedAt: newCareer.modality.updatedAt.toISOString(),
        } : undefined,
        createdAt: newCareer.createdAt.toISOString(),
        updatedAt: newCareer.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /careers/:id (Update)
  http.put(buildApiUrl('/careers/:id'), async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const career = findCareerById(id as string);

    if (!career) {
      return HttpResponse.json(
        {
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateCareerRequest;

    // Validaciones
    if (body.name !== undefined && (!body.name || body.name.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.shortName !== undefined && (!body.shortName || body.shortName.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre corto no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.modalityId !== undefined) {
      const modality = findModalityById(body.modalityId);
      if (!modality) {
        return HttpResponse.json(
          {
            error: 'Modalidad no encontrada',
            code: 'MODALITY_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    // Verificar duplicados por nombre si se cambia
    if (body.name && body.name.toLowerCase() !== career.name.toLowerCase()) {
      const exists = mockCareers.some(
        (c: Career) => c.id !== id && c.name.toLowerCase() === body.name!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una carrera con ese nombre',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados por nombre corto si se cambia
    if (body.shortName && body.shortName.toLowerCase() !== career.shortName.toLowerCase()) {
      const exists = mockCareers.some(
        (c: Career) => c.id !== id && c.shortName.toLowerCase() === body.shortName!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una carrera con ese nombre corto',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar
    career.name = body.name?.trim() ?? career.name;
    career.shortName = body.shortName?.trim() ?? career.shortName;
    career.modalityId = body.modalityId ?? career.modalityId;
    career.modality = body.modality || (body.modalityId ? findModalityById(body.modalityId) : career.modality);
    career.description = body.description !== undefined ? body.description : career.description;
    career.isActive = body.isActive ?? career.isActive;
    career.updatedAt = new Date();

    return HttpResponse.json({
      ...career,
      modality: career.modality ? {
        ...career.modality,
        createdAt: career.modality.createdAt.toISOString(),
        updatedAt: career.modality.updatedAt.toISOString(),
      } : undefined,
      createdAt: career.createdAt.toISOString(),
      updatedAt: career.updatedAt.toISOString(),
    });
  }),

  // PATCH /careers/:id (Partial Update)
  http.patch(buildApiUrl('/careers/:id'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const career = findCareerById(id as string);

    if (!career) {
      return HttpResponse.json(
        {
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<UpdateCareerRequest>;

    // Validaciones
    if (body.name !== undefined && (!body.name || body.name.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.shortName !== undefined && (!body.shortName || body.shortName.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre corto no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.modalityId !== undefined) {
      const modality = findModalityById(body.modalityId);
      if (!modality) {
        return HttpResponse.json(
          {
            error: 'Modalidad no encontrada',
            code: 'MODALITY_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    // Verificar duplicados por nombre si se cambia
    if (body.name && body.name.toLowerCase() !== career.name.toLowerCase()) {
      const exists = mockCareers.some(
        (c: Career) => c.id !== id && c.name.toLowerCase() === body.name!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una carrera con ese nombre',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados por nombre corto si se cambia
    if (body.shortName && body.shortName.toLowerCase() !== career.shortName.toLowerCase()) {
      const exists = mockCareers.some(
        (c: Career) => c.id !== id && c.shortName.toLowerCase() === body.shortName!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una carrera con ese nombre corto',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar solo campos proporcionados
    if (body.name !== undefined) {
      career.name = body.name.trim();
    }
    if (body.shortName !== undefined) {
      career.shortName = body.shortName.trim();
    }
    if (body.modalityId !== undefined) {
      career.modalityId = body.modalityId;
      career.modality = body.modality || findModalityById(body.modalityId);
    }
    if (body.description !== undefined) {
      career.description = body.description;
    }
    if (body.isActive !== undefined) {
      career.isActive = body.isActive;
    }
    career.updatedAt = new Date();

    return HttpResponse.json({
      ...career,
      modality: career.modality ? {
        ...career.modality,
        createdAt: career.modality.createdAt.toISOString(),
        updatedAt: career.modality.updatedAt.toISOString(),
      } : undefined,
      createdAt: career.createdAt.toISOString(),
      updatedAt: career.updatedAt.toISOString(),
    });
  }),

  // DELETE /careers/:id
  http.delete(buildApiUrl('/careers/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockCareers.findIndex((career: Career) => career.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockCareers.splice(index, 1);

    return HttpResponse.json({
      message: 'Carrera eliminada exitosamente',
    });
  }),

  // POST /careers/:id/activate
  http.post(buildApiUrl('/careers/:id/activate'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const career = findCareerById(id as string);

    if (!career) {
      return HttpResponse.json(
        {
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    career.isActive = true;
    career.updatedAt = new Date();

    return HttpResponse.json({
      ...career,
      modality: career.modality ? {
        ...career.modality,
        createdAt: career.modality.createdAt.toISOString(),
        updatedAt: career.modality.updatedAt.toISOString(),
      } : undefined,
      createdAt: career.createdAt.toISOString(),
      updatedAt: career.updatedAt.toISOString(),
    });
  }),

  // POST /careers/:id/deactivate
  http.post(buildApiUrl('/careers/:id/deactivate'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const career = findCareerById(id as string);

    if (!career) {
      return HttpResponse.json(
        {
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    career.isActive = false;
    career.updatedAt = new Date();

    return HttpResponse.json({
      ...career,
      modality: career.modality ? {
        ...career.modality,
        createdAt: career.modality.createdAt.toISOString(),
        updatedAt: career.modality.updatedAt.toISOString(),
      } : undefined,
      createdAt: career.createdAt.toISOString(),
      updatedAt: career.updatedAt.toISOString(),
    });
  }),
];
