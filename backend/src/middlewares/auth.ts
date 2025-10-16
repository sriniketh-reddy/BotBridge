import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.js';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
  uid?: string;
  firebaseUser?: any;
}

export const verifyFirebaseToken = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  if (authHeader) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.botbridge_token) {
    token = req.cookies.botbridge_token;
  }
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
  // Try verifying as backend JWT first
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    try {
      const decodedJwt: any = jwt.verify(token, jwtSecret);
      req.uid = decodedJwt.uid;
      // no firebaseUser payload in backend JWT
      return next();
    } catch (e) {
      // not a backend JWT, try firebase ID token
    }

    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default verifyFirebaseToken;
