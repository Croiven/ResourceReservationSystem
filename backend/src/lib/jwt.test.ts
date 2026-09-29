import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'signed-token'),
    verify: vi.fn(() => ({ userId: 'user-1', email: 'user@example.com', role: 'USER' })),
  },
}));

vi.mock('../config/env.js', () => ({
  env: {
    jwtAccessSecret: 'access-secret',
    jwtRefreshSecret: 'refresh-secret',
    jwtAccessExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
  },
}));

import jwt from 'jsonwebtoken';
import {
  getAccessTokenExpiresInSeconds,
  getRefreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.js';

describe('jwt helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs access and refresh tokens', () => {
    const payload = { userId: 'user-1', email: 'user@example.com', role: 'USER' as const };

    expect(signAccessToken(payload)).toBe('signed-token');
    expect(signRefreshToken(payload)).toBe('signed-token');
    expect(jwt.sign).toHaveBeenCalledTimes(2);
  });

  it('verifies access and refresh tokens', () => {
    const payload = { userId: 'user-1', email: 'user@example.com', role: 'USER' as const };

    expect(verifyAccessToken('access-token')).toEqual(payload);
    expect(verifyRefreshToken('refresh-token')).toEqual(payload);
  });

  it('returns configured access expiry seconds', () => {
    expect(getAccessTokenExpiresInSeconds()).toBe(900);
  });

  it('parses refresh expiry duration', () => {
    const expiry = getRefreshTokenExpiryDate();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
