import express from 'express';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  app.use('/api', apiRouter);

  app.use(errorHandler);

  return app;
}
