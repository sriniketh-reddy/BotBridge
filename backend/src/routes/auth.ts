import express from 'express';
import { auth } from '../config/firebase.js';
import { createUser, getUser } from '../services/firestore.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Endpoint to validate ID token and return or create user profile
router.post('/verify-token', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required' });

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const existing = await getUser(uid);
    if (!existing) {
      const profile = { name: decoded.name || '', email: decoded.email || '', profile_img: decoded.picture || '' };
      await createUser(uid, profile);
    }
  const user = await getUser(uid);
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ uid }, jwtSecret, { expiresIn: '7d' });
    // set httpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    res.cookie('botbridge_token', token, cookieOptions);
    return res.json({ user, token });
  } catch (err) {
    console.error('verify-token error', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Return current user from cookie or token
router.get('/me', async (req: any, res) => {
  // middleware-free: check cookie or Authorization header
  try {
    const token = req.cookies?.botbridge_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const decoded: any = jwt.verify(token, jwtSecret);
    const uid = decoded.uid;
    const user = await getUser(uid);
    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
