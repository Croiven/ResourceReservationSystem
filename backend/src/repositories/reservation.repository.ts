import type { Prisma, Reservation, ReservationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface CreateReservationData {
  userId: string;
  resourceId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface UpdateReservationData {
  startTime?: Date;
  endTime?: Date;
  status?: ReservationStatus;
  notes?: string | null;
}

export interface ReservationFilters {
  userId?: string;
  resourceId?: string;
  status?: ReservationStatus;
}

const reservationInclude = {
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
  resource: { select: { id: true, name: true, type: true } },
} satisfies Prisma.ReservationInclude;

export type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;

export class ReservationRepository {
  async findAll(filters?: ReservationFilters): Promise<ReservationWithRelations[]> {
    const where = {
      ...(filters?.userId !== undefined ? { userId: filters.userId } : {}),
      ...(filters?.resourceId !== undefined ? { resourceId: filters.resourceId } : {}),
      ...(filters?.status !== undefined ? { status: filters.status } : {}),
    };
    return prisma.reservation.findMany({
      where,
      include: reservationInclude,
      orderBy: { startTime: 'asc' },
    });
  }

  async findById(id: string): Promise<ReservationWithRelations | null> {
    return prisma.reservation.findUnique({
      where: { id },
      include: reservationInclude,
    });
  }

  async create(data: CreateReservationData): Promise<ReservationWithRelations> {
    return prisma.reservation.create({
      data,
      include: reservationInclude,
    });
  }

  async update(id: string, data: UpdateReservationData): Promise<ReservationWithRelations> {
    return prisma.reservation.update({
      where: { id },
      data,
      include: reservationInclude,
    });
  }

  async findOverlapping(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Reservation | null> {
    return prisma.reservation.findFirst({
      where: {
        resourceId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }
}

export const reservationRepository = new ReservationRepository();
