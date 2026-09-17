import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../models/auth.model.js';
import { ForbiddenError } from './error.middleware.js';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!roles.includes(authReq.user.role)) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}
