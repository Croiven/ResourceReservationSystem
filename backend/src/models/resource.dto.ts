import type { Resource } from '@prisma/client';

export type ResourceResponse = Resource;

export function toResourceResponse(resource: Resource): ResourceResponse {
  return resource;
}
