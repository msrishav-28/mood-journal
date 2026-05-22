import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

// Check if configuration exists and is not a placeholder
export const isFirebaseConfigured = !!(
  API_KEY &&
  !API_KEY.startsWith('your-') &&
  !API_KEY.startsWith('placeholder') &&
  API_KEY !== ''
);

let firebaseApp = null;
let authInstance = null;
let dbInstance = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  try {
    firebaseApp = initializeApp(firebaseConfig);
    authInstance = getAuth(firebaseApp);
    dbInstance = getFirestore(firebaseApp);
    console.log('Firebase services initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.log('Firebase configuration not found or set to placeholder. Operating in local storage mode.');
}

export const auth = authInstance;
export const db = dbInstance;
export default { auth, db, isFirebaseConfigured };
