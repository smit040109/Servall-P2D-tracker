
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if the config is valid. This prevents errors during build if env vars are missing.
let app;
if (firebaseConfig.projectId) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} else {
    console.warn("Firebase projectId is not set in environment variables. Firebase features will be disabled.");
    app = null;
}

const db = app ? getFirestore(app) : null;

export { db, app };
