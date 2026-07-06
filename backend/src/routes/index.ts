import { Router, Request, Response } from 'express';
import healthRouter from './health.js';

const apiRouter = Router();

// Shared 501 responder for reserved routes in Phase 1
const notImplemented = (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    data: null,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: `The endpoint ${req.method} ${req.originalUrl} is reserved and will be implemented in a future phase.`,
    },
    meta: {},
  });
};

// Reserved API Route Mappings
apiRouter.use('/auth', notImplemented);
apiRouter.use('/users', notImplemented);
apiRouter.use('/citizens', notImplemented);
apiRouter.use('/drivers', notImplemented);
apiRouter.use('/admin', notImplemented);
apiRouter.use('/routes', notImplemented);
apiRouter.use('/vehicles', notImplemented);
apiRouter.use('/payments', notImplemented);
apiRouter.use('/reports', notImplemented);
apiRouter.use('/notifications', notImplemented);
apiRouter.use('/tracking', notImplemented);

// Mounted Diagnostic Route
apiRouter.use('/system', healthRouter);

export default apiRouter;
