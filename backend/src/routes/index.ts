import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { healthRouter } from './health.routes.js';
import { reservationRouter } from './reservation.routes.js';
import { resourceRouter } from './resource.routes.js';
import { userRouter } from './user.routes.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/resources', resourceRouter);
router.use('/reservations', reservationRouter);

export { router as apiRouter };
