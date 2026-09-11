import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import type { HealthStatus } from '../models/health.model.js';

describe('GET /api/health', () => {
  it('returns a health check response', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    const body = response.body as HealthStatus;
    expect(body).toMatchObject({
      status: 'ok',
      message: 'Backend is running',
    });
    expect(body.timestamp).toBeDefined();
  });
});
