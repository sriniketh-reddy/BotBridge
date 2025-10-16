import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// These values should be provided via Vite env (VITE_FIREBASE_...)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate config early and provide clear error when missing
const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missing = required.filter((k) => !(firebaseConfig as any)[k]);
if (missing.length > 0) {
  const msg = `Firebase configuration missing for: ${missing.join(', ')}.\nPlease set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_APP_ID in frontend/.env (copy frontend/.env.example) and restart the dev server.`;
  // Log and throw so the error is visible during development
  // eslint-disable-next-line no-console
  console.error(msg);
  throw new Error(msg);
}

// Debug: print which config keys are present (do not print actual secrets)
// eslint-disable-next-line no-console
console.debug('Firebase config presence:', {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  appId: !!firebaseConfig.appId,
});

// If you still see `auth/configuration-not-found`, ensure you restarted Vite after editing `frontend/.env`.

const app = initializeApp(firebaseConfig as any);
export const auth = getAuth(app);
export default app;
