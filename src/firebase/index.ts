'use client';

import { firebaseConfig, USE_FIREBASE_EMULATOR, EMULATOR_HOST, EMULATOR_PORTS, FUNCTIONS_REGION } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

// Emulator connections must happen exactly once per SDK instance, before first use.
const connectedToEmulator = new WeakSet<object>();

function maybeConnectAuth(auth: Auth) {
  if (!USE_FIREBASE_EMULATOR || connectedToEmulator.has(auth)) return;
  connectedToEmulator.add(auth);
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, { disableWarnings: true });
}

function maybeConnectFirestore(firestore: Firestore) {
  if (!USE_FIREBASE_EMULATOR || connectedToEmulator.has(firestore)) return;
  connectedToEmulator.add(firestore);
  connectFirestoreEmulator(firestore, EMULATOR_HOST, EMULATOR_PORTS.firestore);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  maybeConnectAuth(auth);
  maybeConnectFirestore(firestore);
  return {
    firebaseApp,
    auth,
    firestore,
  };
}

/**
 * Lazily loads Firebase Storage (only the admin rooms editor needs it), wired
 * to the emulator in local dev.
 */
export async function getStorageSdk(firebaseApp: FirebaseApp) {
  const { getStorage, connectStorageEmulator } = await import('firebase/storage');
  const storage = getStorage(firebaseApp);
  if (USE_FIREBASE_EMULATOR && !connectedToEmulator.has(storage)) {
    connectedToEmulator.add(storage);
    connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
  }
  return storage;
}

/**
 * Lazily loads Cloud Functions (booking creation), wired to the emulator in
 * local dev.
 */
export async function getFunctionsSdk(firebaseApp: FirebaseApp) {
  const { getFunctions, connectFunctionsEmulator } = await import('firebase/functions');
  const functions = getFunctions(firebaseApp, FUNCTIONS_REGION);
  if (USE_FIREBASE_EMULATOR && !connectedToEmulator.has(functions)) {
    connectedToEmulator.add(functions);
    connectFunctionsEmulator(functions, EMULATOR_HOST, EMULATOR_PORTS.functions);
  }
  return functions;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
