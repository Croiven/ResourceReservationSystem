import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

interface ValidateSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export function getValidated<T>(req: Request, key: 'body' | 'params' | 'query'): T {
  const value = req.validated?.[key];
  if (value === undefined) {
    throw new Error(`Validated ${key} not found on request`);
  }
  return value as T;
}

export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated: NonNullable<Request['validated']> = { ...req.validated };

      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }

      req.validated = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
}
