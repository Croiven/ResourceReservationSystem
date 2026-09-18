import type { ListResourcesQuery, Resource } from '../types/resource';
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
