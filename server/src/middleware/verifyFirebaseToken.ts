import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
            const serviceAccount = JSON.parse(raw);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            console.log('[Firebase] Admin initialized successfully');
        } else {
            console.error('[Firebase] FIREBASE_SERVICE_ACCOUNT_JSON is not set — auth will fail');
        }
    } catch (error) {
        console.error('[Firebase] Failed to initialize admin SDK:', error);
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'No token provided' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (err) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token' });
    }
}
