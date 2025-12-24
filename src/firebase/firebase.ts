import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Check if all required environment variables are present, regardless of environment (client/server)
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  if (typeof window !== 'undefined') {
    // On the client, a console warning is sufficient.
    console.warn("Missing Firebase configuration. Please check your .env.local file. Firebase features will be disabled.");
  } else {
    // On the server, we can also log a warning. The app won't crash.
    console.warn("SERVER-SIDE WARNING: Missing Firebase configuration. Firebase features will be disabled.");
  }
} else {
  // Initialize Firebase only if config is valid
  if (!getApps().length) {
      app = initializeApp(firebaseConfig);
  } else {
      app = getApps()[0];
  }

  if(app) {
    db = getFirestore(app);
    auth = getAuth(app);
  }
}


export { db, auth };
