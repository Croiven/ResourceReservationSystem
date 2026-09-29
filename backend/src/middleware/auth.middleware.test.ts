import { UserRole } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Response } from 'express';
import { UnauthorizedError } from './error.middleware.js';

vi.mock('../lib/jwt.js', () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock('../repositories/user.repository.js', () => ({
  userRepository: {
    findById: vi.fn(),
  },
}));

import { verifyAccessToken } from '../lib/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { authenticate } from './auth.middleware.js';
import type { AuthenticatedRequest } from '../models/auth.model.js';

describe('authenticate middleware', () => {
  it('attaches user on valid token', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({
      sub: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
    });
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as AuthenticatedRequest;
    const next = vi.fn();

    await authenticate(req, {} as Response, next as NextFunction);

    expect(req.user.id).toBe('user-1');
    expect(next).toHaveBeenCalled();
  });

  it('calls next with UnauthorizedError when header missing', async () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const next = vi.fn();

    await authenticate(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next with UnauthorizedError when header is not Bearer', async () => {
    const req = { headers: { authorization: 'Basic abc' } } as AuthenticatedRequest;
    const next = vi.fn();

    await authenticate(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next with UnauthorizedError when user is inactive', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({
      sub: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
    });
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as AuthenticatedRequest;
    const next = vi.fn();

    await authenticate(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next with UnauthorizedError when token verification fails', async () => {
    vi.mocked(verifyAccessToken).mockImplementation(() => {
      throw new Error('invalid');
    });

    const req = {
      headers: { authorization: 'Bearer bad-token' },
    } as AuthenticatedRequest;
    const next = vi.fn();

    await authenticate(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(next.mock.calls[0]?.[0]).toHaveProperty('message', 'Invalid or expired token');
  });
});
