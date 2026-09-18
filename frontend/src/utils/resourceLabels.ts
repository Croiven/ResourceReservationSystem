import type { ResourceType } from '../types/resource';

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  ROOM: 'Room',
  EQUIPMENT: 'Equipment',
  VEHICLE: 'Vehicle',
  OTHER: 'Other',
};

export function getResourceTypeLabel(type: ResourceType): string {
  return RESOURCE_TYPE_LABELS[type];
}

export const RESOURCE_TYPE_OPTIONS: { value: ResourceType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'ROOM', label: 'Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'OTHER', label: 'Other' },
];

export type ActiveFilter = 'true' | 'false' | 'all';

export const ACTIVE_FILTER_OPTIONS: { value: ActiveFilter; label: string }[] = [
  { value: 'true', label: 'Active' },
  { value: 'all', label: 'All' },
  { value: 'false', label: 'Inactive' },
];
