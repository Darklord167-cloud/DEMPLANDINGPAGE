import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDdHDPEdckojhM3Gofs037...",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "planning-with-ai-d47b7.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "planning-with-ai-d47b7",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "planning-with-ai-d47b7.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "425364199573",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:425364199573:web:0dd57ff7810c8eefa2a39c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PRY136D98X",
};

// Initialize Firebase App safely (preventing re-initialization during Next.js HMR/SSR)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Safely initialize Analytics with window/browser safety checks for Next.js SSR compatibility
export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("[Firebase Analytics] Initialization skipped or unsupported:", err);
    });
}

// Export Auth & Firestore instances for component utilization
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
