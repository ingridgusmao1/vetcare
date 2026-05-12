import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { UserRole } from '../types';

// ---------------------------------------------------------------------------
// requireAuth
// Ensures a valid JWT cookie is present. Attaches the payload to req.user
// so downstream code knows who is calling.
// ---------------------------------------------------------------------------
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // cookie-parser populates req.cookies; missing cookie = no token at all.
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    // verifyToken throws on bad signature OR expired token.
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    // Don't leak the underlying jwt error message — could fingerprint our setup.
    return res.status(401).json({ message: 'Session invalide ou expirée' });
  }
}

// ---------------------------------------------------------------------------
// requireRole — role-based authorization.
// Usage: router.post('/users', requireAuth, requireRole('administrateur'), ...)
//
// The hierarchy is enforced manually here: an admin satisfies any role
// requirement (admin > vet > assistant). For more roles, a permissions matrix
// would be cleaner; for 3 roles, this is fine.
// ---------------------------------------------------------------------------
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Admin gets a free pass on everything.
    if (req.user.role === 'administrateur') return next();

    // Otherwise check membership.
    if (allowed.includes(req.user.role)) return next();

    return res.status(403).json({ message: 'Permissions insuffisantes' });
  };
}