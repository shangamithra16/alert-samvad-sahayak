import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ""
};

// Check if Firebase config is properly set
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value.trim() !== "");

let app: any = null;
let database: any = null;

if (isFirebaseConfigured) {
  // Initialize Firebase only if properly configured
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} else {
  console.warn('Firebase configuration is incomplete. Please set your Firebase environment variables.');
}

// Initialize Realtime Database and get a reference to the service
export { database };
export default app;