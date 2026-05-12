import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validators/auth';

// Router-level prefix is set in routes/index.ts → all paths here are relative.
const router = Router();

// Public routes — no auth required.
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes.
router.get('/me', requireAuth, AuthController.me);

// Admin-only registration. Order matters: requireAuth → requireRole → validate.
router.post(
  '/register',
  requireAuth,
  requireRole('administrateur'),
  validate(registerSchema),
  AuthController.register
);

export default router;