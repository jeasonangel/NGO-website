// backend/src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import dataRoutes from './routes/data';
import { config } from './config';

dotenv.config();

export function buildApp() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ 
    origin: config.corsOrigins,
    credentials: true,
  }));
  app.use(compression());
  app.use(express.json());
  app.use(morgan('tiny'));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      app: 'ngo-website-backend',
      timestamp: new Date().toISOString(),
    });
  });

  // ✅ All API routes under /api
  app.use('/api', dataRoutes);

  // 404 handler
  app.use((_req, res) => {
    console.log('❌ Route not found:', _req.method, _req.path);
    res.status(404).json({ error: 'Not found', path: _req.path });
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const upstreamStatus = err.response?.status;

    if (upstreamStatus === 401) {
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