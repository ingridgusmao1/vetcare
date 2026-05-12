import { Router } from 'express';
import authRouter from './auth';
import proprietairesRouter from './proprietaires';
import patientsRouter from './patients';
import dossiersRouter from './dossiers';
import consultationsRouter from './consultations';
import traitementsRouter from './traitements';
import dashboardRouter from './dashboard';

// Single root router that aggregates all feature routers.
// app.ts mounts this at /api → all paths become /api/auth, /api/patients, etc.
const router = Router();

router.use('/auth', authRouter);
router.use('/proprietaires', proprietairesRouter);
router.use('/patients', patientsRouter);
router.use('/dossiers', dossiersRouter);
router.use('/consultations', consultationsRouter);
router.use('/traitements', traitementsRouter);
router.use('/dashboard', dashboardRouter);

// Health check endpoint — Docker / load balancers use this to know if the
// service is alive. Public on purpose; never reveal sensitive info here.
router.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default router;