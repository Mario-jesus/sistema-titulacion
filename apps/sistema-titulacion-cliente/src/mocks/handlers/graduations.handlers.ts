import { http, HttpResponse } from 'msw';
import type { Graduation } from '@entities/graduation';
import { StudentStatus } from '@entities/student';
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
  graduationDate: Date | string;
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
  graduationDate?: Date | string;
  isGraduated?: boolean;
  president?: string;
  secretary?: string;
  vocal?: string;
  substituteVocal?: string;
  notes?: string | null;
}

export const graduationsHandlers = [
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
      graduationDate: graduation.graduationDate.toISOString(),
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

    if (!body.graduationDate) {
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
      const graduationOption = findGraduationOptionById(
        body.graduationOptionId
      );
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

    // Validar que estudiantes pausados o cancelados no pueden estar graduados
    if (
      body.isGraduated === true &&
      (student.status === StudentStatus.PAUSADO ||
        student.status === StudentStatus.CANCELADO)
    ) {
      return HttpResponse.json(
        {
          error:
            'No se puede marcar como graduado: el estudiante debe estar activo (no puede estar pausado o cancelado)',
          code: 'INVALID_STUDENT_STATUS',
        },
        { status: 400 }
      );
    }

    const graduationDate =
      body.graduationDate instanceof Date
        ? body.graduationDate
        : new Date(body.graduationDate);

    // Validar que graduationDate sea menor o igual que la fecha actual cuando se marca como titulado
    if (body.isGraduated === true) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const normalizedGraduationDate = new Date(graduationDate);
      normalizedGraduationDate.setHours(0, 0, 0, 0);

      if (normalizedGraduationDate > currentDate) {
        return HttpResponse.json(
          {
            error:
              'No se puede marcar como titulado: la fecha de titulación debe ser menor o igual a la fecha actual',
            code: 'INVALID_GRADUATION_DATE',
          },
          { status: 400 }
        );
      }
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
      graduationDate,
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
        graduationDate: newGraduation.graduationDate.toISOString(),
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
    if (
      body.president !== undefined &&
      (!body.president || body.president.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El presidente del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.secretary !== undefined &&
      (!body.secretary || body.secretary.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El secretario del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.vocal !== undefined &&
      (!body.vocal || body.vocal.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El vocal del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.substituteVocal !== undefined &&
      (!body.substituteVocal || body.substituteVocal.trim().length === 0)
    ) {
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

    // Validar que estudiantes pausados o cancelados no pueden estar graduados
    if (
      newIsGraduated === true &&
      (currentStudent.status === StudentStatus.PAUSADO ||
        currentStudent.status === StudentStatus.CANCELADO)
    ) {
      return HttpResponse.json(
        {
          error:
            'No se puede marcar como graduado: el estudiante debe estar activo (no puede estar pausado o cancelado)',
          code: 'INVALID_STUDENT_STATUS',
        },
        { status: 400 }
      );
    }

    // Validar que graduationDate sea menor o igual que la fecha actual cuando se marca como titulado
    if (newIsGraduated === true) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const graduationDateToCheck =
        body.graduationDate !== undefined
          ? body.graduationDate instanceof Date
            ? body.graduationDate
            : new Date(body.graduationDate)
          : graduation.graduationDate;
      const normalizedGraduationDate = new Date(graduationDateToCheck);
      normalizedGraduationDate.setHours(0, 0, 0, 0);

      if (normalizedGraduationDate > currentDate) {
        return HttpResponse.json(
          {
            error:
              'No se puede marcar como titulado: la fecha de titulación debe ser menor o igual a la fecha actual',
            code: 'INVALID_GRADUATION_DATE',
          },
          { status: 400 }
        );
      }
    }

    // Verificar que la opción de titulación existe (si se proporciona)
    if (body.graduationOptionId !== undefined && body.graduationOptionId) {
      const graduationOption = findGraduationOptionById(
        body.graduationOptionId
      );
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
    graduation.graduationOptionId =
      body.graduationOptionId !== undefined
        ? body.graduationOptionId
        : graduation.graduationOptionId;
    if (body.graduationDate !== undefined) {
      graduation.graduationDate =
        body.graduationDate instanceof Date
          ? body.graduationDate
          : new Date(body.graduationDate);
    }
    graduation.isGraduated = body.isGraduated ?? graduation.isGraduated;
    graduation.president = body.president?.trim() ?? graduation.president;
    graduation.secretary = body.secretary?.trim() ?? graduation.secretary;
    graduation.vocal = body.vocal?.trim() ?? graduation.vocal;
    graduation.substituteVocal =
      body.substituteVocal?.trim() ?? graduation.substituteVocal;
    graduation.notes =
      body.notes !== undefined ? body.notes?.trim() || null : graduation.notes;
    graduation.updatedAt = new Date();

    return HttpResponse.json({
      ...graduation,
      graduationDate: graduation.graduationDate.toISOString(),
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
    if (
      body.president !== undefined &&
      (!body.president || body.president.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El presidente del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.secretary !== undefined &&
      (!body.secretary || body.secretary.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El secretario del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.vocal !== undefined &&
      (!body.vocal || body.vocal.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El vocal del comité no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.substituteVocal !== undefined &&
      (!body.substituteVocal || body.substituteVocal.trim().length === 0)
    ) {
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
    const newIsGraduated =
      body.isGraduated !== undefined
        ? body.isGraduated
        : graduation.isGraduated;
    if (newIsGraduated === true && !currentStudent.isEgressed) {
      return HttpResponse.json(
        {
          error: 'Solo los estudiantes egresados pueden estar titulados',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar que estudiantes pausados o cancelados no pueden estar graduados
    if (
      newIsGraduated === true &&
      (currentStudent.status === StudentStatus.PAUSADO ||
        currentStudent.status === StudentStatus.CANCELADO)
    ) {
      return HttpResponse.json(
        {
          error:
            'No se puede marcar como graduado: el estudiante debe estar activo (no puede estar pausado o cancelado)',
          code: 'INVALID_STUDENT_STATUS',
        },
        { status: 400 }
      );
    }

    // Validar que graduationDate sea menor o igual que la fecha actual cuando se marca como titulado
    if (newIsGraduated === true) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const graduationDateToCheck =
        body.graduationDate !== undefined
          ? body.graduationDate instanceof Date
            ? body.graduationDate
            : new Date(body.graduationDate)
          : graduation.graduationDate;
      const normalizedGraduationDate = new Date(graduationDateToCheck);
      normalizedGraduationDate.setHours(0, 0, 0, 0);

      if (normalizedGraduationDate > currentDate) {
        return HttpResponse.json(
          {
            error:
              'No se puede marcar como titulado: la fecha de titulación debe ser menor o igual a la fecha actual',
            code: 'INVALID_GRADUATION_DATE',
          },
          { status: 400 }
        );
      }
    }

    // Verificar que la opción de titulación existe (si se proporciona)
    if (body.graduationOptionId !== undefined && body.graduationOptionId) {
      const graduationOption = findGraduationOptionById(
        body.graduationOptionId
      );
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
    if (body.graduationDate !== undefined) {
      graduation.graduationDate =
        body.graduationDate instanceof Date
          ? body.graduationDate
          : new Date(body.graduationDate);
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
      graduationDate: graduation.graduationDate.toISOString(),
      createdAt: graduation.createdAt.toISOString(),
      updatedAt: graduation.updatedAt.toISOString(),
    });
  }),

  // DELETE /graduations/:id
  http.delete(buildApiUrl('/graduations/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockGraduations.findIndex(
      (graduation: Graduation) => graduation.id === id
    );

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

  // POST /graduations/:idStudent/graduate (Marcar como titulado)
  http.post(
    buildApiUrl('/graduations/:idStudent/graduate'),
    async ({ params }) => {
      await delay(300);

      const { idStudent } = params;
      const graduation = findGraduationByStudentId(idStudent as string);

      if (!graduation) {
        return HttpResponse.json(
          {
            error: 'Titulación no encontrada para este estudiante',
            code: 'GRADUATION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // Validar que graduationDate sea menor o igual que la fecha actual
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día para comparación
      const graduationDate = new Date(graduation.graduationDate);
      graduationDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día para comparación

      if (graduationDate > currentDate) {
        return HttpResponse.json(
          {
            error:
              'No se puede marcar como titulado: la fecha de titulación debe ser menor o igual a la fecha actual',
            code: 'INVALID_GRADUATION_DATE',
          },
          { status: 400 }
        );
      }

      // Verificar que el estudiante existe y está egresado
      const student = findStudentById(graduation.studentId);
      if (!student) {
        return HttpResponse.json(
          {
            error: 'Estudiante no encontrado',
            code: 'STUDENT_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (!student.isEgressed) {
        return HttpResponse.json(
          {
            error: 'Solo los estudiantes egresados pueden estar titulados',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Validar que estudiantes pausados o cancelados no pueden estar graduados
      if (
        student.status === StudentStatus.PAUSADO ||
        student.status === StudentStatus.CANCELADO
      ) {
        return HttpResponse.json(
          {
            error:
              'No se puede marcar como graduado: el estudiante debe estar activo (no puede estar pausado o cancelado)',
            code: 'INVALID_STUDENT_STATUS',
          },
          { status: 400 }
        );
      }

      graduation.isGraduated = true;
      graduation.updatedAt = new Date();

      return HttpResponse.json({
        ...graduation,
        graduationDate: graduation.graduationDate.toISOString(),
        createdAt: graduation.createdAt.toISOString(),
        updatedAt: graduation.updatedAt.toISOString(),
      });
    }
  ),

  // POST /graduations/:idStudent/ungraduate (Desmarcar como titulado)
  http.post(
    buildApiUrl('/graduations/:idStudent/ungraduate'),
    async ({ params }) => {
      await delay(300);

      const { idStudent } = params;
      const graduation = findGraduationByStudentId(idStudent as string);

      if (!graduation) {
        return HttpResponse.json(
          {
            error: 'Titulación no encontrada para este estudiante',
            code: 'GRADUATION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      graduation.isGraduated = false;
      graduation.updatedAt = new Date();

      return HttpResponse.json({
        ...graduation,
        graduationDate: graduation.graduationDate.toISOString(),
        createdAt: graduation.createdAt.toISOString(),
        updatedAt: graduation.updatedAt.toISOString(),
      });
    }
  ),
];
