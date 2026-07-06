import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Express Middleware to validate incoming request data against a Zod schema.
 * Rejects requests with 400 Bad Request if validation rules are violated.
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'REQUEST_VALIDATION_ERROR',
            message: 'Inbound validation failed. Verify parameters.',
          },
          meta: {
            issues: error.format(),
          },
        });
        return;
      }
      next(error);
    }
  };
};
