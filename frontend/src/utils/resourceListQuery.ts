import type { ListResourcesQuery, ResourceType } from '../types/resource';
import type { ActiveFilter } from './resourceLabels';

export function buildResourceListQuery(
  search: string,
  typeFilter: ResourceType | '',
  activeFilter: ActiveFilter,
): ListResourcesQuery {
  const query: ListResourcesQuery = {};

  if (activeFilter !== 'all') {
    query.active = activeFilter;
  }
  if (typeFilter !== '') {
    query.type = typeFilter;
  }
  const trimmedSearch = search.trim();
  if (trimmedSearch.length > 0) {
    query.search = trimmedSearch;
  }

  return query;
}

export function truncateResourceDescription(description: string | null, maxLength = 80): string {
  if (!description) {
    return '—';
  }
  if (description.length <= maxLength) {
    return description;
  }
  return `${description.slice(0, maxLength)}…`;
}
