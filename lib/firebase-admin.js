import admin from 'firebase-admin';

if (!admin.apps.length) {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      serviceAccount = JSON.parse(rawJson);
    } catch (e) {
      try {
        const cleanedJson = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');
        serviceAccount = JSON.parse(cleanedJson);
      } catch (err) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", err);
      }
    }
  } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'brightshop-114b5',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
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
