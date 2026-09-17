import type { Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { resourceService } from '../services/resource.service.js';
import type {
  CreateResourceInput,
  ListResourcesQuery,
  UpdateResourceInput,
} from '../validation/resource.validation.js';

export class ResourceController {
  list = asyncHandler(async (req, res: Response) => {
    const query = req.query as ListResourcesQuery;
    const resources = await resourceService.listResources(query);
    res.status(200).json({ data: resources });
  });

  getById = asyncHandler(async (req, res: Response) => {
    const resource = await resourceService.getResource(req.params['id'] as string);
    res.status(200).json({ data: resource });
  });

  create = asyncHandler(async (req, res: Response) => {
    const data = req.body as CreateResourceInput;
    const resource = await resourceService.createResource(data);
    res.status(201).json({ data: resource });
  });

  update = asyncHandler(async (req, res: Response) => {
    const data = req.body as UpdateResourceInput;
    const resource = await resourceService.updateResource(req.params['id'] as string, data);
    res.status(200).json({ data: resource });
  });

  deactivate = asyncHandler(async (req, res: Response) => {
    const resource = await resourceService.deactivateResource(req.params['id'] as string);
    res.status(200).json({ data: resource });
  });
}

export const resourceController = new ResourceController();
