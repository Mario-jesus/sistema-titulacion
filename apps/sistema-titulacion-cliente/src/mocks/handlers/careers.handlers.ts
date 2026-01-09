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

interface ListResponse {
  data: Career[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}

export const careersHandlers = [
  // GET /careers (List)
  http.get(buildApiUrl('/careers'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Filtrar solo activas si se solicita
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    let filteredData = activeOnly
      ? mockCareers.filter((career: Career) => career.isActive)
      : [...mockCareers];

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = filteredData.slice(offset, offset + limit);

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
        offset,
        totalPages,
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
