import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/system/health
 * Returns service uptime state diagnostic signals.
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    error: null,
    meta: {},
  });
});

export default router;
