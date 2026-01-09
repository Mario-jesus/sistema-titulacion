import { http, HttpResponse } from 'msw';
import type { Graduation } from '@entities/graduation';
import { buildApiUrl, delay } from '../utils';
import { findStudentById } from '../data/students';
import { findGraduationOptionById } from '../data/graduation-options';
import {
  mockGraduations,
  findGraduationById,
  findGraduationByStudentId,
  generateGraduationId,
} from '../data';

/**
 * Handlers para endpoints de titulaciones
 */

interface CreateGraduationRequest {
  studentId: string;
  graduationOptionId: string | null;
  date: Date;
  isGraduated: boolean;
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes: string | null;
}

interface UpdateGraduationRequest {
  studentId?: string;
  graduationOptionId?: string | null;
  date?: Date;
  isGraduated?: boolean;
  president?: string;
  secretary?: string;
  vocal?: string;
  substituteVocal?: string;
  notes?: string | null;
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
  data: Graduation[];
  pagination: PaginationData;
}

export const graduationsHandlers = [
  // GET /graduations (List)
  http.get(buildApiUrl('/graduations'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const studentId = url.searchParams.get('studentId');
    const isGraduated = url.searchParams.get('isGraduated');
    const graduationOptionId = url.searchParams.get('graduationOptionId');
    const search = url.searchParams.get('search') || url.searchParams.get('q') || '';

    // Validar y normalizar parámetros de ordenamiento
    const validSortFields = ['date', 'createdAt', 'isGraduated'];
    const requestedSortBy = url.searchParams.get('sortBy') || 'date';
    const sortBy = validSortFields.includes(requestedSortBy) ? requestedSortBy : 'date';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'desc';
    const sortOrder = requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = [...mockGraduations];

    // Filtrar por estudiante si se especifica
    if (studentId) {
      filteredData = filteredData.filter(
        (graduation: Graduation) => graduation.studentId === studentId
      );
    }

    // Filtrar por estado de titulación si se especifica
    if (isGraduated !== null && isGraduated !== '') {
      const graduated = isGraduated === 'true';
      filteredData = filteredData.filter(
        (graduation: Graduation) => graduation.isGraduated === graduated
      );
    }

    // Filtrar por opción de titulación si se especifica
    if (graduationOptionId) {
      filteredData = filteredData.filter(
        (graduation: Graduation) => graduation.graduationOptionId === graduationOptionId
      );
    }

    // Búsqueda por texto (busca en notas, presidente, secretario, vocal)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = filteredData.filter((graduation: Graduation) => {
        const notesMatch = graduation.notes?.toLowerCase().includes(searchLower) ?? false;
        const presidentMatch = graduation.president?.toLowerCase().includes(searchLower) ?? false;
        const secretaryMatch = graduation.secretary?.toLowerCase().includes(searchLower) ?? false;
        const vocalMatch = graduation.vocal?.toLowerCase().includes(searchLower) ?? false;
        return notesMatch || presidentMatch || secretaryMatch || vocalMatch;
      });
    }

    // Ordenamiento
    filteredData.sort((a, b) => {
      let aValue: string | number | boolean | Date | null;
      let bValue: string | number | boolean | Date | null;

      switch (sortBy) {
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'isGraduated':
          aValue = a.isGraduated ? 1 : 0;
          bValue = b.isGraduated ? 1 : 0;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
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
      data: paginatedData.map((graduation) => ({
        ...graduation,
        date: graduation.date.toISOString().split('T')[0],
        createdAt: graduation.createdAt.toISOString(),
        updatedAt: graduation.updatedAt.toISOString(),
      })) as unknown as Graduation[],
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

  // GET /graduations/:id (Detail)
  http.get(buildApiUrl('/graduations/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const graduation = findGraduationById(id as string);

    if (!graduation) {
      return HttpResponse.json(
        {
          error: 'Titulación no encontrada',
          code: 'GRADUATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...graduation,
      date: graduation.date.toISOString().split('T')[0],
      createdAt: graduation.createdAt.toISOString(),
      updatedAt: graduation.updatedAt.toISOString(),
    });
  }),

  // POST /graduations (Create)
  http.post(buildApiUrl('/graduations'), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateGraduationRequest;

    // Validaciones básicas
    if (!body.studentId) {
      return HttpResponse.json(
        {
          error: 'El ID del estudiante es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.date) {
      return HttpResponse.json(
        {
          error: 'La fecha de titulación es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que la opción de titulación existe (si se proporciona)
    if (body.graduationOptionId) {
      const graduationOption = findGraduationOptionById(body.graduationOptionId);
      if (!graduationOption) {
        return HttpResponse.json(
          {
            error: 'Opcion de titulacion no encontrada',
            code: 'GRADUATION_OPTION_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    if (!body.president || body.president.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El presidente del comité es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.secretary || body.secretary.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El secretario del comité es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.vocal || body.vocal.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El vocal del comité es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.substituteVocal || body.substituteVocal.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El vocal suplente del comité es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe
    const student = findStudentById(body.studentId);
    if (!student) {
      return HttpResponse.json(
        {
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Validar que solo estudiantes egresados pueden estar titulados
    if (body.isGraduated === true && !student.isEgressed) {
      return HttpResponse.json(
        {
          error: 'Solo los estudiantes egresados pueden estar titulados',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que no exista ya una titulación para este estudiante
    const existingGraduation = findGraduationByStudentId(body.studentId);
    if (existingGraduation) {
      return HttpResponse.json(
        {
          error: 'Ya existe una titulación para este estudiante',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newGraduation: Graduation = {
      id: generateGraduationId(),
      studentId: body.studentId,
      graduationOptionId: body.graduationOptionId,
      date: new Date(body.date),
      isGraduated: body.isGraduated ?? false,
      president: body.president.trim(),
      secretary: body.secretary.trim(),
      vocal: body.vocal.trim(),
      substituteVocal: body.substituteVocal.trim(),
      notes: body.notes?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGraduations.push(newGraduation);

    return HttpResponse.json(
      {
        ...newGraduation,
        date: newGraduation.date.toISOString().split('T')[0],
        createdAt: newGraduation.createdAt.toISOString(),
        updatedAt: newGraduation.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /graduations/:id (Update)
  http.put(buildApiUrl('/graduations/:id'), async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const graduation = findGraduationById(id as string);

    if (!graduation) {
      return HttpResponse.json(
        {
          error: 'Titulación no encontrada',
          code: 'GRADUATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateGraduationRequest;

    // Validaciones
    if (body.president !== undefined && (!body.president || body.president.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El presidente del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.secretary !== undefined && (!body.secretary || body.secretary.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El secretario del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.vocal !== undefined && (!body.vocal || body.vocal.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El vocal del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.substituteVocal !== undefined && (!body.substituteVocal || body.substituteVocal.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El vocal suplente del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Obtener el estudiante actual o el nuevo si se cambia
    const currentStudentId = body.studentId ?? graduation.studentId;
    const currentStudent = findStudentById(currentStudentId);
    if (!currentStudent) {
      return HttpResponse.json(
        {
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    if (body.studentId !== undefined) {
      // Verificar duplicados si se cambia el estudiante
      if (body.studentId !== graduation.studentId) {
        const existingGraduation = findGraduationByStudentId(body.studentId);
        if (existingGraduation) {
          return HttpResponse.json(
            {
              error: 'Ya existe una titulación para este estudiante',
              code: 'DUPLICATE_ERROR',
            },
            { status: 409 }
          );
        }
      }
    }

    // Validar que solo estudiantes egresados pueden estar titulados
    const newIsGraduated = body.isGraduated ?? graduation.isGraduated;
    if (newIsGraduated === true && !currentStudent.isEgressed) {
      return HttpResponse.json(
        {
          error: 'Solo los estudiantes egresados pueden estar titulados',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que la opción de titulación existe (si se proporciona)
    if (body.graduationOptionId !== undefined && body.graduationOptionId) {
      const graduationOption = findGraduationOptionById(body.graduationOptionId);
      if (!graduationOption) {
        return HttpResponse.json(
          {
            error: 'Opcion de titulacion no encontrada',
            code: 'GRADUATION_OPTION_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    // Actualizar
    graduation.studentId = body.studentId ?? graduation.studentId;
    graduation.graduationOptionId = body.graduationOptionId !== undefined ? body.graduationOptionId : graduation.graduationOptionId;
    graduation.date = body.date ? new Date(body.date) : graduation.date;
    graduation.isGraduated = body.isGraduated ?? graduation.isGraduated;
    graduation.president = body.president?.trim() ?? graduation.president;
    graduation.secretary = body.secretary?.trim() ?? graduation.secretary;
    graduation.vocal = body.vocal?.trim() ?? graduation.vocal;
    graduation.substituteVocal = body.substituteVocal?.trim() ?? graduation.substituteVocal;
    graduation.notes = body.notes !== undefined ? (body.notes?.trim() || null) : graduation.notes;
    graduation.updatedAt = new Date();

    return HttpResponse.json({
      ...graduation,
      date: graduation.date.toISOString().split('T')[0],
      createdAt: graduation.createdAt.toISOString(),
      updatedAt: graduation.updatedAt.toISOString(),
    });
  }),

  // PATCH /graduations/:id (Partial Update)
  http.patch(buildApiUrl('/graduations/:id'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const graduation = findGraduationById(id as string);

    if (!graduation) {
      return HttpResponse.json(
        {
          error: 'Titulación no encontrada',
          code: 'GRADUATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<UpdateGraduationRequest>;

    // Validaciones
    if (body.president !== undefined && (!body.president || body.president.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El presidente del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.secretary !== undefined && (!body.secretary || body.secretary.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El secretario del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.vocal !== undefined && (!body.vocal || body.vocal.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El vocal del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.substituteVocal !== undefined && (!body.substituteVocal || body.substituteVocal.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El vocal suplente del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Obtener el estudiante actual o el nuevo si se cambia
    const currentStudentId = body.studentId ?? graduation.studentId;
    const currentStudent = findStudentById(currentStudentId);
    if (!currentStudent) {
      return HttpResponse.json(
        {
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    if (body.studentId !== undefined) {
      // Verificar duplicados si se cambia el estudiante
      if (body.studentId !== graduation.studentId) {
        const existingGraduation = findGraduationByStudentId(body.studentId);
        if (existingGraduation) {
          return HttpResponse.json(
            {
              error: 'Ya existe una titulación para este estudiante',
              code: 'DUPLICATE_ERROR',
            },
            { status: 409 }
          );
        }
      }
    }

    // Validar que solo estudiantes egresados pueden estar titulados
    const newIsGraduated = body.isGraduated !== undefined ? body.isGraduated : graduation.isGraduated;
    if (newIsGraduated === true && !currentStudent.isEgressed) {
      return HttpResponse.json(
        {
          error: 'Solo los estudiantes egresados pueden estar titulados',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que la opción de titulación existe (si se proporciona)
    if (body.graduationOptionId !== undefined && body.graduationOptionId) {
      const graduationOption = findGraduationOptionById(body.graduationOptionId);
      if (!graduationOption) {
        return HttpResponse.json(
          {
            error: 'Opcion de titulacion no encontrada',
            code: 'GRADUATION_OPTION_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    // Actualizar solo campos proporcionados
    if (body.studentId !== undefined) {
      graduation.studentId = body.studentId;
    }
    if (body.graduationOptionId !== undefined) {
      graduation.graduationOptionId = body.graduationOptionId;
    }
    if (body.date !== undefined) {
      graduation.date = new Date(body.date);
    }
    if (body.isGraduated !== undefined) {
      graduation.isGraduated = body.isGraduated;
    }
    if (body.president !== undefined) {
      graduation.president = body.president.trim();
    }
    if (body.secretary !== undefined) {
      graduation.secretary = body.secretary.trim();
    }
    if (body.vocal !== undefined) {
      graduation.vocal = body.vocal.trim();
    }
    if (body.substituteVocal !== undefined) {
      graduation.substituteVocal = body.substituteVocal.trim();
    }
    if (body.notes !== undefined) {
      graduation.notes = body.notes?.trim() || null;
    }
    graduation.updatedAt = new Date();

    return HttpResponse.json({
      ...graduation,
      date: graduation.date.toISOString().split('T')[0],
      createdAt: graduation.createdAt.toISOString(),
      updatedAt: graduation.updatedAt.toISOString(),
    });
  }),

  // DELETE /graduations/:id
  http.delete(buildApiUrl('/graduations/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockGraduations.findIndex((graduation: Graduation) => graduation.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Titulación no encontrada',
          code: 'GRADUATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockGraduations.splice(index, 1);

    return HttpResponse.json({
      message: 'Titulación eliminada exitosamente',
    });
  }),
];
