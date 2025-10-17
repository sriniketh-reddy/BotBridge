import express from 'express';
import { getUser } from '../services/firestore.js';
import { firestore } from '../config/firebase.js';
import admin from '../config/firebase.js';

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

// Dev-only: list all users (documents in `users` collection)
router.get('/users', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
  try {
    console.debug('[debug] listing all users');
    const snapshot = await firestore.collection('users').get();
  const users = snapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }));
    return res.json({ count: users.length, users });
  } catch (err) {
    console.error('[debug] error listing users', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
});

export default router;

// Dev-only: expose firebase-admin initialization details and attempt a simple Firestore call
router.get('/info', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
  try {
    const options = (admin as any).app?.().options || (admin as any).apps?.[0]?.options || {};
    let projectId = options.projectId || process.env.GCLOUD_PROJECT || process.env.GCLOUD_PROJECT_ID || null;
    // try a trivial read to surface errors
    try {
      await firestore.collection('___health_check').limit(1).get();
    } catch (err) {
      console.error('[debug] firestore health check error', err);
      return res.status(500).json({ options, projectId, firestoreError: String(err) });
    }
    return res.json({ options, projectId, message: 'ok' });
  } catch (err) {
    console.error('[debug] info error', err);
    return res.status(500).json({ error: String(err) });
  }
});

