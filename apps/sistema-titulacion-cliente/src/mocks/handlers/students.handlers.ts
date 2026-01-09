import { http, HttpResponse } from 'msw';
import type { Student } from '@entities/student';
import { StudentStatus } from '@entities/student';
import { buildApiUrl, delay } from '../utils';
import { findCareerById } from '../data/careers';
import { findGenerationById } from '../data/generations';
import {
  mockStudents,
  findStudentById,
  findStudentByControlNumber,
  generateStudentId,
} from '../data';

/**
 * Handlers para endpoints de estudiantes
 */

interface CreateStudentRequest {
  careerId: string;
  generationId: string;
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  email: string;
  birthDate: Date;
  sex: string;
  isEgressed: boolean;
  status: StudentStatus;
}

interface UpdateStudentRequest {
  careerId?: string;
  generationId?: string;
  controlNumber?: string;
  firstName?: string;
  paternalLastName?: string;
  maternalLastName?: string;
  phoneNumber?: string;
  email?: string;
  birthDate?: Date;
  sex?: string;
  isEgressed?: boolean;
  status?: StudentStatus;
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
  data: Student[];
  pagination: PaginationData;
}

export const studentsHandlers = [
  // GET /students (List)
  http.get(buildApiUrl('/students'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const careerId = url.searchParams.get('careerId');
    const generationId = url.searchParams.get('generationId');
    const status = url.searchParams.get('status');
    const search =
      url.searchParams.get('search') || url.searchParams.get('q') || '';

    // Validar y normalizar parámetros de ordenamiento
    const validSortFields = [
      'firstName',
      'paternalLastName',
      'controlNumber',
      'email',
      'birthDate',
      'createdAt',
      'isEgressed',
      'status',
    ];
    const requestedSortBy =
      url.searchParams.get('sortBy') || 'paternalLastName';
    const sortBy = validSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : 'paternalLastName';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'asc';
    const sortOrder =
      requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = [...mockStudents];

    // Filtrar por carrera si se especifica
    if (careerId) {
      filteredData = filteredData.filter(
        (student: Student) => student.careerId === careerId
      );
    }

    // Filtrar por generación si se especifica
    if (generationId) {
      filteredData = filteredData.filter(
        (student: Student) => student.generationId === generationId
      );
    }

    // Filtrar por status si se especifica
    if (status) {
      filteredData = filteredData.filter(
        (student: Student) => student.status === status
      );
    }

    // Búsqueda por texto (busca en nombre, apellidos, número de control, email)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = filteredData.filter((student: Student) => {
        const fullName =
          `${student.firstName} ${student.paternalLastName} ${student.maternalLastName}`.toLowerCase();
        const controlMatch =
          student.controlNumber?.toLowerCase().includes(searchLower) ?? false;
        const emailMatch =
          student.email?.toLowerCase().includes(searchLower) ?? false;
        const nameMatch = fullName.includes(searchLower);
        return controlMatch || emailMatch || nameMatch;
      });
    }

    // Ordenamiento
    filteredData.sort((a, b) => {
      let aValue: string | number | boolean | Date | null;
      let bValue: string | number | boolean | Date | null;

      switch (sortBy) {
        case 'firstName':
          aValue = a.firstName?.toLowerCase() ?? '';
          bValue = b.firstName?.toLowerCase() ?? '';
          break;
        case 'paternalLastName':
          aValue = a.paternalLastName?.toLowerCase() ?? '';
          bValue = b.paternalLastName?.toLowerCase() ?? '';
          break;
        case 'controlNumber':
          aValue = a.controlNumber?.toLowerCase() ?? '';
          bValue = b.controlNumber?.toLowerCase() ?? '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() ?? '';
          bValue = b.email?.toLowerCase() ?? '';
          break;
        case 'birthDate':
          aValue = a.birthDate;
          bValue = b.birthDate;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'isEgressed':
          aValue = a.isEgressed ? 1 : 0;
          bValue = b.isEgressed ? 1 : 0;
          break;
        case 'status':
          aValue = a.status?.toLowerCase() ?? '';
          bValue = b.status?.toLowerCase() ?? '';
          break;
        default:
          aValue = a.paternalLastName?.toLowerCase() ?? '';
          bValue = b.paternalLastName?.toLowerCase() ?? '';
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

      // Aplicar orden (asc o desc)
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Calcular pagingCounter (número del primer item de esta página)
    const pagingCounter = total > 0 ? offset + 1 : 0;

    // Asegurar que page no exceda totalPages
    const currentPage = Math.min(page, totalPages);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    const response: ListResponse = {
      data: paginatedData.map((student) => ({
        ...student,
        birthDate: student.birthDate.toISOString().split('T')[0],
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString(),
      })) as unknown as Student[],
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

  // GET /students/:id (Detail)
  http.get(buildApiUrl('/students/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const student = findStudentById(id as string);

    if (!student) {
      return HttpResponse.json(
        {
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...student,
      birthDate: student.birthDate.toISOString().split('T')[0],
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    });
  }),

  // POST /students (Create)
  http.post(buildApiUrl('/students'), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateStudentRequest;

    // Validaciones básicas
    if (!body.firstName || body.firstName.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.paternalLastName || body.paternalLastName.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El apellido paterno es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.controlNumber || body.controlNumber.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El número de control es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.email || body.email.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El email es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

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

    // Verificar duplicados por número de control
    const existsByControlNumber = findStudentByControlNumber(
      body.controlNumber
    );
    if (existsByControlNumber) {
      return HttpResponse.json(
        {
          error: 'Ya existe un estudiante con ese número de control',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    // Verificar duplicados por email
    const existsByEmail = mockStudents.some(
      (student: Student) =>
        student.email.toLowerCase() === body.email.toLowerCase()
    );
    if (existsByEmail) {
      return HttpResponse.json(
        {
          error: 'Ya existe un estudiante con ese email',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newStudent: Student = {
      id: generateStudentId(),
      careerId: body.careerId,
      generationId: body.generationId,
      controlNumber: body.controlNumber.trim(),
      firstName: body.firstName.trim(),
      paternalLastName: body.paternalLastName.trim(),
      maternalLastName: body.maternalLastName?.trim() || '',
      phoneNumber: body.phoneNumber?.trim() || '',
      email: body.email.trim().toLowerCase(),
      birthDate: new Date(body.birthDate),
      sex: body.sex as any,
      isEgressed: body.isEgressed ?? false,
      status: body.status ?? StudentStatus.ACTIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockStudents.push(newStudent);

    return HttpResponse.json(
      {
        ...newStudent,
        birthDate: newStudent.birthDate.toISOString().split('T')[0],
        createdAt: newStudent.createdAt.toISOString(),
        updatedAt: newStudent.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /students/:id (Update)
  http.put(buildApiUrl('/students/:id'), async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const student = findStudentById(id as string);

    if (!student) {
      return HttpResponse.json(
        {
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateStudentRequest;

    // Validaciones
    if (
      body.firstName !== undefined &&
      (!body.firstName || body.firstName.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El nombre no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.paternalLastName !== undefined &&
      (!body.paternalLastName || body.paternalLastName.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El apellido paterno no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.email !== undefined &&
      (!body.email || body.email.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El email no puede estar vacío',
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

    // Verificar duplicados por número de control si se cambia
    if (body.controlNumber && body.controlNumber !== student.controlNumber) {
      const exists = findStudentByControlNumber(body.controlNumber);
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe un estudiante con ese número de control',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados por email si se cambia
    if (
      body.email &&
      body.email.toLowerCase() !== student.email.toLowerCase()
    ) {
      const exists = mockStudents.some(
        (s: Student) =>
          s.id !== id && s.email.toLowerCase() === body.email!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe un estudiante con ese email',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Validar transición de status si se cambia
    if (body.status !== undefined && body.status !== student.status) {
      // Cancelado no puede cambiar de status
      if (student.status === StudentStatus.CANCELADO) {
        return HttpResponse.json(
          {
            error: 'Un estudiante cancelado no puede cambiar su estado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }
      // Activo solo puede pasar a Pausado o Cancelado
      if (
        student.status === StudentStatus.ACTIVO &&
        body.status === StudentStatus.ACTIVO
      ) {
        // Ya está activo, no hay cambio
      } else if (
        student.status === StudentStatus.ACTIVO &&
        body.status !== StudentStatus.PAUSADO &&
        body.status !== StudentStatus.CANCELADO
      ) {
        return HttpResponse.json(
          {
            error: 'Un estudiante activo solo puede ser pausado o cancelado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }
      // Pausado solo puede pasar a Activo
      if (
        student.status === StudentStatus.PAUSADO &&
        body.status !== StudentStatus.ACTIVO
      ) {
        return HttpResponse.json(
          {
            error: 'Un estudiante pausado solo puede ser activado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }
    }

    // Actualizar
    student.careerId = body.careerId ?? student.careerId;
    student.generationId = body.generationId ?? student.generationId;
    student.controlNumber = body.controlNumber?.trim() ?? student.controlNumber;
    student.firstName = body.firstName?.trim() ?? student.firstName;
    student.paternalLastName =
      body.paternalLastName?.trim() ?? student.paternalLastName;
    student.maternalLastName =
      body.maternalLastName !== undefined
        ? body.maternalLastName.trim()
        : student.maternalLastName;
    student.phoneNumber =
      body.phoneNumber !== undefined
        ? body.phoneNumber.trim()
        : student.phoneNumber;
    student.email = body.email?.trim().toLowerCase() ?? student.email;
    student.birthDate = body.birthDate
      ? new Date(body.birthDate)
      : student.birthDate;
    student.sex = body.sex ? (body.sex as any) : student.sex;
    student.isEgressed = body.isEgressed ?? student.isEgressed;
    if (body.status !== undefined) {
      student.status = body.status;
    }
    student.updatedAt = new Date();

    return HttpResponse.json({
      ...student,
      birthDate: student.birthDate.toISOString().split('T')[0],
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    });
  }),

  // PATCH /students/:id (Partial Update)
  http.patch(buildApiUrl('/students/:id'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const student = findStudentById(id as string);

    if (!student) {
      return HttpResponse.json(
        {
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<UpdateStudentRequest>;

    // Validaciones
    if (
      body.firstName !== undefined &&
      (!body.firstName || body.firstName.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El nombre no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.paternalLastName !== undefined &&
      (!body.paternalLastName || body.paternalLastName.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El apellido paterno no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (
      body.email !== undefined &&
      (!body.email || body.email.trim().length === 0)
    ) {
      return HttpResponse.json(
        {
          error: 'El email no puede estar vacío',
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

    // Verificar duplicados por número de control si se cambia
    if (body.controlNumber && body.controlNumber !== student.controlNumber) {
      const exists = findStudentByControlNumber(body.controlNumber);
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe un estudiante con ese número de control',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados por email si se cambia
    if (
      body.email &&
      body.email.toLowerCase() !== student.email.toLowerCase()
    ) {
      const exists = mockStudents.some(
        (s: Student) =>
          s.id !== id && s.email.toLowerCase() === body.email!.toLowerCase()
      );
      if (exists) {
        return HttpResponse.json(
          {
            error: 'Ya existe un estudiante con ese email',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Validar transición de status si se cambia
    if (body.status !== undefined && body.status !== student.status) {
      // Cancelado no puede cambiar de status
      if (student.status === StudentStatus.CANCELADO) {
        return HttpResponse.json(
          {
            error: 'Un estudiante cancelado no puede cambiar su estado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }
      // Activo solo puede pasar a Pausado o Cancelado
      if (
        student.status === StudentStatus.ACTIVO &&
        body.status === StudentStatus.ACTIVO
      ) {
        // Ya está activo, no hay cambio
      } else if (
        student.status === StudentStatus.ACTIVO &&
        body.status !== StudentStatus.PAUSADO &&
        body.status !== StudentStatus.CANCELADO
      ) {
        return HttpResponse.json(
          {
            error: 'Un estudiante activo solo puede ser pausado o cancelado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }
      // Pausado solo puede pasar a Activo
      if (
        student.status === StudentStatus.PAUSADO &&
        body.status !== StudentStatus.ACTIVO
      ) {
        return HttpResponse.json(
          {
            error: 'Un estudiante pausado solo puede ser activado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }
    }

    // Actualizar solo campos proporcionados
    if (body.careerId !== undefined) {
      student.careerId = body.careerId;
    }
    if (body.generationId !== undefined) {
      student.generationId = body.generationId;
    }
    if (body.controlNumber !== undefined) {
      student.controlNumber = body.controlNumber.trim();
    }
    if (body.firstName !== undefined) {
      student.firstName = body.firstName.trim();
    }
    if (body.paternalLastName !== undefined) {
      student.paternalLastName = body.paternalLastName.trim();
    }
    if (body.maternalLastName !== undefined) {
      student.maternalLastName = body.maternalLastName.trim();
    }
    if (body.phoneNumber !== undefined) {
      student.phoneNumber = body.phoneNumber.trim();
    }
    if (body.email !== undefined) {
      student.email = body.email.trim().toLowerCase();
    }
    if (body.birthDate !== undefined) {
      student.birthDate = new Date(body.birthDate);
    }
    if (body.sex !== undefined) {
      student.sex = body.sex as any;
    }
    if (body.isEgressed !== undefined) {
      student.isEgressed = body.isEgressed;
    }
    if (body.status !== undefined) {
      student.status = body.status;
    }
    student.updatedAt = new Date();

    return HttpResponse.json({
      ...student,
      birthDate: student.birthDate.toISOString().split('T')[0],
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    });
  }),

  // DELETE /students/:id
  http.delete(buildApiUrl('/students/:id'), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const index = mockStudents.findIndex(
      (student: Student) => student.id === id
    );

    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    mockStudents.splice(index, 1);

    return HttpResponse.json({
      message: 'Estudiante eliminado exitosamente',
    });
  }),

  // POST /students/:id/status (Cambiar status)
  http.post(
    buildApiUrl('/students/:id/status'),
    async ({ params, request }) => {
      await delay(300);

      const { id } = params;
      const student = findStudentById(id as string);

      if (!student) {
        return HttpResponse.json(
          {
            error: 'Estudiante no encontrado',
            code: 'STUDENT_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const body = (await request.json()) as { status: StudentStatus };

      if (!body.status) {
        return HttpResponse.json(
          {
            error: 'El status es requerido',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Validar transición de status
      // Cancelado no puede cambiar de status
      if (student.status === StudentStatus.CANCELADO) {
        return HttpResponse.json(
          {
            error: 'Un estudiante cancelado no puede cambiar su estado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }

      // Activo solo puede pasar a Pausado o Cancelado
      if (student.status === StudentStatus.ACTIVO) {
        if (
          body.status !== StudentStatus.PAUSADO &&
          body.status !== StudentStatus.CANCELADO
        ) {
          return HttpResponse.json(
            {
              error: 'Un estudiante activo solo puede ser pausado o cancelado',
              code: 'INVALID_STATUS_TRANSITION',
            },
            { status: 400 }
          );
        }
      }

      // Pausado solo puede pasar a Activo
      if (
        student.status === StudentStatus.PAUSADO &&
        body.status !== StudentStatus.ACTIVO
      ) {
        return HttpResponse.json(
          {
            error: 'Un estudiante pausado solo puede ser activado',
            code: 'INVALID_STATUS_TRANSITION',
          },
          { status: 400 }
        );
      }

      student.status = body.status;
      student.updatedAt = new Date();

      return HttpResponse.json({
        ...student,
        birthDate: student.birthDate.toISOString().split('T')[0],
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString(),
      });
    }
  ),
];
