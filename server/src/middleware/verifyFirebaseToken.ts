import admin from 'firebase-admin';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

if (!admin.apps.length) {
  let credential;

  // 1. Prioritize individual separated env variables (Best for Render/Vercel)
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal '\n' characters with actual newlines for PEM parsing
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }
  // 2. Full JSON string (FIREBASE_SERVICE_ACCOUNT_JSON is the canonical name)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT) {
    let json = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT!).trim();
    // Some .env files might double-wrap in quotes or have literal \n
    if ((json.startsWith("'") && json.endsWith("'")) || (json.startsWith('"') && json.endsWith('"'))) {
      json = json.slice(1, -1);
    }
    try {
      credential = admin.credential.cert(JSON.parse(json));
    } catch (err: any) {
      console.error('[Firebase] Malformed JSON in env var:', err.message);
      // Fallback to local file if JSON parsing fails
    }
  }
  // 3. Last-resort local file (NEVER commit this — gitignored).
  else {
    const candidate = new URL('../../firebase-service-account.json', import.meta.url);
    let fileExists = false;
    try { fs.accessSync(candidate); fileExists = true; } catch { /* missing */ }
    if (!fileExists) {
      throw new Error('Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON env var.');
    }
    const data = fs.readFileSync(candidate, 'utf-8');
    credential = admin.credential.cert(JSON.parse(data));
  }

  admin.initializeApp({ credential });
}

declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken | {
        uid: string;
        email: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.split(' ')[1] ?? (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing auth token' });
  }

  // Check if it's an API key
  if (token.startsWith('hai_')) {
    const [user] = await db.select().from(users).where(eq(users.apiKey, token)).limit(1);
    if (!user) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid API key' });
    req.user = { uid: user.id, email: user.email!, name: undefined, picture: undefined };
    return next();
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
