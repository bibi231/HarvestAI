import admin from 'firebase-admin';
import type { Request, Response, NextFunction } from 'express';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

declare global {
  namespace Express {
    interface Request { user?: admin.auth.DecodedIdToken; }
  }
}

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.split(' ')[1] ?? (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing auth token' });
  }
  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
