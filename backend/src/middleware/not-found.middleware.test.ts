import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { notFoundHandler } from './not-found.middleware.js';
import { NotFoundError } from './error.middleware.js';

describe('notFoundHandler', () => {
  it('forwards NotFoundError to error handler', () => {
    const next = vi.fn() as NextFunction;

    notFoundHandler({} as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
  });
});
