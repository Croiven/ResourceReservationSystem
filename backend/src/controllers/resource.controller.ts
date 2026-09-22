import type { Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { resourceService } from '../services/resource.service.js';
import { getValidated } from '../validation/validate.middleware.js';
import type {
  CreateResourceInput,
  ListResourcesQuery,
  ResourceAvailabilityQuery,
  ResourceBookingsQuery,
  UpdateResourceInput,
} from '../validation/resource.validation.js';

export class ResourceController {
  list = asyncHandler(async (req, res: Response) => {
    const query = getValidated<ListResourcesQuery>(req, 'query');
    const resources = await resourceService.listResources(query);
    res.status(200).json({ data: resources });
  });

  getBookings = asyncHandler(async (req, res: Response) => {
    const { id } = getValidated<{ id: string }>(req, 'params');
    const query = getValidated<ResourceBookingsQuery>(req, 'query');
    const bookings = await resourceService.getResourceBookings(id, query);
    res.status(200).json({ data: bookings });
  });

  checkAvailability = asyncHandler(async (req, res: Response) => {
    const { id } = getValidated<{ id: string }>(req, 'params');
    const query = getValidated<ResourceAvailabilityQuery>(req, 'query');
    const result = await resourceService.checkAvailability(id, query);
    res.status(200).json({ data: result });
  });

  getById = asyncHandler(async (req, res: Response) => {
    const { id } = getValidated<{ id: string }>(req, 'params');
    const resource = await resourceService.getResource(id);
    res.status(200).json({ data: resource });
  });

  create = asyncHandler(async (req, res: Response) => {
    const data = getValidated<CreateResourceInput>(req, 'body');
    const resource = await resourceService.createResource(data);
    res.status(201).json({ data: resource });
  });

  update = asyncHandler(async (req, res: Response) => {
    const data = getValidated<UpdateResourceInput>(req, 'body');
    const { id } = getValidated<{ id: string }>(req, 'params');
    const resource = await resourceService.updateResource(id, data);
    res.status(200).json({ data: resource });
  });

  deactivate = asyncHandler(async (req, res: Response) => {
    const { id } = getValidated<{ id: string }>(req, 'params');
    const resource = await resourceService.deactivateResource(id);
    res.status(200).json({ data: resource });
  });
}

export const resourceController = new ResourceController();
