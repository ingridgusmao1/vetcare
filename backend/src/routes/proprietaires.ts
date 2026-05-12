import { Router } from 'express';
import { ProprietaireController } from '../controllers/ProprietaireController';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createProprietaireSchema,
  updateProprietaireSchema,
} from '../validators/proprietaire';

const router = Router();

// ALL endpoints below this line require authentication.
// router.use(...) applies the middleware to every route registered after it.
router.use(requireAuth);

router.get('/', ProprietaireController.getAll);
router.get('/:id', ProprietaireController.getById);
router.get('/:id/animals', ProprietaireController.getAnimals);

router.post(
  '/',
  validate(createProprietaireSchema),
  ProprietaireController.create
);

router.put(
  '/:id',
  validate(updateProprietaireSchema),
  ProprietaireController.update
);

router.delete('/:id', ProprietaireController.remove);

export default router;