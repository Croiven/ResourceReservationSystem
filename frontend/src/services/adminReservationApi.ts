import type { AdminListReservationsQuery, Reservation } from '../types/reservation';
import { apiRequest } from './apiClient';

function buildQueryString(query?: AdminListReservationsQuery): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  if (query.userId !== undefined) {
    params.set('userId', query.userId);
  }
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

export async function listAllReservations(
  query: AdminListReservationsQuery | undefined,
  accessToken: string,
): Promise<Reservation[]> {
  return apiRequest<Reservation[]>(`/admin/reservations${buildQueryString(query)}`, {
    accessToken: requireAccessToken(accessToken),
  });
}
