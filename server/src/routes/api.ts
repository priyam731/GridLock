import { Router } from 'express';
import { GridController } from '../controllers/GridController';

export function createApiRouter(controller: GridController): Router {
  const router = Router();

  router.get('/grid', controller.getGrid);
  router.get('/stats', controller.getStats);

  return router;
}
