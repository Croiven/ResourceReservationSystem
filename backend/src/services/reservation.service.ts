import type { UserRole } from '@prisma/client';
import { ReservationStatus } from '@prisma/client';
import type { ReservationResponse } from '../models/reservation.dto.js';
import { toReservationResponse } from '../models/reservation.dto.js';
import { reservationRepository } from '../repositories/reservation.repository.js';
import { resourceRepository } from '../repositories/resource.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { ReservationFilters } from '../repositories/reservation.repository.js';
import type {
  AdminListReservationsQuery,
  CreateReservationInput,
  ListReservationsQuery,
  UpdateReservationInput,
} from '../validation/reservation.validation.js';
import { isValidSlotRange } from '../lib/slot-time.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../middleware/error.middleware.js';

export class ReservationService {
  async listReservations(
    query: ListReservationsQuery,
    requesterId: string,
    _requesterRole: UserRole,
  ): Promise<ReservationResponse[]> {
    const filters: ReservationFilters = {
      userId: requesterId,
    };

    if (query.resourceId !== undefined) filters.resourceId = query.resourceId;
    if (query.status !== undefined) filters.status = query.status;

    const reservations = await reservationRepository.findAll(filters);
    return reservations.map(toReservationResponse);
  }

  async listAllReservations(query: AdminListReservationsQuery): Promise<ReservationResponse[]> {
    const filters: ReservationFilters = {};

    if (query.userId !== undefined) filters.userId = query.userId;
    if (query.resourceId !== undefined) filters.resourceId = query.resourceId;
    if (query.status !== undefined) filters.status = query.status;

    const reservations = await reservationRepository.findAll(filters);
    return reservations.map(toReservationResponse);
  }

  async getReservation(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<ReservationResponse> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    this.assertOwnerOrAdmin(reservation.userId, requesterId, requesterRole);
    return toReservationResponse(reservation);
  }

  async createReservation(
    data: CreateReservationInput,
    userId: string,
  ): Promise<ReservationResponse> {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    await this.validateBookingRules(userId, data.resourceId, startTime, endTime);

    const createData = {
      userId,
      resourceId: data.resourceId,
      startTime,
      endTime,
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };
    const reservation = await reservationRepository.create(createData);

    return toReservationResponse(reservation);
  }

  async updateReservation(
    id: string,
    data: UpdateReservationInput,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<ReservationResponse> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    this.assertOwnerOrAdmin(reservation.userId, requesterId, requesterRole);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ValidationError('Cannot update a cancelled reservation');
    }

    const startTime = data.startTime ? new Date(data.startTime) : reservation.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : reservation.endTime;

    if (data.startTime !== undefined || data.endTime !== undefined) {
      await this.validateBookingRules(
        reservation.userId,
        reservation.resourceId,
        startTime,
        endTime,
        id,
      );
    }

    const updateData = {
      ...(data.startTime !== undefined ? { startTime } : {}),
      ...(data.endTime !== undefined ? { endTime } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };
    const updated = await reservationRepository.update(id, updateData);

    return toReservationResponse(updated);
  }

  async cancelReservation(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<ReservationResponse> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    this.assertOwnerOrAdmin(reservation.userId, requesterId, requesterRole);

    if (reservation.status === ReservationStatus.CANCELLED) {
      return toReservationResponse(reservation);
    }

    const cancelled = await reservationRepository.update(id, {
      status: ReservationStatus.CANCELLED,
    });

    return toReservationResponse(cancelled);
  }

  private assertOwnerOrAdmin(ownerId: string, requesterId: string, role: UserRole): void {
    if (role !== 'ADMIN' && ownerId !== requesterId) {
      throw new ForbiddenError('You can only access your own reservations');
    }
  }

  private async validateBookingRules(
    userId: string,
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<void> {
    if (endTime <= startTime) {
      throw new ValidationError('End time must be after start time');
    }

    if (!isValidSlotRange(startTime, endTime)) {
      throw new ValidationError(
        'Reservations must start on the hour or half-hour and last a multiple of 30 minutes',
      );
    }

    if (startTime < new Date()) {
      throw new ValidationError('Start time must be in the future');
    }

    const userActive = await userRepository.existsActive(userId);
    if (!userActive) {
      throw new NotFoundError('User not found');
    }

    const resource = await resourceRepository.findById(resourceId);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    if (!resource.isActive) {
      throw new ValidationError('Resource is not available for booking');
    }

    const overlap = await reservationRepository.findOverlapping(
      resourceId,
      startTime,
      endTime,
      excludeId,
    );
    if (overlap) {
      throw new ConflictError('Resource is already reserved for the selected time slot');
    }
  }
}

export const reservationService = new ReservationService();
