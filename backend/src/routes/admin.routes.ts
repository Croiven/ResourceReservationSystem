import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { adminListReservationsQuerySchema } from '../validation/reservation.validation.js';
import { validate } from '../validation/validate.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get(
  '/reservations',
  validate({ query: adminListReservationsQuerySchema }),
  adminController.listReservations,
);

export { router as adminRouter };
