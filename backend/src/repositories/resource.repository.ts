import type { Resource, ResourceType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface CreateResourceData {
  name: string;
  description?: string;
  type: ResourceType;
}

export interface UpdateResourceData {
  name?: string;
  description?: string | null;
  type?: ResourceType;
  isActive?: boolean;
}

export interface ResourceFilters {
  isActive?: boolean;
  type?: ResourceType;
  search?: string;
}

export class ResourceRepository {
  async findAll(filters?: ResourceFilters): Promise<Resource[]> {
    const where = {
      ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters?.type !== undefined ? { type: filters.type } : {}),
      ...(filters?.search !== undefined
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' as const } },
              { description: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    return prisma.resource.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Resource | null> {
    return prisma.resource.findUnique({ where: { id } });
  }

  async create(data: CreateResourceData): Promise<Resource> {
    return prisma.resource.create({ data });
  }

  async update(id: string, data: UpdateResourceData): Promise<Resource> {
    return prisma.resource.update({ where: { id }, data });
  }

  async deactivate(id: string): Promise<Resource> {
    return prisma.resource.update({ where: { id }, data: { isActive: false } });
  }
}

export const resourceRepository = new ResourceRepository();
