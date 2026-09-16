import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import {
  createResourceSchema,
  listResourcesQuerySchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from '../validation/resource.validation.js';
import { validate } from '../validation/validate.middleware.js';

const router = Router();

router.get('/', validate({ query: listResourcesQuerySchema }), resourceController.list);
router.get('/:id', validate({ params: resourceIdParamSchema }), resourceController.getById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: createResourceSchema }),
  resourceController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ params: resourceIdParamSchema, body: updateResourceSchema }),
  resourceController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ params: resourceIdParamSchema }),
  resourceController.deactivate,
);

export { router as resourceRouter };
