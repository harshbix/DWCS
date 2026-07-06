/**
 * Unified application-wide API Error class.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'UNKNOWN_ERROR', status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;

    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Creates an ApiError from an Axios or Fetch error context.
   */
  public static fromError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      
      // Axios error formatting
      if (err.isAxiosError && err.response && typeof err.response === 'object') {
        const resp = err.response as Record<string, unknown>;
        const data = resp.data as Record<string, unknown> | null;
        
        const message = data?.error && typeof data.error === 'object' 
          ? (data.error as Record<string, unknown>).message || 'API request failed'
          : err.message || 'API request failed';
          
        const code = data?.error && typeof data.error === 'object'
          ? (data.error as Record<string, unknown>).code || 'API_ERROR'
          : 'API_ERROR';

        return new ApiError(
          String(message),
          String(code),
          Number(resp.status),
          data
        );
      }
    }

    return new ApiError(
      error instanceof Error ? error.message : 'An unexpected network error occurred',
      'NETWORK_ERROR'
    );
  }
}
