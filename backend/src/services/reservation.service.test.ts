import { ResourceType, ReservationStatus, UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictError, ValidationError } from '../middleware/error.middleware.js';

vi.mock('../repositories/reservation.repository.js', () => ({
  reservationRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findOverlapping: vi.fn(),
  },
}));

vi.mock('../repositories/resource.repository.js', () => ({
  resourceRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('../repositories/user.repository.js', () => ({
  userRepository: {
    existsActive: vi.fn(),
  },
}));

import { reservationRepository } from '../repositories/reservation.repository.js';
import { resourceRepository } from '../repositories/resource.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { ReservationService } from './reservation.service.js';

const mockReservation = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: new Date('2030-01-01T10:00:00Z'),
  endTime: new Date('2030-01-01T11:00:00Z'),
  status: ReservationStatus.CONFIRMED,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-1', firstName: 'Regular', lastName: 'User', email: 'user@example.com' },
  resource: { id: 'resource-1', name: 'Room A', type: ResourceType.ROOM },
};

describe('ReservationService', () => {
  const reservationService = new ReservationService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a reservation when no overlap exists', async () => {
    vi.mocked(userRepository.existsActive).mockResolvedValue(true);
    vi.mocked(resourceRepository.findById).mockResolvedValue({
      id: 'resource-1',
      name: 'Room A',
      description: null,
      type: ResourceType.ROOM,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(reservationRepository.findOverlapping).mockResolvedValue(null);
    vi.mocked(reservationRepository.create).mockResolvedValue(mockReservation);

    const result = await reservationService.createReservation(
      {
        resourceId: 'resource-1',
        startTime: '2030-01-01T10:00:00.000Z',
        endTime: '2030-01-01T11:00:00.000Z',
      },
      'user-1',
    );

    expect(result.id).toBe('res-1');
  });

  it('rejects reservation when times overlap', async () => {
    vi.mocked(userRepository.existsActive).mockResolvedValue(true);
    vi.mocked(resourceRepository.findById).mockResolvedValue({
      id: 'resource-1',
      name: 'Room A',
      description: null,
      type: ResourceType.ROOM,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(reservationRepository.findOverlapping).mockResolvedValue(mockReservation);

    await expect(
      reservationService.createReservation(
        {
          resourceId: 'resource-1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T11:00:00.000Z',
        },
        'user-1',
      ),
    ).rejects.toThrow(ConflictError);
  });

  it('rejects reservation when times are not on 30-minute slots', async () => {
    await expect(
      reservationService.createReservation(
        {
          resourceId: 'resource-1',
          startTime: '2030-01-01T10:15:00.000Z',
          endTime: '2030-01-01T11:00:00.000Z',
        },
        'user-1',
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects reservation when duration is not a multiple of 30 minutes', async () => {
    await expect(
      reservationService.createReservation(
        {
          resourceId: 'resource-1',
          startTime: '2030-01-01T10:00:00.000Z',
          endTime: '2030-01-01T10:45:00.000Z',
        },
        'user-1',
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects reservation when end time is before start time', async () => {
    await expect(
      reservationService.createReservation(
        {
          resourceId: 'resource-1',
          startTime: '2030-01-01T11:00:00.000Z',
          endTime: '2030-01-01T10:00:00.000Z',
        },
        'user-1',
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects reservation when start time is in the past', async () => {
    await expect(
      reservationService.createReservation(
        {
          resourceId: 'resource-1',
          startTime: '2020-01-01T10:00:00.000Z',
          endTime: '2020-01-01T11:00:00.000Z',
        },
        'user-1',
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('lists only own reservations for regular users', async () => {
    vi.mocked(reservationRepository.findAll).mockResolvedValue([mockReservation]);

    await reservationService.listReservations({}, 'user-1', UserRole.USER);

    expect(reservationRepository.findAll).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('lists only own reservations for admins on the user list endpoint', async () => {
    vi.mocked(reservationRepository.findAll).mockResolvedValue([mockReservation]);

    await reservationService.listReservations({}, 'admin-1', UserRole.ADMIN);

    expect(reservationRepository.findAll).toHaveBeenCalledWith({ userId: 'admin-1' });
  });

  it('lists all reservations for admin without forcing userId', async () => {
    vi.mocked(reservationRepository.findAll).mockResolvedValue([mockReservation]);

    await reservationService.listAllReservations({});

    expect(reservationRepository.findAll).toHaveBeenCalledWith({});
  });

  it('applies filters for admin list reservations', async () => {
    vi.mocked(reservationRepository.findAll).mockResolvedValue([mockReservation]);

    await reservationService.listAllReservations({
      userId: 'user-1',
      resourceId: 'resource-1',
      status: ReservationStatus.CONFIRMED,
    });

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      userId: 'user-1',
      resourceId: 'resource-1',
      status: ReservationStatus.CONFIRMED,
    });
  });

  it('applies status filter for regular users scoped to own userId', async () => {
    vi.mocked(reservationRepository.findAll).mockResolvedValue([mockReservation]);

    await reservationService.listReservations(
      { status: ReservationStatus.CONFIRMED },
      'user-1',
      UserRole.USER,
    );

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      userId: 'user-1',
      status: ReservationStatus.CONFIRMED,
    });
  });

  it('updates reservation when rescheduling without overlap', async () => {
    vi.mocked(reservationRepository.findById).mockResolvedValue(mockReservation);
    vi.mocked(userRepository.existsActive).mockResolvedValue(true);
    vi.mocked(resourceRepository.findById).mockResolvedValue({
      id: 'resource-1',
      name: 'Room A',
      description: null,
      type: ResourceType.ROOM,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(reservationRepository.findOverlapping).mockResolvedValue(null);
    vi.mocked(reservationRepository.update).mockResolvedValue({
      ...mockReservation,
      startTime: new Date('2030-01-01T12:00:00Z'),
      endTime: new Date('2030-01-01T13:00:00Z'),
    });

    const result = await reservationService.updateReservation(
      'res-1',
      {
        startTime: '2030-01-01T12:00:00.000Z',
        endTime: '2030-01-01T13:00:00.000Z',
      },
      'user-1',
      UserRole.USER,
    );

    expect(result.startTime).toEqual(new Date('2030-01-01T12:00:00Z'));
    expect(reservationRepository.findOverlapping).toHaveBeenCalledWith(
      'resource-1',
      new Date('2030-01-01T12:00:00.000Z'),
      new Date('2030-01-01T13:00:00.000Z'),
      'res-1',
    );
  });

  it('rejects update on cancelled reservation', async () => {
    vi.mocked(reservationRepository.findById).mockResolvedValue({
      ...mockReservation,
      status: ReservationStatus.CANCELLED,
    });

    await expect(
      reservationService.updateReservation(
        'res-1',
        { notes: 'Updated' },
        'user-1',
        UserRole.USER,
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('cancel is idempotent for already cancelled reservations', async () => {
    const cancelled = { ...mockReservation, status: ReservationStatus.CANCELLED };
    vi.mocked(reservationRepository.findById).mockResolvedValue(cancelled);

    const result = await reservationService.cancelReservation('res-1', 'user-1', UserRole.USER);

    expect(result.status).toBe(ReservationStatus.CANCELLED);
    expect(reservationRepository.update).not.toHaveBeenCalled();
  });

  it('cancels an active reservation', async () => {
    vi.mocked(reservationRepository.findById).mockResolvedValue(mockReservation);
    vi.mocked(reservationRepository.update).mockResolvedValue({
      ...mockReservation,
      status: ReservationStatus.CANCELLED,
    });

    const result = await reservationService.cancelReservation('res-1', 'user-1', UserRole.USER);

    expect(result.status).toBe(ReservationStatus.CANCELLED);
  });
});
