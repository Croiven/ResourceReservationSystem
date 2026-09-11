import { describe, expect, it } from 'vitest';
import { healthService } from './health.service.js';

describe('HealthService', () => {
  it('returns a healthy status response', () => {
    const result = healthService.getStatus();

    expect(result.status).toBe('ok');
    expect(result.message).toBe('Backend is running');
    expect(result.timestamp).toBeDefined();
  });
});
