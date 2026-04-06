import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRouter from './routes/auth.js';
import harvestRouter from './routes/harvest.js';
import jobsRouter from './routes/jobs.js';
import creditsRouter from './routes/credits.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();

// Raw body for webhooks (must come BEFORE express.json())
app.use('/api/webhooks/paystack', express.raw({ type: 'application/json' }));
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON body for everything else
app.use(express.json({ limit: '1mb' }));

// Security
app.use(helmet());

// CORS — allow client origin + chrome extension origins
const allowedOrigins = [
  process.env.CLIENT_URL!,
  'http://localhost:5173',
  'http://localhost:5174',
  /^chrome-extension:\/\//,
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin));
    callback(ok ? null : new Error('CORS blocked'), ok);
  },
  credentials: true,
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/harvest', harvestRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/webhooks', webhooksRouter);

// Health
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'SERVER_ERROR', message: 'An unexpected error occurred' });
});

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => console.log(`HarvestAI server running on port ${PORT}`));
