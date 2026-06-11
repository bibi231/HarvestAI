import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import harvestRouter from './routes/harvest.js';
import jobsRouter from './routes/jobs.js';
import creditsRouter from './routes/credits.js';
import webhooksRouter from './routes/webhooks.js';
import newsletterRouter from './routes/newsletter.js';

const app = express();
app.set('trust proxy', 1);

app.use('/api/webhooks/paystack', express.raw({ type: 'application/json' }));
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(helmet());

const ALLOWED_ORIGINS = new Set<string>([
  process.env.CLIENT_URL || '',
  'https://harvestai.com.ng',
  'https://www.harvestai.com.ng',
  'https://harvestai-new.vercel.app',
  'https://client-beetrus-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:4000',
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    if (/^https:\/\/client-[a-z0-9-]+-beetrus-projects\.vercel\.app$/.test(origin)) return callback(null, true);
    if (/^https:\/\/harvestai-new-[a-z0-9-]+\.vercel\.app$/.test(origin)) return callback(null, true);
    if (/^https:\/\/harvestai-[a-z0-9-]+-beetrus-projects\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(null, false); // reject with 403, not 500
  },
  credentials: true,
}));

// ─── Rate limiting ───────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' },
});
app.use('/api/auth', strictLimiter);
app.use('/api/credits', strictLimiter);

app.use('/api/auth', authRouter);
app.use('/api/harvest', harvestRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/settings', (await import('./routes/settings.js')).default);
app.use('/api/templates', (await import('./routes/templates.js')).default);
app.use('/api/scheduled', (await import('./routes/scheduled.js')).default);
app.use('/api/admin', (await import('./routes/admin.js')).default);
app.use('/api/blog', (await import('./routes/blog.js')).default);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: Date.now() }));
app.get('/api/db-debug', async (_req, res) => {
  try {
    const { users } = await import('./db/schema.js');
    const { db } = await import('./db/index.js');
    const result = await db.select().from(users).limit(1);
    res.json({ status: 'connected', count: result.length });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message, stack: err.stack });
  }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'SERVER_ERROR', message: 'An unexpected error occurred' });
});

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`HarvestAI server running on port ${PORT}`);
  import('./services/schedulerService.js').then(m => m.startScheduler());
  import('./jobs/drip.js').then(m => m.startDripJobs()).catch(console.error);

  // Self-ping every 13 minutes to prevent Render free-tier spin-down
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  setInterval(() => {
    fetch(`${SELF_URL}/api/health`).catch(() => {});
  }, 13 * 60 * 1000);
});

export default app;
