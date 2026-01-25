import { http, HttpResponse } from 'msw';
import type { IngressEgress } from '@entities/ingress-egress';
import { buildApiUrl, delay } from '../utils';
import { mockQuotas } from '../data/quotas';
import { mockStudents } from '../data/students';
import { mockGenerations } from '../data/generations';
import { mockCareers } from '../data/careers';

/**
 * Handlers para endpoints de ingreso y egreso
 */

interface PaginationData {
  total: number; // Total de registros
  limit: number; // Items por página
  totalPages: number; // Total de páginas calculadas
  page: number; // Página actual (Mejora sobre offset)
  pagingCounter: number; // El número del primer item de esta página (ej. 11)
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface ListResponse {
  data: IngressEgress[];
  pagination: PaginationData;
}

/**
 * Calcula los datos de ingreso y egreso agrupados por generación y carrera
 */
function calculateIngressEgressData(): IngressEgress[] {
  const result: IngressEgress[] = [];
  const processedKeys = new Set<string>();

  // Agrupar cuotas por generación y carrera
  mockQuotas.forEach((quota) => {
    const key = `${quota.generationId}-${quota.careerId}`;
    if (processedKeys.has(key)) {
      return;
    }
    processedKeys.add(key);

    // Obtener información de generación y carrera
    const generation = mockGenerations.find((g) => g.id === quota.generationId);
    const career = mockCareers.find((c) => c.id === quota.careerId);

    if (!generation || !career) {
      return;
    }

    // Calcular número de ingreso (suma de newAdmissionQuotasMale + newAdmissionQuotasFemale para esta generación y carrera)
    const admissionNumber = mockQuotas
      .filter(
        (q) =>
          q.generationId === quota.generationId && q.careerId === quota.careerId
      )
      .reduce(
        (sum, q) => sum + q.newAdmissionQuotasMale + q.newAdmissionQuotasFemale,
        0
      );

    // Calcular número de egreso (estudiantes con isEgressed = true)
    const egressNumber = mockStudents.filter(
      (student) =>
        student.generationId === quota.generationId &&
        student.careerId === quota.careerId &&
        student.isEgressed === true
    ).length;

    result.push({
      id: key,
      generationId: quota.generationId,
      careerId: quota.careerId,
      generationName: generation.name,
      careerName: career.name,
      admissionNumber,
      egressNumber,
    });
  });

  // También incluir combinaciones que existan en estudiantes pero no en cuotas
  mockStudents.forEach((student) => {
    const key = `${student.generationId}-${student.careerId}`;
    if (processedKeys.has(key)) {
      return;
    }
    processedKeys.add(key);

    const generation = mockGenerations.find(
      (g) => g.id === student.generationId
    );
    const career = mockCareers.find((c) => c.id === student.careerId);

    if (!generation || !career) {
      return;
    }

    // Para esta combinación no hay cuota, ingreso es 0
    const egressNumber = mockStudents.filter(
      (s) =>
        s.generationId === student.generationId &&
        s.careerId === student.careerId &&
        s.isEgressed === true
    ).length;

    result.push({
      id: key,
      generationId: student.generationId,
      careerId: student.careerId,
      generationName: generation.name,
      careerName: career.name,
      admissionNumber: 0,
      egressNumber,
    });
  });

  return result;
}

export const ingressEgressHandlers = [
  // GET /ingress-egress (List)
  http.get(buildApiUrl('/ingress-egress'), async ({ request }) => {
    await delay();

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10)); // Página actual (default: 1, mínimo: 1)
    const offset = (page - 1) * limit; // Calcular offset desde page para el slice interno

    const careerId = url.searchParams.get('careerId');
    const generationId = url.searchParams.get('generationId');
    const search =
      url.searchParams.get('search') || url.searchParams.get('q') || ''; // Búsqueda por texto

    // Validar y normalizar parámetros de ordenamiento
    const validSortFields = [
      'careerName',
      'generationName',
      'admissionNumber',
      'egressNumber',
    ];
    const requestedSortBy = url.searchParams.get('sortBy') || 'careerName';
    const sortBy = validSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : 'careerName';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'asc';
    const sortOrder =
      requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc'; // Normalizar a 'asc' o 'desc'

    let data = calculateIngressEgressData();

    // Filtrar por carrera si se especifica
    if (careerId) {
      data = data.filter((item) => item.careerId === careerId);
    }

    // Filtrar por generación si se especifica
    if (generationId) {
      data = data.filter((item) => item.generationId === generationId);
    }

    // Búsqueda por texto (busca en nombre de carrera y generación)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      data = data.filter((item) => {
        const careerMatch =
          item.careerName?.toLowerCase().includes(searchLower) ?? false;
        const generationMatch =
          item.generationName?.toLowerCase().includes(searchLower) ?? false;
        return careerMatch || generationMatch;
      });
    }

    // Ordenamiento
    data.sort((a, b) => {
      let aValue: string | number | null;
      let bValue: string | number | null;

      switch (sortBy) {
        case 'careerName':
          aValue = a.careerName?.toLowerCase() ?? '';
          bValue = b.careerName?.toLowerCase() ?? '';
          break;
        case 'generationName':
          aValue = a.generationName?.toLowerCase() ?? '';
          bValue = b.generationName?.toLowerCase() ?? '';
          break;
        case 'admissionNumber':
          aValue = a.admissionNumber;
          bValue = b.admissionNumber;
          break;
        case 'egressNumber':
          aValue = a.egressNumber;
          bValue = b.egressNumber;
          break;
        default:
          aValue = a.careerName?.toLowerCase() ?? '';
          bValue = b.careerName?.toLowerCase() ?? '';
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
      }

      // Aplicar orden (asc o desc)
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = data.length;
    const totalPages = Math.ceil(total / limit) || 1; // Al menos 1 página aunque esté vacía
    const paginatedData = data.slice(offset, offset + limit);

    // Calcular pagingCounter (número del primer item de esta página)
    const pagingCounter = total > 0 ? offset + 1 : 0;

    // Asegurar que page no exceda totalPages
    const currentPage = Math.min(page, totalPages);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    const response: ListResponse = {
      data: paginatedData,
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

  // GET /ingress-egress/:generationId/:careerId (Detail)
  http.get(
    buildApiUrl('/ingress-egress/:generationId/:careerId'),
    async ({ params }) => {
      await delay();

      const generationId = Array.isArray(params.generationId)
        ? params.generationId[0]
        : params.generationId;
      const careerId = Array.isArray(params.careerId)
        ? params.careerId[0]
        : params.careerId;

      if (!generationId || !careerId) {
        return HttpResponse.json(
          {
            error: 'GenerationId y CareerId son requeridos',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Verificar que la generación existe
      const generation = mockGenerations.find((g) => g.id === generationId);
      if (!generation) {
        return HttpResponse.json(
          {
            error: 'Generacion no encontrada',
            code: 'GENERATION_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // Verificar que la carrera existe
      const career = mockCareers.find((c) => c.id === careerId);
      if (!career) {
        return HttpResponse.json(
          {
            error: 'Carrera no encontrada',
            code: 'CAREER_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // Calcular número de ingreso (suma de newAdmissionQuotasMale + newAdmissionQuotasFemale)
      const admissionNumber = mockQuotas
        .filter(
          (q) => q.generationId === generationId && q.careerId === careerId
        )
        .reduce(
          (sum, q) =>
            sum + q.newAdmissionQuotasMale + q.newAdmissionQuotasFemale,
          0
        );

      // Calcular número de egreso
      const egressNumber = mockStudents.filter(
        (student) =>
          student.generationId === generationId &&
          student.careerId === careerId &&
          student.isEgressed === true
      ).length;

      const result: IngressEgress = {
        id: `${generationId}-${careerId}`,
        generationId,
        careerId,
        generationName: generation.name,
        careerName: career.name,
        admissionNumber,
        egressNumber,
      };

      return HttpResponse.json(result);
    }
  ),
];
