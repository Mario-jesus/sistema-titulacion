import { env } from '@shared/config';
import { logger } from '@shared/lib/logger';

interface ApiClient {
  get<T>(url: string, options?: RequestInit): Promise<T>;
  post<T>(url: string, body?: unknown, options?: RequestInit): Promise<T>;
  put<T>(url: string, body?: unknown, options?: RequestInit): Promise<T>;
  delete<T>(url: string, options?: RequestInit): Promise<T>;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
};

function buildUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  return `${env.apiBaseUrl}${normalizedEndpoint}`;
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { body?: unknown } = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const url = buildUrl(endpoint);

  logger.log(`API Request: ${options.method || 'GET'} ${url}`);

  const requestBody: BodyInit | undefined =
    options.body && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | undefined);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: requestBody,
  });

  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    let errorData: unknown = null;

    const text = await response.text();

    try {
      errorData = JSON.parse(text);

      if (errorData && typeof errorData === 'object') {
        const data = errorData as Record<string, unknown>;
        errorMessage =
          (data.message as string) || (data.error as string) || text;
      }
    } catch {
      errorMessage = text || 'Error en la petición';
    }

    logger.error(
      `API Error: status: ${response.status} statusText: ${response.statusText} message: ${errorMessage}`
    );

    if (response.status === 401) {
      localStorage.removeItem('token');
    }

    interface ApiError extends Error {
      status?: number;
      statusText?: string;
      response?: { data: unknown };
    }

    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = { data: errorData };

    throw error;
  }

  // Intentar parsear como JSON
  const text = await response.text();

  if (!text) {
    logger.log(`API Response: Empty response`);
    return {} as T;
  }

  try {
    const data = JSON.parse(text);
    logger.log(`API Response: ${JSON.stringify(data)}`);
    return data as T;
  } catch (parseError) {
    logger.error(`Failed to parse JSON response: ${text}`);
    throw new Error(
      `Respuesta inválida del servidor: ${text.substring(0, 100)}`
    );
  }
}

export const apiClient: ApiClient = {
  get<T>(url: string, options?: RequestInit) {
    return request<T>(url, { ...options, method: 'GET' });
  },
  post<T>(url: string, body?: unknown, options?: RequestInit) {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body,
    } as RequestInit & { body?: unknown });
  },
  put<T>(url: string, body?: unknown, options?: RequestInit) {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body,
    } as RequestInit & { body?: unknown });
  },
  delete<T>(url: string, options?: RequestInit) {
    return request<T>(url, { ...options, method: 'DELETE' });
  },
};
