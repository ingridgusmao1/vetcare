import { Router } from 'express';
import { ConsultationController } from '../controllers/ConsultationController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createConsultationSchema,
  updateConsultationSchema,
  updateStatusSchema,
  findConsultationsQuerySchema,
} from '../validators/consultation';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  validate(findConsultationsQuerySchema, 'query'),
  ConsultationController.getAll
);
router.get('/:id', ConsultationController.getById);
router.get('/by-patient/:patientId', ConsultationController.getByPatient);

router.post(
  '/',
  requireRole('veterinaire'),       // assistants don't create consultations
  validate(createConsultationSchema),
  ConsultationController.create
);

router.put(
  '/:id',
  requireRole('veterinaire'),
  validate(updateConsultationSchema),
  ConsultationController.update
);

// Dedicated PATCH for status changes (US-12) — most common update.
router.patch(
  '/:id/status',
  requireRole('veterinaire'),
  validate(updateStatusSchema),
  ConsultationController.updateStatus
);

router.delete('/:id', requireRole('administrateur'), ConsultationController.remove);

export default router;