import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

vi.mock('../repositories/user.repository.js', () => ({
  userRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
  },
}));

import { userRepository } from '../repositories/user.repository.js';
import { UserService } from './user.service.js';

const mockUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  passwordHash: 'hash',
  firstName: 'Admin',
  lastName: 'User',
  role: UserRole.ADMIN,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  const userService = new UserService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects self role change', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

    await expect(
      userService.updateUser('admin-1', { role: UserRole.USER }, 'admin-1'),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects self deactivation via update', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

    await expect(
      userService.updateUser('admin-1', { isActive: false }, 'admin-1'),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects self deactivation via deactivate', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

    await expect(userService.deactivateUser('admin-1', 'admin-1')).rejects.toThrow(ValidationError);
  });

  it('allows updating own name', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(userRepository.update).mockResolvedValue({
      ...mockUser,
      firstName: 'Updated',
    });

    const result = await userService.updateUser(
      'admin-1',
      { firstName: 'Updated' },
      'admin-1',
    );

    expect(result.firstName).toBe('Updated');
  });

  it('throws when user not found', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(
      userService.updateUser('missing', { firstName: 'Test' }, 'admin-1'),
    ).rejects.toThrow(NotFoundError);
  });
});
