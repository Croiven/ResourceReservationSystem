import type { HealthStatus } from '../models/health.model.js';

export class HealthService {
  getStatus(): HealthStatus {
    return {
      status: 'ok',
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthService = new HealthService();
