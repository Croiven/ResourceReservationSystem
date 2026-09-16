import type { UserResponse } from '../models/user.dto.js';
import { toUserResponse } from '../models/user.dto.js';
import { userRepository } from '../repositories/user.repository.js';
import type { UpdateUserInput } from '../validation/auth.validation.js';
import { NotFoundError } from '../middleware/error.middleware.js';

export class UserService {
  async listUsers(): Promise<UserResponse[]> {
    const users = await userRepository.findAll();
    return users.map(toUserResponse);
  }

  async getUser(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toUserResponse(user);
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const updateData = {
      ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
      ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    };
    const updated = await userRepository.update(id, updateData);
    return toUserResponse(updated);
  }

  async deactivateUser(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const deactivated = await userRepository.deactivate(id);
    return toUserResponse(deactivated);
  }
}

export const userService = new UserService();
