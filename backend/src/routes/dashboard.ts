import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
router.use(requireAuth);

router.get('/stats', DashboardController.getStats);

export default router;