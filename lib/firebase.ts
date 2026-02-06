import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";

// Project 1 Config (Athlos 2026)
const firebaseConfig1 = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_1_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_1_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_1_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_1_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_1_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_1_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_1_MEASUREMENT_ID,
};

// Project 2 Config (Certificate Provider)
const firebaseConfig2 = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_2_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_2_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_2_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_2_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_2_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_2_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_2_MEASUREMENT_ID,
};

// Initialize or get apps
const app1 = !getApps().find(a => a.name === 'app1')
  ? initializeApp(firebaseConfig1, 'app1')
  : getApp('app1');

const app2 = !getApps().find(a => a.name === 'app2')
  ? initializeApp(firebaseConfig2, 'app2')
  : getApp('app2');

// Export instances for Project 1
export const db1 = getFirestore(app1);
export const storage1 = getStorage(app1);
export const auth1 = getAuth(app1);

// Export instances for Project 2
export const db2 = getFirestore(app2);
export const storage2 = getStorage(app2);
export const auth2 = getAuth(app2);

// Default exports (pointing to Project 1 - Athlos 2026 as primary)
export const db = db1;
export const storage = storage1;
export const auth = auth1;
export { app1, app2 };