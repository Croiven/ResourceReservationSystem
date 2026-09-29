import { UserRole } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { authorize } from './authorize.middleware.js';
import { ForbiddenError } from './error.middleware.js';

describe('authorize middleware', () => {
  it('allows users with permitted roles', () => {
    const req = { user: { id: '1', role: UserRole.ADMIN } } as Request;
    const next = vi.fn() as NextFunction;

    authorize(UserRole.ADMIN)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('blocks users without permitted roles', () => {
    const req = { user: { id: '1', role: UserRole.USER } } as Request;
    const next = vi.fn() as NextFunction;

    authorize(UserRole.ADMIN)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
