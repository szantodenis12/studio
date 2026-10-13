const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1697076383-30dac";

export const firebaseConfig = {
  projectId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:281219916638:web:2eb3addf71c016699925cf",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCzUhQ9Y82eMFQzL-0sbGmPuCz9kdhpf44",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-1697076383-30dac.firebaseapp.com",
  // Default bucket name for projects created after Oct 2024 is
  // `<projectId>.firebasestorage.app` (older ones use `<projectId>.appspot.com`).
  // Override with NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET if the console shows otherwise.
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  measurementId: "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "281219916638",
};

/** Region of the Cloud Functions (same as the existing onBookingStatusChange). */
export const FUNCTIONS_REGION = "us-central1";

/**
 * Local development only: when NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true (set in
 * the gitignored .env.local) AND we're not in a production build, every
 * Firebase SDK talks to the local Emulator Suite instead of the real project.
 * The NODE_ENV guard means a stray .env.local can never point a production
 * build (`next build`) at the emulators.
 */
export const USE_FIREBASE_EMULATOR =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

export const EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1";
export const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
  functions: 5001,
  storage: 9199,
} as const;
