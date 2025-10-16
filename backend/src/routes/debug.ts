import express from 'express';
import { getUser } from '../services/firestore.js';

const router = express.Router();

// Dev-only: fetch a user document by uid for debugging
router.get('/user/:uid', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
  const { uid } = req.params;
  try {
    console.debug('[debug] fetch user', uid);
    const user = await getUser(uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[debug] error fetching user', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
});

export default router;
