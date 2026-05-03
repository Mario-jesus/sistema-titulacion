import { http, HttpResponse } from 'msw';
import type { Graduation } from '@entities/graduation';
import { StudentStatus, StudentProcessStatus } from '@entities/student';
import { buildApiUrl, delay } from '../utils';
import { findStudentById } from '../data/students';
import { findGraduationOptionById } from '../data/graduation-options';
import {
  mockGraduations,
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
  idCardNumber?: string;
  idCardIssueDate?: string;
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
  idCardNumber?: string;
  idCardIssueDate?: string;
  president?: string;
  secretary?: string;
  vocal?: string;
  substituteVocal?: string;
  notes?: string | null;
}

const toDate = (value: string | Date) =>
  value instanceof Date ? value : new Date(value);

export const graduationsHandlers = [
  // GET /graduations/student/:id (Detail by studentId)
  http.get(buildApiUrl('/graduations/student/:id'), async ({ params }) => {
    await delay();

    const { id } = params;
    const graduation = findGraduationByStudentId(id as string);

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
      graduationDate: graduation.graduationDate
        ? toDate(graduation.graduationDate).toISOString()
        : null,
      scheduledDate: graduation.scheduledDate
        ? toDate(graduation.scheduledDate).toISOString()
        : null,
      createdAt: toDate(graduation.createdAt).toISOString(),
      updatedAt: toDate(graduation.updatedAt).toISOString(),
    });
  }),

  // POST /graduations (Create)
  http.post(buildApiUrl('/graduations'), async ({ request }) => {
    await delay();

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

    // Verificar que el estudiante existe (antes de validar fecha/cédula)
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

    // En el flujo de edición, primero se guarda Graduation y después se actualiza
    // processStatus a GRADUATED. Por eso permitimos recibir datos de titulación
    // aunque el estado actual todavía no sea GRADUATED.
    if (
      student.processStatus === StudentProcessStatus.GRADUATED &&
      !body.graduationDate
    ) {
      return HttpResponse.json(
        {
          error:
            'La fecha de titulación es requerida para estudiantes titulados',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.graduationOptionId) {
      return HttpResponse.json(
        {
          error: 'La opción de titulación es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar que la opción de titulación existe
    {
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

    const graduationDate = body.graduationDate
      ? body.graduationDate instanceof Date
        ? body.graduationDate
        : new Date(body.graduationDate)
      : undefined;

    // Validar fecha de titulación cuando se proporciona
    if (graduationDate) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const normalizedGraduationDate = new Date(graduationDate);
      normalizedGraduationDate.setHours(0, 0, 0, 0);

      if (normalizedGraduationDate > currentDate) {
        return HttpResponse.json(
          {
            error:
              'La fecha de titulación debe ser menor o igual a la fecha actual',
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
      idCardNumber: body.idCardNumber?.trim() || undefined,
      idCardIssueDate: body.idCardIssueDate
        ? new Date(body.idCardIssueDate)
        : undefined,
      president: (body.president ?? '').trim(),
      secretary: (body.secretary ?? '').trim(),
      vocal: (body.vocal ?? '').trim(),
      substituteVocal: (body.substituteVocal ?? '').trim(),
      notes: body.notes?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGraduations.push(newGraduation);

    return HttpResponse.json(
      {
        ...newGraduation,
        graduationDate: newGraduation.graduationDate
          ? toDate(newGraduation.graduationDate).toISOString()
          : null,
        scheduledDate: newGraduation.scheduledDate
          ? toDate(newGraduation.scheduledDate).toISOString()
          : null,
        idCardIssueDate: newGraduation.idCardIssueDate
          ? toDate(newGraduation.idCardIssueDate).toISOString()
          : null,
        createdAt: toDate(newGraduation.createdAt).toISOString(),
        updatedAt: toDate(newGraduation.updatedAt).toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /graduations/student/:id (Update by studentId)
  http.put(
    buildApiUrl('/graduations/student/:id'),
    async ({ params, request }) => {
      await delay();

      const { id } = params;
      const graduation = findGraduationByStudentId(id as string);

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
      // Validar fecha de titulación si se proporciona
      if (body.graduationDate !== undefined || graduation.graduationDate) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const graduationDateToCheck =
          body.graduationDate !== undefined
            ? body.graduationDate instanceof Date
              ? body.graduationDate
              : new Date(body.graduationDate)
            : graduation.graduationDate;

        if (graduationDateToCheck) {
          const normalizedGraduationDate = new Date(graduationDateToCheck);
          normalizedGraduationDate.setHours(0, 0, 0, 0);

          if (normalizedGraduationDate > currentDate) {
            return HttpResponse.json(
              {
                error:
                  'La fecha de titulación debe ser menor o igual a la fecha actual',
                code: 'INVALID_GRADUATION_DATE',
              },
              { status: 400 }
            );
          }
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
      if (currentStudent.processStatus === StudentProcessStatus.GRADUATED) {
        if (body.idCardNumber !== undefined) {
          graduation.idCardNumber = body.idCardNumber?.trim() || undefined;
        }
        if (body.idCardIssueDate !== undefined) {
          graduation.idCardIssueDate = body.idCardIssueDate
            ? new Date(body.idCardIssueDate)
            : undefined;
        }
        if (body.graduationDate !== undefined) {
          graduation.graduationDate =
            body.graduationDate instanceof Date
              ? body.graduationDate
              : new Date(body.graduationDate);
        }
      } else {
        graduation.idCardNumber = undefined;
        graduation.idCardIssueDate = undefined;
        graduation.graduationDate = undefined;
      }
      graduation.president = body.president?.trim() ?? graduation.president;
      graduation.secretary = body.secretary?.trim() ?? graduation.secretary;
      graduation.vocal = body.vocal?.trim() ?? graduation.vocal;
      graduation.substituteVocal =
        body.substituteVocal?.trim() ?? graduation.substituteVocal;
      graduation.notes =
        body.notes !== undefined
          ? body.notes?.trim() || null
          : graduation.notes;
      graduation.updatedAt = new Date();

      return HttpResponse.json({
        ...graduation,
        graduationDate: graduation.graduationDate
          ? toDate(graduation.graduationDate).toISOString()
          : null,
        scheduledDate: graduation.scheduledDate
          ? toDate(graduation.scheduledDate).toISOString()
          : null,
        idCardIssueDate: graduation.idCardIssueDate
          ? toDate(graduation.idCardIssueDate).toISOString()
          : null,
        createdAt: toDate(graduation.createdAt).toISOString(),
        updatedAt: toDate(graduation.updatedAt).toISOString(),
      });
    }
  ),

  // PATCH /graduations/student/:id (Partial Update by studentId)
  http.patch(
    buildApiUrl('/graduations/student/:id'),
    async ({ params, request }) => {
      await delay();

      const { id } = params;
      const graduation = findGraduationByStudentId(id as string);

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
      // Validar fecha de titulación si se proporciona
      if (body.graduationDate !== undefined || graduation.graduationDate) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const graduationDateToCheck =
          body.graduationDate !== undefined
            ? body.graduationDate instanceof Date
              ? body.graduationDate
              : new Date(body.graduationDate)
            : graduation.graduationDate;

        if (graduationDateToCheck) {
          const normalizedGraduationDate = new Date(graduationDateToCheck);
          normalizedGraduationDate.setHours(0, 0, 0, 0);

          if (normalizedGraduationDate > currentDate) {
            return HttpResponse.json(
              {
                error:
                  'La fecha de titulación debe ser menor o igual a la fecha actual',
                code: 'INVALID_GRADUATION_DATE',
              },
              { status: 400 }
            );
          }
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
      if (currentStudent.processStatus === StudentProcessStatus.GRADUATED) {
        if (body.graduationDate !== undefined) {
          graduation.graduationDate =
            body.graduationDate instanceof Date
              ? body.graduationDate
              : new Date(body.graduationDate);
        }
        if (body.idCardNumber !== undefined) {
          graduation.idCardNumber = body.idCardNumber?.trim() || undefined;
        }
        if (body.idCardIssueDate !== undefined) {
          graduation.idCardIssueDate = body.idCardIssueDate
            ? new Date(body.idCardIssueDate)
            : undefined;
        }
      } else {
        graduation.graduationDate = undefined;
        graduation.idCardNumber = undefined;
        graduation.idCardIssueDate = undefined;
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
        graduationDate: graduation.graduationDate
          ? toDate(graduation.graduationDate).toISOString()
          : null,
        scheduledDate: graduation.scheduledDate
          ? toDate(graduation.scheduledDate).toISOString()
          : null,
        createdAt: toDate(graduation.createdAt).toISOString(),
        updatedAt: toDate(graduation.updatedAt).toISOString(),
      });
    }
  ),

  // DELETE /graduations/student/:id (Delete by studentId)
  http.delete(buildApiUrl('/graduations/student/:id'), async ({ params }) => {
    await delay();

    const { id } = params;
    const graduation = findGraduationByStudentId(id as string);

    if (!graduation) {
      return HttpResponse.json(
        {
          error: 'Titulación no encontrada',
          code: 'GRADUATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const index = mockGraduations.findIndex(
      (grad: Graduation) => grad.id === graduation.id
    );

    mockGraduations.splice(index, 1);

    return HttpResponse.json({
      message: 'Titulación eliminada exitosamente',
    });
  }),

  // POST /graduations/:studentId/graduate (Marcar como titulado)
  http.post(
    buildApiUrl('/graduations/:studentId/graduate'),
    async ({ params }) => {
      await delay();

      const { studentId } = params;
      const graduation = findGraduationByStudentId(studentId as string);

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
      if (graduation.graduationDate) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día para comparación
        const graduationDate = new Date(graduation.graduationDate);
        graduationDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día para comparación

        if (graduationDate > currentDate) {
          return HttpResponse.json(
            {
              error:
                'La fecha de titulación debe ser menor o igual a la fecha actual',
              code: 'INVALID_GRADUATION_DATE',
            },
            { status: 400 }
          );
        }
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

      graduation.updatedAt = new Date();

      return HttpResponse.json({
        ...graduation,
        graduationDate: graduation.graduationDate
          ? toDate(graduation.graduationDate).toISOString()
          : null,
        scheduledDate: graduation.scheduledDate
          ? toDate(graduation.scheduledDate).toISOString()
          : null,
        createdAt: toDate(graduation.createdAt).toISOString(),
        updatedAt: toDate(graduation.updatedAt).toISOString(),
      });
    }
  ),

  // POST /graduations/:studentId/ungraduate (Desmarcar como titulado)
  http.post(
    buildApiUrl('/graduations/:studentId/ungraduate'),
    async ({ params }) => {
      await delay();

      const { studentId } = params;
      const graduation = findGraduationByStudentId(studentId as string);

      if (!graduation) {
        return HttpResponse.json(
          {
            error: 'Titulación no encontrada para este estudiante',
            code: 'GRADUATION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // Revert student to IN_PROCESS so they no longer appear in graduated list.
      // Graduation data is kept so GET /graduations/student/:id still returns it.
      const student = findStudentById(studentId as string);
      if (student && student.processStatus === StudentProcessStatus.GRADUATED) {
        student.processStatus = StudentProcessStatus.IN_PROCESS;
        student.hasIdCard = false; // Quitar "cuenta con cédula profesional"
      }

      // Remove graduation date/time so the record is back to "scheduled" state
      graduation.graduationDate = undefined;
      // Remove cédula (ID card) data
      graduation.idCardNumber = undefined;
      graduation.idCardIssueDate = undefined;
      graduation.updatedAt = new Date();

      return HttpResponse.json({
        ...graduation,
        graduationDate: graduation.graduationDate
          ? toDate(graduation.graduationDate).toISOString()
          : null,
        scheduledDate: graduation.scheduledDate
          ? toDate(graduation.scheduledDate).toISOString()
          : null,
        idCardIssueDate: graduation.idCardIssueDate
          ? toDate(graduation.idCardIssueDate).toISOString()
          : null,
        createdAt: toDate(graduation.createdAt).toISOString(),
        updatedAt: toDate(graduation.updatedAt).toISOString(),
      });
    }
  ),
];
