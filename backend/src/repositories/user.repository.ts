import type { User, UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.role !== undefined ? { role: data.role } : {}),
      },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async deactivate(id: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async existsActive(id: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });
    return user !== null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}

export const userRepository = new UserRepository();
