import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Express recognizes a middleware as the error handler when it has 4 args.
// It must be registered LAST in app.ts (after all routes).
//
// Why a centralized handler?
// - Every controller can `throw` or call `next(err)` without crafting the response.
// - Single place to log, hide internal details in production, etc.
//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error & { status?: number; code?: string },
  _req: Request,
  res: Response,
  // The unused next is required so Express recognizes us as an error handler.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  // Default status if not explicitly attached to the error object.
  const status = err.status ?? 500;

  // Log full error server-side for debugging (visible in Docker logs).
  // In production we'd ship this to a monitoring service (Sentry, etc.).
  // eslint-disable-next-line no-console
  console.error('[Error]', err);

  // Postgres unique violation surfaces here when our pre-checks miss something.
  if ((err as { code?: string }).code === '23505') {
    return res.status(409).json({ message: 'Conflit : valeur déjà existante' });
  }

  // FK violation.
  if ((err as { code?: string }).code === '23503') {
    return res.status(400).json({ message: 'Référence invalide' });
  }

  // Hide stack traces in production — they leak filesystem paths and library
  // versions that could help attackers.
  return res.status(status).json({
    message: err.message || 'Erreur serveur',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}