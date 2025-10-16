import admin from 'firebase-admin';
import fs from 'fs';
import type adminType from 'firebase-admin';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!admin.apps.length) {
  if (serviceAccountJson) {
    const obj = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(obj),
    });
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const obj = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(obj),
    });
  } else {
    // Try application default credentials
    admin.initializeApp();
  }
}

export const auth: any = admin.auth();
export const firestore: any = admin.firestore();
export default admin;
