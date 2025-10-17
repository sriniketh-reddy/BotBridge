import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Load env early in this module in case it's imported before server.ts
dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

console.debug('[firebase] FIREBASE_SERVICE_ACCOUNT_PATH (raw):', serviceAccountPath);

if (!admin.apps.length) {
  try {
    if (serviceAccountJson) {
      console.debug('[firebase] initializing admin with FIREBASE_SERVICE_ACCOUNT_JSON');
      const obj = JSON.parse(serviceAccountJson);
      if (obj && obj.project_id) {
        console.debug('[firebase] service account project_id', obj.project_id);
        // ensure environment var for google client libraries
        process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || obj.project_id;
      }
      admin.initializeApp({
        credential: admin.credential.cert(obj),
        projectId: obj?.project_id,
      });
    } else if (serviceAccountPath) {
      // resolve relative paths against process.cwd() to avoid surprises if the app is started from project root
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.resolve(process.cwd(), serviceAccountPath);
      console.debug('[firebase] checking service account path', resolvedPath);
      if (fs.existsSync(resolvedPath)) {
        console.debug('[firebase] initializing admin with FIREBASE_SERVICE_ACCOUNT_PATH', resolvedPath);
        const obj = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
        if (obj && obj.project_id) {
          console.debug('[firebase] service account project_id', obj.project_id);
          process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || obj.project_id;
        }
        admin.initializeApp({
          credential: admin.credential.cert(obj),
          projectId: obj?.project_id,
        });
      } else {
        // Fail fast: don't fall back to ADC silently, it can point to wrong project when running locally
        const msg = `[firebase] FIREBASE_SERVICE_ACCOUNT_PATH set but file does not exist at ${resolvedPath}`;
        console.error(msg);
        throw new Error(msg);
      }
    } else {
      const msg = '[firebase] no service account provided in env; please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in backend/.env';
      console.error(msg);
      throw new Error(msg);
    }
  } catch (err) {
    console.error('[firebase] error initializing admin SDK', err);
    // Re-throw so startup fails fast and the error is visible
    throw err;
  }
}

export const auth: any = admin.auth();
export const firestore: any = admin.firestore();
export default admin;
