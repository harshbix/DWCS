/**
 * Standardized API response layout.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  meta: Record<string, unknown>;
}

/**
 * Standardized API paginated response layout.
 */
export interface ApiPaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    [key: string]: unknown;
  };
}
