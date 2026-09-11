import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', (req, res) => {
  healthController.getHealth(req, res);
});

export { router as healthRouter };
