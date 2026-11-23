/**
 * API Client wrapper for L'Archive Vivante
 * Enforces credentials: 'include' for HttpOnly cookie sessions
 * Handles RFC 7807 ProblemDetails error responses
 */

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class ApiClientError extends Error {
  public status: number;
  public problemDetails?: ProblemDetails;

  constructor(message: string, status: number, problemDetails?: ProblemDetails) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.problemDetails = problemDetails;
  }
}

const CONFIG_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let url: string;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
  } else if (CONFIG_BASE_URL.startsWith('http://') || CONFIG_BASE_URL.startsWith('https://')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (CONFIG_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      url = `${CONFIG_BASE_URL.slice(0, -4)}${cleanEndpoint}`;
    } else {
      url = `${CONFIG_BASE_URL}${cleanEndpoint}`;
    }
  } else {
    url = endpoint.startsWith('/api')
      ? endpoint
      : `${CONFIG_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  const headers = new Headers(options.headers || {});

  // Add JSON header only if body is not FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Essential for HttpOnly cookie auth (.Atelier.Session)
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let problemDetails: ProblemDetails | undefined;
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('json')) {
        problemDetails = await response.json();
        if (problemDetails?.detail) {
          errorMessage = problemDetails.detail;
        } else if (problemDetails?.title) {
          errorMessage = problemDetails.title;
        }
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }
    } catch {
      // Failed to parse response body, use default errorMessage
    }

    throw new ApiClientError(errorMessage, response.status, problemDetails);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
