import type { Request, Response, NextFunction } from 'express';
import { checkCredits } from '../services/creditsService.js';

export async function requireCredits(req: Request, res: Response, next: NextFunction) {
  try {
    const info = await checkCredits(req.user!.uid);
    if (!info.canHarvest) {
      return res.status(402).json({
        error: 'INSUFFICIENT_CREDITS',
        message: 'No credits remaining. Please purchase more.',
        freeRemaining: info.freeRemaining,
        paidCredits: info.paidCredits,
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to check credits' });
  }
}
