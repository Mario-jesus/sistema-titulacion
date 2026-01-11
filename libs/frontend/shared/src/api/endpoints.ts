/**
 * Endpoints del API
 */
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  // Usuarios
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    PATCH: (id: string) => `/users/${id}`,
    PATCH_ME: '/users/me',
    DELETE: (id: string) => `/users/${id}`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
  },
  // Opciones de Titulación
  GRADUATION_OPTIONS: {
    LIST: '/graduation-options',
    DETAIL: (id: string) => `/graduation-options/${id}`,
    CREATE: '/graduation-options',
    UPDATE: (id: string) => `/graduation-options/${id}`,
    PATCH: (id: string) => `/graduation-options/${id}`,
    DELETE: (id: string) => `/graduation-options/${id}`,
    ACTIVATE: (id: string) => `/graduation-options/${id}/activate`,
    DEACTIVATE: (id: string) => `/graduation-options/${id}/deactivate`,
  },
  // Generaciones
  GENERATIONS: {
    LIST: '/generations',
    DETAIL: (id: string) => `/generations/${id}`,
    CREATE: '/generations',
    UPDATE: (id: string) => `/generations/${id}`,
    PATCH: (id: string) => `/generations/${id}`,
    DELETE: (id: string) => `/generations/${id}`,
    ACTIVATE: (id: string) => `/generations/${id}/activate`,
    DEACTIVATE: (id: string) => `/generations/${id}/deactivate`,
  },
  // Modalidades
  MODALITIES: {
    LIST: '/modalities',
    DETAIL: (id: string) => `/modalities/${id}`,
    CREATE: '/modalities',
    UPDATE: (id: string) => `/modalities/${id}`,
    PATCH: (id: string) => `/modalities/${id}`,
    DELETE: (id: string) => `/modalities/${id}`,
    ACTIVATE: (id: string) => `/modalities/${id}/activate`,
    DEACTIVATE: (id: string) => `/modalities/${id}/deactivate`,
  },
  // Carreras
  CAREERS: {
    LIST: '/careers',
    DETAIL: (id: string) => `/careers/${id}`,
    CREATE: '/careers',
    UPDATE: (id: string) => `/careers/${id}`,
    PATCH: (id: string) => `/careers/${id}`,
    DELETE: (id: string) => `/careers/${id}`,
    ACTIVATE: (id: string) => `/careers/${id}/activate`,
    DEACTIVATE: (id: string) => `/careers/${id}/deactivate`,
  },
  // Cupos
  QUOTAS: {
    LIST: '/quotas',
    DETAIL: (id: string) => `/quotas/${id}`,
    CREATE: '/quotas',
    UPDATE: (id: string) => `/quotas/${id}`,
    PATCH: (id: string) => `/quotas/${id}`,
    DELETE: (id: string) => `/quotas/${id}`,
    ACTIVATE: (id: string) => `/quotas/${id}/activate`,
    DEACTIVATE: (id: string) => `/quotas/${id}/deactivate`,
  },
  // Estudiantes
  STUDENTS: {
    LIST: '/students',
    DETAIL: (id: string) => `/students/${id}`,
    CREATE: '/students',
    UPDATE: (id: string) => `/students/${id}`,
    PATCH: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    CHANGE_STATUS: (id: string) => `/students/${id}/status`,
  },
  // Campos Capturados
  CAPTURED_FIELDS: {
    DETAIL: (id: string) => `/captured-fields/${id}`,
    CREATE: '/captured-fields',
    UPDATE: (id: string) => `/captured-fields/${id}`,
    PATCH: (id: string) => `/captured-fields/${id}`,
    DELETE: (id: string) => `/captured-fields/${id}`,
  },
  // Titulaciones
  GRADUATIONS: {
    DETAIL: (id: string) => `/graduations/${id}`,
    CREATE: '/graduations',
    UPDATE: (id: string) => `/graduations/${id}`,
    PATCH: (id: string) => `/graduations/${id}`,
    DELETE: (id: string) => `/graduations/${id}`,
    GRADUATE: (idStudent: string) => `/graduations/${idStudent}/graduate`,
    UNGRADUATE: (idStudent: string) => `/graduations/${idStudent}/ungraduate`,
  },
  // Ingreso y Egreso
  INGRESS_EGRESS: {
    LIST: '/ingress-egress',
    DETAIL: (generationId: string, careerId: string) =>
      `/ingress-egress/${generationId}/${careerId}`,
  },
} as const;
