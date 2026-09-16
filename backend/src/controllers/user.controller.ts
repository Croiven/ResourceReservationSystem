import type { Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { userService } from '../services/user.service.js';
import type { UpdateUserInput } from '../validation/auth.validation.js';

export class UserController {
  list = asyncHandler(async (_req, res: Response) => {
    const users = await userService.listUsers();
    res.status(200).json({ data: users });
  });

  getById = asyncHandler(async (req, res: Response) => {
    const user = await userService.getUser(req.params['id'] as string);
    res.status(200).json({ data: user });
  });

  update = asyncHandler(async (req, res: Response) => {
    const data = req.body as UpdateUserInput;
    const user = await userService.updateUser(req.params['id'] as string, data);
    res.status(200).json({ data: user });
  });

  deactivate = asyncHandler(async (req, res: Response) => {
    const user = await userService.deactivateUser(req.params['id'] as string);
    res.status(200).json({ data: user });
  });
}

export const userController = new UserController();
