import type { ResourceResponse } from '../models/resource.dto.js';
import { toResourceResponse } from '../models/resource.dto.js';
import { reservationRepository } from '../repositories/reservation.repository.js';
import { resourceRepository } from '../repositories/resource.repository.js';
import type {
  CreateResourceInput,
  ListResourcesQuery,
  ResourceAvailabilityQuery,
  ResourceBookingsQuery,
  UpdateResourceInput,
} from '../validation/resource.validation.js';
import { isValidSlotRange } from '../lib/slot-time.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

export interface ResourceBookingSlot {
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface AvailabilityResult {
  available: boolean;
}

export class ResourceService {
  async listResources(query: ListResourcesQuery): Promise<ResourceResponse[]> {
    const filters = {
      ...(query.active !== undefined ? { isActive: query.active === 'true' } : {}),
      ...(query.type !== undefined ? { type: query.type } : {}),
      ...(query.search !== undefined ? { search: query.search } : {}),
    };
    const resources = await resourceRepository.findAll(
      Object.keys(filters).length > 0 ? filters : undefined,
    );
    return resources.map(toResourceResponse);
  }

  async getResource(id: string): Promise<ResourceResponse> {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    return toResourceResponse(resource);
  }

  async createResource(data: CreateResourceInput): Promise<ResourceResponse> {
    const createData = {
      name: data.name,
      type: data.type,
      ...(data.description !== undefined ? { description: data.description } : {}),
    };
    const resource = await resourceRepository.create(createData);
    return toResourceResponse(resource);
  }

  async updateResource(id: string, data: UpdateResourceInput): Promise<ResourceResponse> {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    const updateData = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    };
    const updated = await resourceRepository.update(id, updateData);
    return toResourceResponse(updated);
  }

  async deactivateResource(id: string): Promise<ResourceResponse> {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    const deactivated = await resourceRepository.deactivate(id);
    return toResourceResponse(deactivated);
  }

  async getResourceBookings(
    id: string,
    query: ResourceBookingsQuery,
  ): Promise<ResourceBookingSlot[]> {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    const from = new Date(query.from);
    const to = new Date(query.to);
    return reservationRepository.findBookingsInRange(id, from, to);
  }

  async checkAvailability(
    id: string,
    query: ResourceAvailabilityQuery,
  ): Promise<AvailabilityResult> {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    if (!resource.isActive) {
      return { available: false };
    }

    const startTime = new Date(query.startTime);
    const endTime = new Date(query.endTime);

    if (!isValidSlotRange(startTime, endTime)) {
      throw new ValidationError(
        'Reservations must start on the hour or half-hour and last a multiple of 30 minutes',
      );
    }

    if (startTime < new Date()) {
      return { available: false };
    }

    const overlap = await reservationRepository.findOverlapping(
      id,
      startTime,
      endTime,
      query.excludeReservationId,
    );

    return { available: overlap === null };
  }
}

export const resourceService = new ResourceService();
