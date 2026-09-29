import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { getValidated, validate } from './validate.middleware.js';

describe('validate middleware', () => {
  it('parses body and attaches validated data', () => {
    const req = { body: { name: 'Desk' }, validated: undefined } as Request;
    const next = vi.fn() as NextFunction;
    const middleware = validate({ body: z.object({ name: z.string() }) });

    middleware(req, {} as Response, next);

    expect(getValidated<{ name: string }>(req, 'body')).toEqual({ name: 'Desk' });
    expect(next).toHaveBeenCalled();
  });

  it('forwards validation errors to next', () => {
    const req = { body: {}, validated: undefined } as Request;
    const next = vi.fn() as NextFunction;
    const middleware = validate({ body: z.object({ name: z.string() }) });

    middleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('throws when validated data is missing', () => {
    const req = { validated: {} } as Request;
    expect(() => getValidated(req, 'body')).toThrow('Validated body not found');
  });
});
