import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import type { AuthenticatedRequest } from '../models/auth.model.js';
import { authService } from '../services/auth.service.js';
import { getValidated } from '../validation/validate.middleware.js';
import type {
  ChangePasswordInput,
  LoginInput,
  RefreshInput,
  RegisterInput,
} from '../validation/auth.validation.js';

export class AuthController {
  register = asyncHandler(async (req, res: Response) => {
    const data = getValidated<RegisterInput>(req, 'body');
    const user = await authService.register(data);
    res.status(201).json({ data: user });
  });

  login = asyncHandler(async (req, res: Response) => {
    const data = getValidated<LoginInput>(req, 'body');
    const tokens = await authService.login(data);
    res.status(200).json({ data: tokens });
  });

  refresh = asyncHandler(async (req, res: Response) => {
    const { refreshToken } = getValidated<RefreshInput>(req, 'body');
    const tokens = await authService.refresh(refreshToken);
    res.status(200).json({ data: tokens });
  });

  logout = asyncHandler(async (req, res: Response) => {
    const { refreshToken } = getValidated<RefreshInput>(req, 'body');
    await authService.logout(refreshToken);
    res.status(200).json({ data: { message: 'Logged out successfully' } });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const user = await authService.getMe(authReq.user.id);
    res.status(200).json({ data: user });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const data = getValidated<ChangePasswordInput>(req, 'body');
    await authService.changePassword(authReq.user.id, data);
    res.status(200).json({ data: { message: 'Password changed successfully' } });
  });
}

export const authController = new AuthController();
