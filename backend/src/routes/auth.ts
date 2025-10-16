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
    console.debug('[auth] verify-token called');
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    console.debug('[auth] decoded uid', uid);
    const existing = await getUser(uid);
    if (!existing) {
      const profile = { name: decoded.name || '', email: decoded.email || '', profile_img: decoded.picture || '' };
      console.debug('[auth] creating new user profile for uid', uid);
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
    return res.status(401).json({ error: 'Invalid token', detail: String(err) });
  }
});

// Registration endpoint: create user profile with provided name
router.post('/register', async (req, res) => {
  const { idToken, name } = req.body;
  if (!idToken || !name) return res.status(400).json({ error: 'idToken and name required' });

  try {
    console.debug('[auth] register called for name', name);
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    console.debug('[auth] register decoded uid', uid);
    const existing = await getUser(uid);
    const profile = { name, email: decoded.email || '', profile_img: decoded.picture || '' };
    // create or update name
    console.debug('[auth] creating/updating profile for uid', uid, profile);
    await createUser(uid, profile);
    const user = await getUser(uid);
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ uid }, jwtSecret, { expiresIn: '7d' });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie('botbridge_token', token, cookieOptions);
    return res.json({ user, token });
  } catch (err) {
    console.error('register error', err);
    return res.status(400).json({ error: 'Failed to register', detail: String(err) });
  }
});

// Return current user from cookie or token
router.get('/me', async (req: any, res) => {
  // middleware-free: check cookie or Authorization header
  try {
    const cookieToken = req.cookies?.botbridge_token;
    const headerToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    console.debug('[auth] /me cookie present', !!cookieToken, 'header present', !!headerToken);
    const token = cookieToken || headerToken;
    if (!token) {
      console.debug('[auth] /me no token found');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // mask token for logs
    const masked = `${token.slice(0, 8)}...${token.slice(-8)}`;
    console.debug('[auth] /me token (masked)', masked);
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      console.debug('[auth] /me token verified, uid', decoded.uid);
      const uid = decoded.uid;
      const user = await getUser(uid);
      return res.json({ user });
    } catch (innerErr) {
      console.error('[auth] /me token verification failed', innerErr);
      return res.status(401).json({ error: 'Invalid or expired token', detail: String(innerErr) });
    }
  } catch (err) {
    console.error('[auth] /me unexpected error', err);
    return res.status(401).json({ error: 'Invalid or expired token', detail: String(err) });
  }
});

export default router;
