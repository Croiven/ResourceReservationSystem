import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

vi.mock('../services/auth.service.js', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: { user?: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'user-1', email: 'user@example.com', role: UserRole.USER };
    next();
  },
}));

import { authService } from '../services/auth.service.js';

describe('Auth routes', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth/register creates a user', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'Regular',
      lastName: 'User',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('user@example.com');
  });

  it('POST /api/auth/login returns tokens', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBe('access-token');
  });

  it('GET /api/auth/me returns current user', async () => {
    vi.mocked(authService.getMe).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('user-1');
  });

  it('POST /api/auth/change-password succeeds', async () => {
    vi.mocked(authService.changePassword).mockResolvedValue(undefined);

    const response = await request(app).post('/api/auth/change-password').send({
      currentPassword: 'password123',
      newPassword: 'newpassword123',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe('Password changed successfully');
  });

  it('POST /api/auth/change-password rejects invalid body', async () => {
    const response = await request(app).post('/api/auth/change-password').send({
      currentPassword: 'password123',
      newPassword: 'short',
    });

    expect(response.status).toBe(400);
  });
});
