import type { AvailabilityResult, ResourceBooking } from '../types/reservation';
import type {
  CreateResourceInput,
  ListResourcesQuery,
  Resource,
  UpdateResourceInput,
} from '../types/resource';
import { apiRequest } from './apiClient';

function buildQueryString(query?: ListResourcesQuery): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  if (query.active !== undefined) {
    params.set('active', query.active);
  }
  if (query.type !== undefined) {
    params.set('type', query.type);
  }
  if (query.search !== undefined && query.search.trim().length > 0) {
    params.set('search', query.search.trim());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export async function listResources(query?: ListResourcesQuery): Promise<Resource[]> {
  return apiRequest<Resource[]>(`/resources${buildQueryString(query)}`);
}

export async function getResource(id: string): Promise<Resource> {
  return apiRequest<Resource>(`/resources/${id}`);
}

export async function getResourceBookings(
  id: string,
  from: string,
  to: string,
): Promise<ResourceBooking[]> {
  const params = new URLSearchParams({ from, to });
  return apiRequest<ResourceBooking[]>(`/resources/${id}/bookings?${params.toString()}`);
}

export async function checkAvailability(
  id: string,
  startTime: string,
  endTime: string,
  excludeReservationId?: string,
): Promise<AvailabilityResult> {
  const params = new URLSearchParams();
  params.set('startTime', startTime);
  params.set('endTime', endTime);
  if (excludeReservationId) {
    params.set('excludeReservationId', excludeReservationId);
  }
  return apiRequest<AvailabilityResult>(`/resources/${id}/availability?${params.toString()}`);
}

function requireAccessToken(accessToken: string | undefined): string {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  return accessToken;
}

export async function createResource(
  data: CreateResourceInput,
  accessToken: string,
): Promise<Resource> {
  return apiRequest<Resource>('/resources', {
    method: 'POST',
    body: data,
    accessToken: requireAccessToken(accessToken),
  });
}

export async function updateResource(
  id: string,
  data: UpdateResourceInput,
  accessToken: string,
): Promise<Resource> {
  return apiRequest<Resource>(`/resources/${id}`, {
    method: 'PATCH',
    body: data,
    accessToken: requireAccessToken(accessToken),
  });
}

export async function deactivateResource(id: string, accessToken: string): Promise<Resource> {
  return apiRequest<Resource>(`/resources/${id}`, {
    method: 'DELETE',
    accessToken: requireAccessToken(accessToken),
  });
}
