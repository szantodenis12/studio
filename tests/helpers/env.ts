/**
 * Emulator endpoints for the test suite. `npm test` starts a SEPARATE emulator
 * instance (firebase.test.json, project demo-hotel-maxim-test, ports 1xxxx) so
 * tests never touch the dev emulators' demo data, let alone production.
 */
export const TEST_PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-hotel-maxim-test';

function hostPort(envVar: string, fallback: string) {
  const v = process.env[envVar] || fallback;
  const [host, port] = v.split(':');
  return { host, port: Number(port) };
}

export const FIRESTORE = hostPort('FIRESTORE_EMULATOR_HOST', '127.0.0.1:18080');
export const AUTH = hostPort('FIREBASE_AUTH_EMULATOR_HOST', '127.0.0.1:19099');
export const STORAGE = hostPort('FIREBASE_STORAGE_EMULATOR_HOST', '127.0.0.1:19199');
export const FUNCTIONS = { host: '127.0.0.1', port: 15001 };

if (!TEST_PROJECT_ID.startsWith('demo-')) {
  throw new Error(`Tests must run against a demo-* emulator project, got "${TEST_PROJECT_ID}".`);
}
