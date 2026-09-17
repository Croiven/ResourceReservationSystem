import { UserRole } from '@prisma/client';
import {
  getAccessTokenExpiresInSeconds,
  getRefreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { hashToken } from '../lib/token-hash.js';
import type { AuthTokenResponse, UserResponse } from '../models/user.dto.js';
import { toUserResponse } from '../models/user.dto.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from '../validation/auth.validation.js';
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from '../middleware/error.middleware.js';
import { NotFoundError } from '../middleware/error.middleware.js';

export class AuthService {
  async register(data: RegisterInput): Promise<UserResponse> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.USER,
    });

    return toUserResponse(user);
  }

  async login(data: LoginInput): Promise<AuthTokenResponse> {
    const user = await userRepository.findByEmail(data.email);
    if (!user?.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string): Promise<AuthTokenResponse> {
    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findValid(tokenHash);
    if (!stored) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(stored.userId);
    if (!user?.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    await refreshTokenRepository.revoke(stored.id);
    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await refreshTokenRepository.revokeByHash(tokenHash);
  }

  async getMe(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toUserResponse(user);
  }

  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    if (data.currentPassword === data.newPassword) {
      throw new ValidationError('New password must differ from current password');
    }

    const passwordHash = await hashPassword(data.newPassword);
    await userRepository.updatePasswordHash(userId, passwordHash);
    await refreshTokenRepository.revokeAllForUser(userId);
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<AuthTokenResponse> {
    const payload = { sub: userId, email, role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await refreshTokenRepository.create(
      userId,
      hashToken(refreshToken),
      getRefreshTokenExpiryDate(),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: getAccessTokenExpiresInSeconds(),
    };
  }
}

export const authService = new AuthService();
