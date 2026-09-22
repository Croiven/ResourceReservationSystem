import { ReservationStatus } from '@prisma/client';
import { z } from 'zod';

export const createReservationSchema = z.object({
  resourceId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const updateReservationSchema = z
  .object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    status: z.nativeEnum(ReservationStatus).optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const reservationIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listReservationsQuerySchema = z.object({
  resourceId: z.string().min(1).optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
});

export const adminListReservationsQuerySchema = z.object({
  userId: z.string().min(1).optional(),
  resourceId: z.string().min(1).optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ListReservationsQuery = z.infer<typeof listReservationsQuerySchema>;
export type AdminListReservationsQuery = z.infer<typeof adminListReservationsQuerySchema>;
