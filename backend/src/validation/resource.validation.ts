import { ResourceType } from '@prisma/client';
import { z } from 'zod';

export const createResourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(ResourceType),
});

export const updateResourceSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    type: z.nativeEnum(ResourceType).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const resourceIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listResourcesQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
  type: z.nativeEnum(ResourceType).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;
