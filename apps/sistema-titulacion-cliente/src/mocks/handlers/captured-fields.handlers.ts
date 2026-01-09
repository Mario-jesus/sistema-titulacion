import { http, HttpResponse } from 'msw';
import type { CapturedFields } from '@entities/captured-fields';
import { buildApiUrl, delay } from '../utils';
import { findStudentById } from '../data/students';
import {
  mockCapturedFields,
  findCapturedFieldsById,
  generateCapturedFieldsId,
} from '../data';

/**
 * Handlers para endpoints de campos capturados
 */

interface CreateCapturedFieldsRequest {
  studentId: string;
  processDate: Date;
  projectName: string;
  company: string;
}

interface UpdateCapturedFieldsRequest {
  studentId?: string;
  processDate?: Date;
  projectName?: string;
  company?: string;
}

interface ListResponse {
  data: CapturedFields[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}

export const capturedFieldsHandlers = [
  // GET /captured-fields (List)
  http.get(buildApiUrl('/captured-fields'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const studentId = url.searchParams.get('studentId');

    let filteredData = [...mockCapturedFields];

    // Filtrar por estudiante si se especifica
    if (studentId) {
      filteredData = filteredData.filter(
        (fields: CapturedFields) => fields.studentId === studentId
      );
    }

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = filteredData.slice(offset, offset + limit);

    const response: ListResponse = {
      data: paginatedData.map((fields) => ({
        ...fields,
        processDate: fields.processDate.toISOString().split('T')[0],
        createdAt: fields.createdAt.toISOString(),
        updatedAt: fields.updatedAt.toISOString(),
      })) as unknown as CapturedFields[],
      pagination: {
        total,
        limit,
        offset,
        totalPages,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /captured-fields/:id (Detail)
  http.get(buildApiUrl('/captured-fields/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const fields = findCapturedFieldsById(id as string);

    if (!fields) {
      return HttpResponse.json(
        {
          error: 'Campos capturados no encontrados',
          code: 'CAPTURED_FIELDS_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...fields,
      processDate: fields.processDate.toISOString().split('T')[0],
      createdAt: fields.createdAt.toISOString(),
      updatedAt: fields.updatedAt.toISOString(),
    });
  }),

  // POST /captured-fields (Create)
  http.post(buildApiUrl('/captured-fields'), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateCapturedFieldsRequest;

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

    if (!body.projectName || body.projectName.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre del proyecto es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.company || body.company.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre de la empresa es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.processDate) {
      return HttpResponse.json(
        {
          error: 'La fecha de proceso es requerida',
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

    const newCapturedFields: CapturedFields = {
      id: generateCapturedFieldsId(),
      studentId: body.studentId,
      processDate: new Date(body.processDate),
      projectName: body.projectName.trim(),
      company: body.company.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCapturedFields.push(newCapturedFields);

    return HttpResponse.json(
      {
        ...newCapturedFields,
        processDate: newCapturedFields.processDate.toISOString().split('T')[0],
        createdAt: newCapturedFields.createdAt.toISOString(),
        updatedAt: newCapturedFields.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /captured-fields/:id (Update)
  http.put(buildApiUrl('/captured-fields/:id'), async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const fields = findCapturedFieldsById(id as string);

    if (!fields) {
      return HttpResponse.json(
        {
          error: 'Campos capturados no encontrados',
          code: 'CAPTURED_FIELDS_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateCapturedFieldsRequest;

    // Validaciones
    if (body.projectName !== undefined && (!body.projectName || body.projectName.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre del proyecto no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.company !== undefined && (!body.company || body.company.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre de la empresa no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.studentId !== undefined) {
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
    }

    // Actualizar
    fields.studentId = body.studentId ?? fields.studentId;
    fields.processDate = body.processDate ? new Date(body.processDate) : fields.processDate;
    fields.projectName = body.projectName?.trim() ?? fields.projectName;
    fields.company = body.company?.trim() ?? fields.company;
    fields.updatedAt = new Date();

    return HttpResponse.json({
      ...fields,
      processDate: fields.processDate.toISOString().split('T')[0],
      createdAt: fields.createdAt.toISOString(),
      updatedAt: fields.updatedAt.toISOString(),
    });
  }),

  // PATCH /captured-fields/:id (Partial Update)
  http.patch(buildApiUrl('/captured-fields/:id'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const fields = findCapturedFieldsById(id as string);

    if (!fields) {
      return HttpResponse.json(
        {
          error: 'Campos capturados no encontrados',
          code: 'CAPTURED_FIELDS_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<UpdateCapturedFieldsRequest>;

    // Validaciones
    if (body.projectName !== undefined && (!body.projectName || body.projectName.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre del proyecto no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.company !== undefined && (!body.company || body.company.trim().length === 0)) {
      return HttpResponse.json(
        {
          error: 'El nombre de la empresa no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.studentId !== undefined) {
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
    }

    // Actualizar solo campos proporcionados
    if (body.studentId !== undefined) {
      fields.studentId = body.studentId;
    }
    if (body.processDate !== undefined) {
      fields.processDate = new Date(body.processDate);
    }
    if (body.projectName !== undefined) {
      fields.projectName = body.projectName.trim();
    }
    if (body.company !== undefined) {
      fields.company = body.company.trim();
    }
    fields.updatedAt = new Date();

    return HttpResponse.json({
      ...fields,
      processDate: fields.processDate.toISOString().split('T')[0],
      createdAt: fields.createdAt.toISOString(),
      updatedAt: fields.updatedAt.toISOString(),
    });
  }),

  // DELETE /captured-fields/:id
  http.delete(buildApiUrl('/captured-fields/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockCapturedFields.findIndex((fields: CapturedFields) => fields.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Campos capturados no encontrados',
          code: 'CAPTURED_FIELDS_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockCapturedFields.splice(index, 1);

    return HttpResponse.json({
      message: 'Campos capturados eliminados exitosamente',
    });
  }),
];
