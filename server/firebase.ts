import admin from 'firebase-admin';
import {
  FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
} from './config';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      clientEmail: FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      privateKey: FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
    }),
  });
}

export { admin };
