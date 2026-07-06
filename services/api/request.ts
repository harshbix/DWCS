import { apiClient } from './client';
import { ApiResponse } from './response';
import { ApiError } from './errors';

interface RequestOptions extends RequestInit {
  clientSide?: boolean;
}

/**
 * Shared, implementation-agnostic API request executor.
 * 
 * - Server components, route handlers, and server actions run native `fetch()`
 *   to leverage Next.js caching, validation, and layout streaming.
 * - Client components and hooks can run via the Axios instance to benefit
 *   from active session token interceptors.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const isServer = typeof window === 'undefined';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Clean paths to prevent double slash errors
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${apiBase}${cleanPath}`;

  if (isServer && options.clientSide) {
    console.warn(`[API] Client-side fetch requested in server context for: ${cleanPath}. Defaulting to native fetch.`);
  }

  // Use Native fetch for Server-Side environments
  if (isServer || !options.clientSide) {
    try {
      const fetchHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      };

      // Retrieve backend Bearer auth in Route Handlers / Server Actions if required
      // E.g. reading from next/headers cookies if integrated with Supabase SSR
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: fetchHeaders,
      });

      // Parse JSON payload
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new ApiError(
          data?.error?.message || 'Server request failed',
          data?.error?.code || 'SERVER_HTTP_ERROR',
          response.status,
          data
        );
      }

      // Ensure data is structured standard ApiResponse
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }

      return {
        success: true,
        data: data as T,
        error: null,
        meta: {},
      };
    } catch (error) {
      throw ApiError.fromError(error);
    }
  }

  // Use Axios Client for Client-Side environments
  try {
    const axiosHeaders = {
      ...(options.headers || {}),
    };

    const response = await apiClient.request<ApiResponse<T>>({
      url: cleanPath,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body as string) : undefined,
      headers: axiosHeaders as any,
    });

    return response.data;
  } catch (error) {
    throw ApiError.fromError(error);
  }
}
