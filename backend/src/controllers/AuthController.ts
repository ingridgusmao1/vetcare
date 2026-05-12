import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/UserModel';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/token';
import { env } from '../config/env';
import { LoginInput, RegisterInput } from '../validators/auth';

// Cookie configuration shared by login + logout.
// httpOnly: cannot be read by JS (XSS-safe).
// sameSite 'lax': sent on top-level navigation, blocked on cross-site POST.
// secure: only over HTTPS — false in dev where we use plain HTTP.

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.COOKIE_SECURE,

  // 8 hours in ms — match JWT_EXPIRES_IN. The client cookie must outlive
  // neither under nor the JWT.

  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};

export class AuthController {

  // ------------------------------------------------------------------------
  // POST /api/auth/login
  // Returns the public user data and sets the JWT cookie on success.
  // ------------------------------------------------------------------------

  static async login(req: Request, res: Response, next: NextFunction) {
    try {

      // The body is already validated and typed by validate(loginSchema).

      const { email, password } = req.body as LoginInput;

      // Look up the user by email.
      const user = await UserModel.findByEmail(email);

      // SECURITY: same generic error whether the user doesn't exist OR the
      // password is wrong. Otherwise an attacker could enumerate accounts
      // (try emails, see which one says "wrong password" vs "no such user").

      if (!user || !user.is_active) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      const valid = await verifyPassword(user.password_hash, password);
      if (!valid) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      // Sign a JWT with minimal payload — never put password_hash in there.

      const token = signToken({
        sub: user.reference_user,
        email: user.email,
        role: user.role,
      });

      // Set the cookie. `token` is the cookie name; the client never sees it
      // through document.cookie because of httpOnly.

      res.cookie('token', token, COOKIE_OPTIONS);

      // Return public profile — strip the password hash explicitly.

      const { password_hash, ...publicUser } = user;
      void password_hash;        // mark as intentionally unused
      return res.status(200).json(publicUser);
    } catch (err) {
      next(err);
    }
  }

  // ------------------------------------------------------------------------
  // POST /api/auth/logout
  // Clears the cookie. The JWT itself is still valid until expiry — for
  // a clinic-scale app, this is acceptable. For higher security you'd add
  // a server-side token blacklist (Redis). Out of scope here.
  // ------------------------------------------------------------------------
  static async logout(_req: Request, res: Response) {
    res.clearCookie('token', COOKIE_OPTIONS);
    return res.status(204).send();
  }

  // ------------------------------------------------------------------------
  // POST /api/auth/register   (admin-only — see route guard)
  // Used by an administrator to create vet/assistant accounts.
  // ------------------------------------------------------------------------
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body as RegisterInput;

      // Reject duplicates with a clean 409 instead of the raw DB error.
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email déjà utilisé' });
      }

      // Hash before INSERT — the model never sees plaintext.
      const password_hash = await hashPassword(password);

      const created = await UserModel.create({ email, password_hash, role });

      // Strip hash before returning.
      const { password_hash: _, ...publicUser } = created;
      void _;
      return res.status(201).json(publicUser);
    } catch (err) {
      next(err);
    }
  }

  // ------------------------------------------------------------------------
  // GET /api/auth/me
  // Returns the current user. Frontend calls this on app load to decide
  // "am I logged in?" before showing the dashboard.
  // ------------------------------------------------------------------------

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      // requireAuth middleware put the token payload here. If it's missing,
      // we never reach this method — but we narrow the type for TS anyway.
      if (!req.user) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const user = await UserModel.findById(req.user.sub);
      if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

      const { password_hash, ...publicUser } = user;
      void password_hash;
      return res.status(200).json(publicUser);
    } catch (err) {
      next(err);
    }
  }
}