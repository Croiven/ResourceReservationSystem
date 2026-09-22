import { ResourceType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

vi.mock('../repositories/resource.repository.js', () => ({
  resourceRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
  },
}));

vi.mock('../repositories/reservation.repository.js', () => ({
  reservationRepository: {
    findBookingsInRange: vi.fn(),
    findOverlapping: vi.fn(),
  },
}));

import { reservationRepository } from '../repositories/reservation.repository.js';
import { resourceRepository } from '../repositories/resource.repository.js';
import { ResourceService } from './resource.service.js';

const mockResource = {
  id: 'resource-1',
  name: 'Conference Room A',
  description: 'Large meeting room',
  type: ResourceType.ROOM,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('ResourceService', () => {
  const resourceService = new ResourceService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listResources', () => {
    it('returns all resources when no filters are provided', async () => {
      vi.mocked(resourceRepository.findAll).mockResolvedValue([mockResource]);

      const result = await resourceService.listResources({});

      expect(result).toHaveLength(1);
      expect(resourceRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('passes active filter to repository', async () => {
      vi.mocked(resourceRepository.findAll).mockResolvedValue([mockResource]);

      await resourceService.listResources({ active: 'true' });

      expect(resourceRepository.findAll).toHaveBeenCalledWith({ isActive: true });
    });

    it('passes type filter to repository', async () => {
      vi.mocked(resourceRepository.findAll).mockResolvedValue([mockResource]);

      await resourceService.listResources({ type: ResourceType.ROOM });

      expect(resourceRepository.findAll).toHaveBeenCalledWith({ type: ResourceType.ROOM });
    });

    it('passes search filter to repository', async () => {
      vi.mocked(resourceRepository.findAll).mockResolvedValue([mockResource]);

      await resourceService.listResources({ search: 'conference' });

      expect(resourceRepository.findAll).toHaveBeenCalledWith({ search: 'conference' });
    });

    it('passes combined filters to repository', async () => {
      vi.mocked(resourceRepository.findAll).mockResolvedValue([mockResource]);

      await resourceService.listResources({
        active: 'true',
        type: ResourceType.ROOM,
        search: 'conference',
      });

      expect(resourceRepository.findAll).toHaveBeenCalledWith({
        isActive: true,
        type: ResourceType.ROOM,
        search: 'conference',
      });
    });
  });

  describe('getResource', () => {
    it('returns resource when found', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(mockResource);

      const result = await resourceService.getResource('resource-1');

      expect(result.id).toBe('resource-1');
    });

    it('throws NotFoundError when resource does not exist', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(null);

      await expect(resourceService.getResource('missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createResource', () => {
    it('creates a resource', async () => {
      vi.mocked(resourceRepository.create).mockResolvedValue(mockResource);

      const result = await resourceService.createResource({
        name: 'Conference Room A',
        description: 'Large meeting room',
        type: ResourceType.ROOM,
      });

      expect(result.name).toBe('Conference Room A');
      expect(resourceRepository.create).toHaveBeenCalledWith({
        name: 'Conference Room A',
        description: 'Large meeting room',
        type: ResourceType.ROOM,
      });
    });
  });

  describe('updateResource', () => {
    it('updates a resource', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(mockResource);
      vi.mocked(resourceRepository.update).mockResolvedValue({
        ...mockResource,
        name: 'Updated Room',
      });

      const result = await resourceService.updateResource('resource-1', { name: 'Updated Room' });

      expect(result.name).toBe('Updated Room');
    });

    it('throws NotFoundError when resource does not exist', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(null);

      await expect(
        resourceService.updateResource('missing', { name: 'Updated Room' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deactivateResource', () => {
    it('deactivates a resource', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(mockResource);
      vi.mocked(resourceRepository.deactivate).mockResolvedValue({
        ...mockResource,
        isActive: false,
      });

      const result = await resourceService.deactivateResource('resource-1');

      expect(result.isActive).toBe(false);
    });

    it('throws NotFoundError when resource does not exist', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(null);

      await expect(resourceService.deactivateResource('missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getResourceBookings', () => {
    it('returns bookings in range for a resource', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(mockResource);
      vi.mocked(reservationRepository.findBookingsInRange).mockResolvedValue([
        {
          startTime: new Date('2030-01-01T10:00:00Z'),
          endTime: new Date('2030-01-01T11:00:00Z'),
          status: 'CONFIRMED',
        },
      ]);

      const result = await resourceService.getResourceBookings('resource-1', {
        from: '2030-01-01T00:00:00.000Z',
        to: '2030-02-01T00:00:00.000Z',
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('checkAvailability', () => {
    it('returns available when no overlap exists', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(mockResource);
      vi.mocked(reservationRepository.findOverlapping).mockResolvedValue(null);

      const result = await resourceService.checkAvailability('resource-1', {
        startTime: '2030-01-01T10:00:00.000Z',
        endTime: '2030-01-01T11:00:00.000Z',
      });

      expect(result.available).toBe(true);
    });

    it('rejects invalid slot alignment', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue(mockResource);

      await expect(
        resourceService.checkAvailability('resource-1', {
          startTime: '2030-01-01T10:15:00.000Z',
          endTime: '2030-01-01T11:00:00.000Z',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('returns unavailable when resource is inactive', async () => {
      vi.mocked(resourceRepository.findById).mockResolvedValue({
        ...mockResource,
        isActive: false,
      });

      const result = await resourceService.checkAvailability('resource-1', {
        startTime: '2030-01-01T10:00:00.000Z',
        endTime: '2030-01-01T11:00:00.000Z',
      });

      expect(result.available).toBe(false);
    });
  });
});
