import type { Request, Response } from 'express';
import { healthService } from '../services/health.service.js';

export class HealthController {
  getHealth(_req: Request, res: Response): void {
    const status = healthService.getStatus();
    res.status(200).json(status);
  }
}

export const healthController = new HealthController();
