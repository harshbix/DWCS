import { Request, Response, NextFunction } from 'express';
import { errorLogger } from '../config/logger.js';

interface CustomError extends Error {
  status?: number;
  code?: string;
}

/**
 * Express Global Error Handling Middleware.
 * Standardizes outbound exceptions to fit the shared JSON contract interface.
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred';

  // Log error stack details locally
  errorLogger.error(`Route request failed: ${req.method} ${req.url} - Status ${status}`, err);

  res.status(status).json({
    success: false,
    data: null,
    error: {
      code,
      message,
    },
    meta: {},
  });
}
