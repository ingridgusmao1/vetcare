import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPatientSchema,
  updatePatientSchema,
  findPatientsQuerySchema,
} from '../validators/patient';

const router = Router();
router.use(requireAuth);

router.get('/', validate(findPatientsQuerySchema, 'query'), PatientController.getAll);
router.get('/:id', PatientController.getById);

router.post('/', validate(createPatientSchema), PatientController.create);

router.put(
  '/:id',
  validate(updatePatientSchema),
  PatientController.update
);

// Soft delete = vet or admin only (US-08).
router.delete(
  '/:id',
  requireRole('veterinaire'),
  PatientController.softDelete
);

export default router;