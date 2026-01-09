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

interface ListResponse {
  data: IngressEgress[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
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

    // Calcular número de ingreso (suma de newAdmissionQuotas para esta generación y carrera)
    const admissionNumber = mockQuotas
      .filter((q) => q.generationId === quota.generationId && q.careerId === quota.careerId)
      .reduce((sum, q) => sum + q.newAdmissionQuotas, 0);

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

    const generation = mockGenerations.find((g) => g.id === student.generationId);
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
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const careerId = url.searchParams.get('careerId');
    const generationId = url.searchParams.get('generationId');

    let data = calculateIngressEgressData();

    // Filtrar por carrera si se especifica
    if (careerId) {
      data = data.filter((item) => item.careerId === careerId);
    }

    // Filtrar por generación si se especifica
    if (generationId) {
      data = data.filter((item) => item.generationId === generationId);
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice(offset, offset + limit);

    const response: ListResponse = {
      data: paginatedData,
      pagination: {
        total,
        limit,
        offset,
        totalPages,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /ingress-egress/:generationId/:careerId (Detail)
  http.get(buildApiUrl('/ingress-egress/:generationId/:careerId'), async ({ params }) => {
    await delay(200);

    const generationId = Array.isArray(params.generationId) ? params.generationId[0] : params.generationId;
    const careerId = Array.isArray(params.careerId) ? params.careerId[0] : params.careerId;

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

    // Calcular número de ingreso
    const admissionNumber = mockQuotas
      .filter((q) => q.generationId === generationId && q.careerId === careerId)
      .reduce((sum, q) => sum + q.newAdmissionQuotas, 0);

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
  }),
];
