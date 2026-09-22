import type {
  CreateReservationInput,
  ListReservationsQuery,
  Reservation,
  UpdateReservationInput,
} from '../types/reservation';
import { apiRequest } from './apiClient';

function buildQueryString(query?: ListReservationsQuery): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  if (query.resourceId !== undefined) {
    params.set('resourceId', query.resourceId);
  }
  if (query.status !== undefined) {
    params.set('status', query.status);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function requireAccessToken(accessToken: string | undefined): string {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  return accessToken;
}

export async function listReservations(
  query: ListReservationsQuery | undefined,
  accessToken: string,
): Promise<Reservation[]> {
  return apiRequest<Reservation[]>(`/reservations${buildQueryString(query)}`, {
    accessToken: requireAccessToken(accessToken),
  });
}

export async function getReservation(id: string, accessToken: string): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`, {
    accessToken: requireAccessToken(accessToken),
  });
}

export async function createReservation(
  data: CreateReservationInput,
  accessToken: string,
): Promise<Reservation> {
  return apiRequest<Reservation>('/reservations', {
    method: 'POST',
    body: data,
    accessToken: requireAccessToken(accessToken),
  });
}

export async function updateReservation(
  id: string,
  data: UpdateReservationInput,
  accessToken: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`, {
    method: 'PATCH',
    body: data,
    accessToken: requireAccessToken(accessToken),
  });
}

export async function cancelReservation(id: string, accessToken: string): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`, {
    method: 'DELETE',
    accessToken: requireAccessToken(accessToken),
  });
}
