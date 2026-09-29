import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  ConflictError,
  errorHandler,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './error.middleware.js';

function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

describe('errorHandler', () => {
  it('maps ZodError to validation response', () => {
    const res = createMockResponse();
    let zodError: z.ZodError | undefined;
    try {
      z.object({ name: z.string() }).parse({});
    } catch (err) {
      zodError = err as z.ZodError;
    }

    errorHandler(zodError!, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ message: 'Validation failed' }) }),
    );
  });

  it('maps AppError subclasses to status codes', () => {
    const res = createMockResponse();

    errorHandler(new NotFoundError('Missing'), {} as Request, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(404);

    errorHandler(
      new ValidationError('Invalid', [{ field: 'name', message: 'Required' }]),
      {} as Request,
      res,
      vi.fn() as NextFunction,
    );
    expect(res.status).toHaveBeenCalledWith(400);

    errorHandler(new ConflictError('Duplicate'), {} as Request, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(409);

    errorHandler(new UnauthorizedError('Bad token'), {} as Request, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);

    errorHandler(new ForbiddenError('No access'), {} as Request, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 500 for unknown errors', () => {
    const res = createMockResponse();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(new Error('boom'), {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
    consoleSpy.mockRestore();
  });
});
