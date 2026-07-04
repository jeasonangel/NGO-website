import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import dataRoutes from './routes/data';
import { config } from './config';

export function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(compression());
  app.use(express.json());
  app.use(morgan('tiny'));

  app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'ngo-website-backend' }));

  // Everything the public site needs lives under /api — the frontend never
  // talks to the Census Data Portal (Application 1) directly, and the API
  // key configured in .env never leaves this process.
  app.use('/api', dataRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const upstreamStatus = err.response?.status;

    if (upstreamStatus === 401) {
      // The Census Data Portal rejected our key outright — this is a
      // misconfiguration of THIS backend (a bad/stale CENSUS_API_KEY in
      // .env), not a visitor-facing hiccup. Make it impossible to miss
      // in the server log even though the browser only ever sees a
      // generic "unavailable" response.
      console.error(
        '\n🔑 CENSUS_API_KEY WAS REJECTED BY THE CENSUS DATA PORTAL (401 Invalid API key).\n' +
          '   No census data can be served until backend/.env has a valid key\n' +
          '   and the backend has been restarted.\n'
      );
    } else {
      console.error('Census proxy error:', upstreamStatus, err.response?.data || err.message);
    }

    const status = upstreamStatus === 429 ? 429 : 502;
    res.status(status).json({
      error:
        status === 429
          ? 'The census data quota for this site has been reached. Please try again later.'
          : 'Census data is unavailable right now. Please try again shortly.',
    });
  });

  return app;
}
