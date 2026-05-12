import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

// Factory that returns a configured Express app.
// We separate `app.ts` (testable, no listen) from `server.ts` (calls listen).
// This makes Supertest tests trivial: they just import buildApp().
export function buildApp(): Express {
  const app = express();

  // ---- Security: HTTP headers ----
  // Helmet sets ~12 useful headers by default: X-Frame-Options, X-Content-
  // Type-Options, Strict-Transport-Security (HTTPS), CSP, etc.
  app.use(helmet());

  // ---- CORS ----
  // The frontend lives on localhost:5173 (Vite); the API on 4000.
  // Without CORS, the browser blocks fetch() calls between them.
  // credentials:true allows cookies on cross-origin requests.
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // ---- Cookie parsing ----
  // Populates req.cookies from the Cookie header. Required by requireAuth.
  app.use(cookieParser());

  // ---- Body parsing ----
  // Parses application/json bodies into req.body. 1mb is plenty for forms.
  app.use(express.json({ limit: '1mb' }));

  // ---- Logging ----
  // 'dev' format is colorized and concise: "GET /api/patients 200 12.345 ms".
  // We only log in development to avoid noisy production logs.
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // ---- Routes ----
  app.use('/api', routes);

  // ---- 404 fallback ----
  // Anything that didn't match a route returns a clean JSON 404.
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} introuvable` });
  });

  // ---- Error handler — must be LAST ----
  app.use(errorHandler);

  return app;
}