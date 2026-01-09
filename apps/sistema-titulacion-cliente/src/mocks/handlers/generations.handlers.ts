import { http, HttpResponse } from 'msw';
import type { Generation } from '@entities/generation';
import { buildApiUrl, delay } from '../utils';
import {
  mockGenerations,
  findGenerationById,
  generateGenerationId,
} from '../data';

/**
 * Handlers para endpoints de generaciones
 */

interface CreateGenerationRequest {
  name: string | null;
  startYear: Date;
  endYear: Date;
  description: string | null;
  isActive: boolean;
}

interface UpdateGenerationRequest {
  name?: string | null;
  startYear?: Date;
  endYear?: Date;
  description?: string | null;
  isActive?: boolean;
}

interface ListResponse {
  data: Generation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}

export const generationsHandlers = [
  // GET /generations (List)
  http.get(buildApiUrl('/generations'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Filtrar solo activas si se solicita
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    let filteredData = activeOnly
      ? mockGenerations.filter((gen: Generation) => gen.isActive)
      : [...mockGenerations];

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = filteredData.slice(offset, offset + limit);

    const response: ListResponse = {
      data: paginatedData.map((gen) => ({
        ...gen,
        startYear: gen.startYear.toISOString(),
        endYear: gen.endYear.toISOString(),
        createdAt: gen.createdAt.toISOString(),
        updatedAt: gen.updatedAt.toISOString(),
      })) as unknown as Generation[],
      pagination: {
        total,
        limit,
        offset,
        totalPages,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /generations/:id (Detail)
  http.get(buildApiUrl('/generations/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const generation = findGenerationById(id as string);

    if (!generation) {
      return HttpResponse.json(
        {
          error: 'Generacion no encontrada',
          code: 'GENERATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...generation,
      startYear: generation.startYear.toISOString(),
      endYear: generation.endYear.toISOString(),
      createdAt: generation.createdAt.toISOString(),
      updatedAt: generation.updatedAt.toISOString(),
    });
  }),

  // POST /generations (Create)
  http.post(buildApiUrl('/generations'), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateGenerationRequest;

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

    if (!body.startYear || !body.endYear) {
      return HttpResponse.json(
        {
          error: 'Las fechas de inicio y fin son requeridas',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const startDate = new Date(body.startYear);
    const endDate = new Date(body.endYear);

    if (startDate >= endDate) {
      return HttpResponse.json(
        {
          error: 'La fecha de inicio debe ser anterior a la fecha de fin',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar duplicados
    const exists = mockGenerations.some(
      (gen: Generation) => gen.name && gen.name.toLowerCase() === body.name!.toLowerCase()
    );
    if (exists) {
      return HttpResponse.json(
        {
          error: 'Ya existe una generación con ese nombre',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newGeneration: Generation = {
      id: generateGenerationId(),
      name: body.name.trim(),
      startYear: startDate,
      endYear: endDate,
      description: body.description?.trim() || null,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGenerations.push(newGeneration);

    return HttpResponse.json(
      {
        ...newGeneration,
        startYear: newGeneration.startYear.toISOString(),
        endYear: newGeneration.endYear.toISOString(),
        createdAt: newGeneration.createdAt.toISOString(),
        updatedAt: newGeneration.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /generations/:id (Update)
  http.put(buildApiUrl('/generations/:id'), async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const generation = findGenerationById(id as string);

    if (!generation) {
      return HttpResponse.json(
        {
          error: 'Generacion no encontrada',
          code: 'GENERATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateGenerationRequest;

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

    if (body.startYear && body.endYear) {
      const startDate = new Date(body.startYear);
      const endDate = new Date(body.endYear);

      if (startDate >= endDate) {
        return HttpResponse.json(
          {
            error: 'La fecha de inicio debe ser anterior a la fecha de fin',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }
    }

    // Verificar duplicados si se cambia el nombre
    if (body.name && body.name.toLowerCase() !== generation.name?.toLowerCase()) {
      const exists = mockGenerations.some(
        (gen: Generation) => gen.id !== id && gen.name && gen.name.toLowerCase() === body.name!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una generación con ese nombre',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar
    generation.name = body.name !== undefined ? body.name.trim() : generation.name;
    generation.startYear = body.startYear ? new Date(body.startYear) : generation.startYear;
    generation.endYear = body.endYear ? new Date(body.endYear) : generation.endYear;
    generation.description = body.description !== undefined ? body.description : generation.description;
    generation.isActive = body.isActive ?? generation.isActive;
    generation.updatedAt = new Date();

    // Validar fechas después de actualizar
    if (generation.startYear >= generation.endYear) {
      return HttpResponse.json(
        {
          error: 'La fecha de inicio debe ser anterior a la fecha de fin',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      ...generation,
      startYear: generation.startYear.toISOString(),
      endYear: generation.endYear.toISOString(),
      createdAt: generation.createdAt.toISOString(),
      updatedAt: generation.updatedAt.toISOString(),
    });
  }),

  // PATCH /generations/:id (Partial Update)
  http.patch(buildApiUrl('/generations/:id'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const generation = findGenerationById(id as string);

    if (!generation) {
      return HttpResponse.json(
        {
          error: 'Generacion no encontrada',
          code: 'GENERATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<UpdateGenerationRequest>;

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

    // Verificar duplicados si se cambia el nombre
    if (body.name && body.name.toLowerCase() !== generation.name?.toLowerCase()) {
      const exists = mockGenerations.some(
        (gen: Generation) => gen.id !== id && gen.name && gen.name.toLowerCase() === body.name!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una generación con ese nombre',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Validar fechas si se actualizan
    const newStartYear = body.startYear ? new Date(body.startYear) : generation.startYear;
    const newEndYear = body.endYear ? new Date(body.endYear) : generation.endYear;

    if (newStartYear >= newEndYear) {
      return HttpResponse.json(
        {
          error: 'La fecha de inicio debe ser anterior a la fecha de fin',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Actualizar solo campos proporcionados
    if (body.name !== undefined) {
      generation.name = body.name.trim();
    }
    if (body.startYear !== undefined) {
      generation.startYear = new Date(body.startYear);
    }
    if (body.endYear !== undefined) {
      generation.endYear = new Date(body.endYear);
    }
    if (body.description !== undefined) {
      generation.description = body.description;
    }
    if (body.isActive !== undefined) {
      generation.isActive = body.isActive;
    }
    generation.updatedAt = new Date();

    return HttpResponse.json({
      ...generation,
      startYear: generation.startYear.toISOString(),
      endYear: generation.endYear.toISOString(),
      createdAt: generation.createdAt.toISOString(),
      updatedAt: generation.updatedAt.toISOString(),
    });
  }),

  // DELETE /generations/:id
  http.delete(buildApiUrl('/generations/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockGenerations.findIndex((gen: Generation) => gen.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Generacion no encontrada',
          code: 'GENERATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockGenerations.splice(index, 1);

    return HttpResponse.json({
      message: 'Generacion eliminada exitosamente',
    });
  }),

  // POST /generations/:id/activate
  http.post(buildApiUrl('/generations/:id/activate'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const generation = findGenerationById(id as string);

    if (!generation) {
      return HttpResponse.json(
        {
          error: 'Generacion no encontrada',
          code: 'GENERATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    generation.isActive = true;
    generation.updatedAt = new Date();

    return HttpResponse.json({
      ...generation,
      startYear: generation.startYear.toISOString(),
      endYear: generation.endYear.toISOString(),
      createdAt: generation.createdAt.toISOString(),
      updatedAt: generation.updatedAt.toISOString(),
    });
  }),

  // POST /generations/:id/deactivate
  http.post(buildApiUrl('/generations/:id/deactivate'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const generation = findGenerationById(id as string);

    if (!generation) {
      return HttpResponse.json(
        {
          error: 'Generacion no encontrada',
          code: 'GENERATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    generation.isActive = false;
    generation.updatedAt = new Date();

    return HttpResponse.json({
      ...generation,
      startYear: generation.startYear.toISOString(),
      endYear: generation.endYear.toISOString(),
      createdAt: generation.createdAt.toISOString(),
      updatedAt: generation.updatedAt.toISOString(),
    });
  }),
];
