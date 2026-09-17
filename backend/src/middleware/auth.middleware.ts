import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import type { AuthenticatedRequest } from '../models/auth.model.js';
import { userRepository } from '../repositories/user.repository.js';
import { UnauthorizedError } from './error.middleware.js';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.sub);
    if (!user?.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    authReq.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
