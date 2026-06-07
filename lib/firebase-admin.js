import admin from 'firebase-admin';

if (!admin.apps.length) {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e);
    }
  } else {
    try {
      const fs = require('fs');
      const path = require('path');
      const keyPath = path.join(process.cwd(), 'FirebaseKey.json');
      if (fs.existsSync(keyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      }
    } catch (e) {
      console.error("Failed to read FirebaseKey.json:", e);
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.warn("Firebase Admin SDK: No service account configuration found.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;

export { db, adminAuth, admin };
