import type { Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { healthService } from '../services/health.service.js';

export class HealthController {
  getHealth = asyncHandler(async (_req, res: Response) => {
    const status = await Promise.resolve(healthService.getStatus());
    res.status(200).json(status);
  });
}

export const healthController = new HealthController();
