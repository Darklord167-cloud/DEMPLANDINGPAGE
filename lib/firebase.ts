import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD2z_kF79pdCkH8cGyklcmTUv3rlrxeFbA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0060762028.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gen-lang-client-0060762028",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0060762028.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "917177620530",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:917177620530:web:7f280ceb32bab77ae3c42b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
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

import appletConfig from "@/firebase-applet-config.json";

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore with specific database ID if provided in config or env
const firestoreDbId = 
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || 
  (appletConfig && appletConfig.firestoreDatabaseId) || 
  undefined;

export const db: Firestore = 
  firestoreDbId && firestoreDbId !== "(default)" 
    ? getFirestore(app, firestoreDbId) 
    : getFirestore(app);

