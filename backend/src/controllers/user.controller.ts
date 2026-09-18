import type { Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { userService } from '../services/user.service.js';
import { getValidated } from '../validation/validate.middleware.js';
import type { UpdateUserInput } from '../validation/auth.validation.js';

export class UserController {
  list = asyncHandler(async (_req, res: Response) => {
    const users = await userService.listUsers();
    res.status(200).json({ data: users });
  });

  getById = asyncHandler(async (req, res: Response) => {
    const { id } = getValidated<{ id: string }>(req, 'params');
    const user = await userService.getUser(id);
    res.status(200).json({ data: user });
  });

  update = asyncHandler(async (req, res: Response) => {
    const data = getValidated<UpdateUserInput>(req, 'body');
    const { id } = getValidated<{ id: string }>(req, 'params');
    const user = await userService.updateUser(id, data);
    res.status(200).json({ data: user });
  });

  deactivate = asyncHandler(async (req, res: Response) => {
    const { id } = getValidated<{ id: string }>(req, 'params');
    const user = await userService.deactivateUser(id);
    res.status(200).json({ data: user });
  });
}

export const userController = new UserController();
