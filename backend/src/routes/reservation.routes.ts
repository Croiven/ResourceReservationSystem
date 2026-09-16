import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createReservationSchema,
  listReservationsQuerySchema,
  reservationIdParamSchema,
  updateReservationSchema,
} from '../validation/reservation.validation.js';
import { validate } from '../validation/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: listReservationsQuerySchema }), reservationController.list);
router.get(
  '/:id',
  validate({ params: reservationIdParamSchema }),
  reservationController.getById,
);
router.post('/', validate({ body: createReservationSchema }), reservationController.create);
router.patch(
  '/:id',
  validate({ params: reservationIdParamSchema, body: updateReservationSchema }),
  reservationController.update,
);
router.delete(
  '/:id',
  validate({ params: reservationIdParamSchema }),
  reservationController.cancel,
);

export { router as reservationRouter };
