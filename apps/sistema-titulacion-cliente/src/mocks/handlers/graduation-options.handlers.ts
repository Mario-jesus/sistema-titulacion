import { http, HttpResponse } from 'msw';
import type { GraduationOption } from '@entities/graduation-option';
import { buildApiUrl, delay } from '../utils';
import {
  mockGraduationOptions,
  findGraduationOptionById,
  generateGraduationOptionId,
} from '../data';

/**
 * Handlers para endpoints de opciones de titulación
 */

interface CreateGraduationOptionRequest {
  name: string;
  description: string | null;
  isActive: boolean;
}

interface UpdateGraduationOptionRequest {
  name?: string;
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
  data: GraduationOption[];
  pagination: PaginationData;
}

export const graduationOptionsHandlers = [
  // GET /graduation-options (List)
  http.get(buildApiUrl('/graduation-options'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const search =
      url.searchParams.get('search') || url.searchParams.get('q') || '';

    const validSortFields = ['name', 'createdAt', 'isActive'];
    const requestedSortBy = url.searchParams.get('sortBy') || 'name';
    const sortBy = validSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : 'name';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'asc';
    const sortOrder =
      requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = activeOnly
      ? mockGraduationOptions.filter((opt: GraduationOption) => opt.isActive)
      : [...mockGraduationOptions];

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = filteredData.filter((opt: GraduationOption) => {
        return opt.name?.toLowerCase().includes(searchLower) ?? false;
      });
    }

    filteredData.sort((a, b) => {
      let aValue: string | number | boolean | Date | null;
      let bValue: string | number | boolean | Date | null;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() ?? '';
          bValue = b.name?.toLowerCase() ?? '';
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
      data: paginatedData.map((opt) => ({
        ...opt,
        createdAt: opt.createdAt.toISOString(),
        updatedAt: opt.updatedAt.toISOString(),
      })) as unknown as GraduationOption[],
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

  // GET /graduation-options/:id (Detail)
  http.get(buildApiUrl('/graduation-options/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const option = findGraduationOptionById(id as string);

    if (!option) {
      return HttpResponse.json(
        {
          error: 'Opcion de titulacion no encontrada',
          code: 'GRADUATION_OPTION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...option,
      createdAt: option.createdAt.toISOString(),
      updatedAt: option.updatedAt.toISOString(),
    });
  }),

  // POST /graduation-options (Create)
  http.post(buildApiUrl('/graduation-options'), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateGraduationOptionRequest;

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

    // Verificar duplicados
    const exists = mockGraduationOptions.some(
      (opt: GraduationOption) =>
        opt.name.toLowerCase() === body.name.toLowerCase()
    );
    if (exists) {
      return HttpResponse.json(
        {
          error: 'Ya existe una opción de titulación con ese nombre',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newOption: GraduationOption = {
      id: generateGraduationOptionId(),
      name: body.name.trim(),
      description: body.description?.trim() || null,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGraduationOptions.push(newOption);

    return HttpResponse.json(
      {
        ...newOption,
        createdAt: newOption.createdAt.toISOString(),
        updatedAt: newOption.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /graduation-options/:id (Update)
  http.put(
    buildApiUrl('/graduation-options/:id'),
    async ({ params, request }) => {
      await delay(400);

      const { id } = params;
      const option = findGraduationOptionById(id as string);

      if (!option) {
        return HttpResponse.json(
          {
            error: 'Opcion de titulacion no encontrada',
            code: 'GRADUATION_OPTION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const body = (await request.json()) as UpdateGraduationOptionRequest;

      // Validaciones
      if (
        body.name !== undefined &&
        (!body.name || body.name.trim().length === 0)
      ) {
        return HttpResponse.json(
          {
            error: 'El nombre no puede estar vacío',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Verificar duplicados si se cambia el nombre
      if (body.name && body.name.toLowerCase() !== option.name.toLowerCase()) {
        const exists = mockGraduationOptions.some(
          (opt) =>
            opt.id !== id && opt.name.toLowerCase() === body.name!.toLowerCase()
        );
        if (exists) {
          return HttpResponse.json(
            {
              error: 'Ya existe una opción de titulación con ese nombre',
              code: 'DUPLICATE_ERROR',
            },
            { status: 409 }
          );
        }
      }

      // Actualizar
      option.name = body.name?.trim() ?? option.name;
      option.description =
        body.description !== undefined ? body.description : option.description;
      option.isActive = body.isActive ?? option.isActive;
      option.updatedAt = new Date();

      return HttpResponse.json({
        ...option,
        createdAt: option.createdAt.toISOString(),
        updatedAt: option.updatedAt.toISOString(),
      });
    }
  ),

  // PATCH /graduation-options/:id (Partial Update)
  http.patch(
    buildApiUrl('/graduation-options/:id'),
    async ({ params, request }) => {
      await delay(300);

      const { id } = params;
      const option = findGraduationOptionById(id as string);

      if (!option) {
        return HttpResponse.json(
          {
            error: 'Opcion de titulacion no encontrada',
            code: 'GRADUATION_OPTION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const body =
        (await request.json()) as Partial<UpdateGraduationOptionRequest>;

      // Validaciones
      if (
        body.name !== undefined &&
        (!body.name || body.name.trim().length === 0)
      ) {
        return HttpResponse.json(
          {
            error: 'El nombre no puede estar vacío',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Verificar duplicados si se cambia el nombre
      if (body.name && body.name.toLowerCase() !== option.name.toLowerCase()) {
        const exists = mockGraduationOptions.some(
          (opt) =>
            opt.id !== id && opt.name.toLowerCase() === body.name!.toLowerCase()
        );
        if (exists) {
          return HttpResponse.json(
            {
              error: 'Ya existe una opción de titulación con ese nombre',
              code: 'DUPLICATE_ERROR',
            },
            { status: 409 }
          );
        }
      }

      // Actualizar solo campos proporcionados
      if (body.name !== undefined) {
        option.name = body.name.trim();
      }
      if (body.description !== undefined) {
        option.description = body.description;
      }
      if (body.isActive !== undefined) {
        option.isActive = body.isActive;
      }
      option.updatedAt = new Date();

      return HttpResponse.json({
        ...option,
        createdAt: option.createdAt.toISOString(),
        updatedAt: option.updatedAt.toISOString(),
      });
    }
  ),

  // DELETE /graduation-options/:id
  http.delete(buildApiUrl('/graduation-options/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockGraduationOptions.findIndex((opt) => opt.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Opcion de titulacion no encontrada',
          code: 'GRADUATION_OPTION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockGraduationOptions.splice(index, 1);

    return HttpResponse.json({
      message: 'Opcion de titulacion eliminada exitosamente',
    });
  }),

  // POST /graduation-options/:id/activate
  http.post(
    buildApiUrl('/graduation-options/:id/activate'),
    async ({ params }) => {
      await delay(300);

      const { id } = params;
      const option = findGraduationOptionById(id as string);

      if (!option) {
        return HttpResponse.json(
          {
            error: 'Opcion de titulacion no encontrada',
            code: 'GRADUATION_OPTION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      option.isActive = true;
      option.updatedAt = new Date();

      return HttpResponse.json({
        ...option,
        createdAt: option.createdAt.toISOString(),
        updatedAt: option.updatedAt.toISOString(),
      });
    }
  ),

  // POST /graduation-options/:id/deactivate
  http.post(
    buildApiUrl('/graduation-options/:id/deactivate'),
    async ({ params }) => {
      await delay(300);

      const { id } = params;
      const option = findGraduationOptionById(id as string);

      if (!option) {
        return HttpResponse.json(
          {
            error: 'Opcion de titulacion no encontrada',
            code: 'GRADUATION_OPTION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      option.isActive = false;
      option.updatedAt = new Date();

      return HttpResponse.json({
        ...option,
        createdAt: option.createdAt.toISOString(),
        updatedAt: option.updatedAt.toISOString(),
      });
    }
  ),
];
