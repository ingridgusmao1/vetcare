import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload } from '../types';

// Sign the user's identity into a token. The token can be verified by anyone
// with the secret, but cannot be forged without it.
// We pass the payload as a plain object — jwt.sign adds iat (issued at) and
// exp (expires at) automatically based on JWT_EXPIRES_IN.

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any, 
  });
}
// Verify a token from a request cookie. If the signature is wrong or the
// token has expired, jwt.verify throws — we let the auth middleware catch it.

export function verifyToken(token: string): TokenPayload {

  // The `as` cast is safe because we control what we put into the token.
return jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
}