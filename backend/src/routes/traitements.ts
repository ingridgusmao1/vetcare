import { Router } from 'express';
import { TraitementController } from '../controllers/TraitementController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createTraitementSchema,
  updateTraitementSchema,
  findTraitementsQuerySchema,
} from '../validators/traitement';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  validate(findTraitementsQuerySchema, 'query'),
  TraitementController.getAll
);
router.get('/:id', TraitementController.getById);
router.get('/active-by-patient/:patientId', TraitementController.getActiveByPatient);

router.post(
  '/',
  requireRole('veterinaire'),
  validate(createTraitementSchema),
  TraitementController.create
);

router.put(
  '/:id',
  requireRole('veterinaire'),
  validate(updateTraitementSchema),
  TraitementController.update
);

router.delete('/:id', requireRole('veterinaire'), TraitementController.remove);

export default router;