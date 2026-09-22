export type ResourceType = 'ROOM' | 'EQUIPMENT' | 'VEHICLE' | 'OTHER';

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  type: ResourceType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListResourcesQuery {
  active?: 'true' | 'false';
  type?: ResourceType;
  search?: string;
}

export interface CreateResourceInput {
  name: string;
  description?: string;
  type: ResourceType;
}

export interface UpdateResourceInput {
  name?: string;
  description?: string | null;
  type?: ResourceType;
  isActive?: boolean;
}
