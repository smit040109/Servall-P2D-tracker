
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


let app: FirebaseApp;

// This guard prevents errors during the build process
// and in environments where config is not yet provided.
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} else {
  console.warn("Firebase config is missing. Firebase features will be disabled.");
  // Use a dummy app to avoid crashes
  app = getApps().length ? getApp() : initializeApp({ projectId: "demo-project" });
}


// Functions to get services on demand
export const getDb = () => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
    return getFirestore(app);
}

export const getAuthInstance = () => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
    return getAuth(app);
}

export { app };
