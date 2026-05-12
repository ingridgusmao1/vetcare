import { Router } from 'express';
import { DossierController } from '../controllers/DossierController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { updateDossierSchema } from '../validators/dossier';

const router = Router();
router.use(requireAuth);

router.get('/', DossierController.getAll);
router.get('/:id', DossierController.getById);
router.get('/by-patient/:patientId', DossierController.getByPatient);

// Only vets and admins can edit medical records (US-14).
router.put(
  '/:id',
  requireRole('veterinaire'),
  validate(updateDossierSchema),
  DossierController.update
);

export default router;