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

  it('lists only own reservations for regular users', async () => {
    vi.mocked(reservationRepository.findAll).mockResolvedValue([mockReservation]);

    await reservationService.listReservations({}, 'user-1', UserRole.USER);

    expect(reservationRepository.findAll).toHaveBeenCalledWith({ userId: 'user-1' });
  });
});
