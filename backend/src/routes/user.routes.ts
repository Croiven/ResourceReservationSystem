import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { updateUserSchema, userIdParamSchema } from '../validation/auth.validation.js';
import { validate } from '../validation/validate.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/', userController.list);
router.get('/:id', validate({ params: userIdParamSchema }), userController.getById);
router.patch(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  userController.update,
);
router.delete('/:id', validate({ params: userIdParamSchema }), userController.deactivate);

export { router as userRouter };
