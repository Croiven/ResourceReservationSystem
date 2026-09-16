import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError, ValidationError, ConflictError } from '../middleware/error.middleware.js';

vi.mock('../repositories/user.repository.js', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updatePasswordHash: vi.fn(),
  },
}));

vi.mock('../repositories/refresh-token.repository.js', () => ({
  refreshTokenRepository: {
    create: vi.fn(),
    findValid: vi.fn(),
    revoke: vi.fn(),
    revokeByHash: vi.fn(),
    revokeAllForUser: vi.fn(),
  },
}));

vi.mock('../lib/password.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  verifyPassword: vi.fn(),
}));

vi.mock('../lib/jwt.js', () => ({
  signAccessToken: vi.fn().mockReturnValue('access-token'),
  signRefreshToken: vi.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: vi.fn(),
  getAccessTokenExpiresInSeconds: vi.fn().mockReturnValue(900),
  getRefreshTokenExpiryDate: vi.fn().mockReturnValue(new Date('2030-01-01')),
}));

import { verifyRefreshToken } from '../lib/jwt.js';
import { verifyPassword } from '../lib/password.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { AuthService } from './auth.service.js';

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  passwordHash: 'hashed-password',
  firstName: 'Regular',
  lastName: 'User',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  const authService = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue(mockUser);

    const result = await authService.register({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'Regular',
      lastName: 'User',
    });

    expect(result.email).toBe('user@example.com');
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('rejects duplicate email on register', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

    await expect(
      authService.register({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Regular',
        lastName: 'User',
      }),
    ).rejects.toThrow(ConflictError);
  });

  it('logs in with valid credentials', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const result = await authService.login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('access-token');
    expect(refreshTokenRepository.create).toHaveBeenCalled();
  });

  it('rejects login with wrong password', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      authService.login({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('rejects login for inactive user', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ ...mockUser, isActive: false });

    await expect(
      authService.login({ email: 'user@example.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('refreshes tokens and rotates refresh token', async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue({
      sub: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
    });
    vi.mocked(refreshTokenRepository.findValid).mockResolvedValue({ id: 'token-1', userId: 'user-1' });
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

    const result = await authService.refresh('refresh-token');

    expect(result.accessToken).toBe('access-token');
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('token-1');
  });

  it('changes password and revokes all refresh tokens', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    await authService.changePassword('user-1', {
      currentPassword: 'password123',
      newPassword: 'newpassword123',
    });

    expect(userRepository.updatePasswordHash).toHaveBeenCalledWith('user-1', 'hashed-password');
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('rejects password change with wrong current password', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      authService.changePassword('user-1', {
        currentPassword: 'wrong',
        newPassword: 'newpassword123',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('rejects password change when new equals current', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    await expect(
      authService.changePassword('user-1', {
        currentPassword: 'password123',
        newPassword: 'password123',
      }),
    ).rejects.toThrow(ValidationError);
  });
});
