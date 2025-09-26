
// src/lib/firebase-admin.ts
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if the app is already initialized to prevent errors
if (!getApps().length) {
  // When deployed to Firebase App Hosting, process.env will have the secrets.
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key needs to have its newlines correctly formatted.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // This will use the default credentials if secrets are not set.
    // This path is likely to fail in the current situation, but is kept as a fallback.
    console.warn("Explicit authentication not configured, attempting with default App credentials.");
    initializeApp();
  }
}

const dbAdmin = getFirestore(getApp());

export { dbAdmin };
