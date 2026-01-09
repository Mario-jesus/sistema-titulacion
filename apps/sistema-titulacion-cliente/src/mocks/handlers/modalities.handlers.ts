import { http, HttpResponse } from 'msw';
import type { Modality } from '@entities/modality';
import { buildApiUrl, delay } from '../utils';
import {
  mockModalities,
  findModalityById,
  generateModalityId,
} from '../data';

/**
 * Handlers para endpoints de modalidades
 */

interface CreateModalityRequest {
  name: string;
  description: string | null;
  isActive: boolean;
}

interface UpdateModalityRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

interface ListResponse {
  data: Modality[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}

export const modalitiesHandlers = [
  // GET /modalities (List)
  http.get(buildApiUrl('/modalities'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Filtrar solo activas si se solicita
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    let filteredData = activeOnly
      ? mockModalities.filter((mod: Modality) => mod.isActive)
      : [...mockModalities];

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = filteredData.slice(offset, offset + limit);

    const response: ListResponse = {
      data: paginatedData.map((mod) => ({
        ...mod,
        createdAt: mod.createdAt.toISOString(),
        updatedAt: mod.updatedAt.toISOString(),
      })) as unknown as Modality[],
      pagination: {
        total,
        limit,
        offset,
        totalPages,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /modalities/:id (Detail)
  http.get(buildApiUrl('/modalities/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const modality = findModalityById(id as string);

    if (!modality) {
      return HttpResponse.json(
        {
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...modality,
      createdAt: modality.createdAt.toISOString(),
      updatedAt: modality.updatedAt.toISOString(),
    });
  }),

  // POST /modalities (Create)
  http.post(buildApiUrl('/modalities'), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateModalityRequest;

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
    const exists = mockModalities.some(
      (mod: Modality) => mod.name.toLowerCase() === body.name.toLowerCase()
    );
    if (exists) {
      return HttpResponse.json(
        {
          error: 'Ya existe una modalidad con ese nombre',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newModality: Modality = {
      id: generateModalityId(),
      name: body.name.trim(),
      description: body.description?.trim() || null,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockModalities.push(newModality);

    return HttpResponse.json(
      {
        ...newModality,
        createdAt: newModality.createdAt.toISOString(),
        updatedAt: newModality.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /modalities/:id (Update)
  http.put(buildApiUrl('/modalities/:id'), async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const modality = findModalityById(id as string);

    if (!modality) {
      return HttpResponse.json(
        {
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateModalityRequest;

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
    if (body.name && body.name.toLowerCase() !== modality.name.toLowerCase()) {
      const exists = mockModalities.some(
        (mod: Modality) => mod.id !== id && mod.name.toLowerCase() === body.name!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una modalidad con ese nombre',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar
    modality.name = body.name?.trim() ?? modality.name;
    modality.description = body.description !== undefined ? body.description : modality.description;
    modality.isActive = body.isActive ?? modality.isActive;
    modality.updatedAt = new Date();

    return HttpResponse.json({
      ...modality,
      createdAt: modality.createdAt.toISOString(),
      updatedAt: modality.updatedAt.toISOString(),
    });
  }),

  // PATCH /modalities/:id (Partial Update)
  http.patch(buildApiUrl('/modalities/:id'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const modality = findModalityById(id as string);

    if (!modality) {
      return HttpResponse.json(
        {
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<UpdateModalityRequest>;

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
    if (body.name && body.name.toLowerCase() !== modality.name.toLowerCase()) {
      const exists = mockModalities.some(
        (mod: Modality) => mod.id !== id && mod.name.toLowerCase() === body.name!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe una modalidad con ese nombre',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar solo campos proporcionados
    if (body.name !== undefined) {
      modality.name = body.name.trim();
    }
    if (body.description !== undefined) {
      modality.description = body.description;
    }
    if (body.isActive !== undefined) {
      modality.isActive = body.isActive;
    }
    modality.updatedAt = new Date();

    return HttpResponse.json({
      ...modality,
      createdAt: modality.createdAt.toISOString(),
      updatedAt: modality.updatedAt.toISOString(),
    });
  }),

  // DELETE /modalities/:id
  http.delete(buildApiUrl('/modalities/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockModalities.findIndex((mod: Modality) => mod.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockModalities.splice(index, 1);

    return HttpResponse.json({
      message: 'Modalidad eliminada exitosamente',
    });
  }),

  // POST /modalities/:id/activate
  http.post(buildApiUrl('/modalities/:id/activate'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const modality = findModalityById(id as string);

    if (!modality) {
      return HttpResponse.json(
        {
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    modality.isActive = true;
    modality.updatedAt = new Date();

    return HttpResponse.json({
      ...modality,
      createdAt: modality.createdAt.toISOString(),
      updatedAt: modality.updatedAt.toISOString(),
    });
  }),

  // POST /modalities/:id/deactivate
  http.post(buildApiUrl('/modalities/:id/deactivate'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const modality = findModalityById(id as string);

    if (!modality) {
      return HttpResponse.json(
        {
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    modality.isActive = false;
    modality.updatedAt = new Date();

    return HttpResponse.json({
      ...modality,
      createdAt: modality.createdAt.toISOString(),
      updatedAt: modality.updatedAt.toISOString(),
    });
  }),
];
