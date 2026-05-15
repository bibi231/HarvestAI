import rateLimit from 'express-rate-limit';

export const harvestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, res) => res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many requests. Please wait.' }),
});
