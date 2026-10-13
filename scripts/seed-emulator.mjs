// Seeds the LOCAL Firebase Emulator Suite with a demo admin account.
//
//   npm run emulators:seed
//
// Safety: this script only ever talks to the emulators on 127.0.0.1 and
// refuses to run for a project id that doesn't start with "demo-", so it can
// never touch a real Firebase project.
//
// Creates (idempotently):
//   Auth:      admin@test.local / test1234
//   Firestore: users/{uid} = { email, displayName, role: 'admin' }

const PROJECT_ID = process.env.SEED_PROJECT_ID || 'demo-hotel-maxim';
const HOST = '127.0.0.1';
const AUTH = `http://${HOST}:9099`;
const FIRESTORE = `http://${HOST}:8080`;

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@test.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'test1234';

if (!PROJECT_ID.startsWith('demo-')) {
  console.error(`Refusing to seed project "${PROJECT_ID}": only demo-* emulator projects are allowed.`);
  process.exit(1);
}

async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Emulator not reachable: ${url}`);
}

async function ensureUser(email, password) {
  const base = `${AUTH}/identitytoolkit.googleapis.com/v1`;
  const signUp = await post(`${base}/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true });
  if (signUp.ok) return signUp.json.localId;
  const signIn = await post(`${base}/accounts:signInWithPassword?key=fake-api-key`, { email, password, returnSecureToken: true });
  if (signIn.ok) return signIn.json.localId;
  throw new Error(`Could not create or sign in ${email}: ${JSON.stringify(signUp.json)}`);
}

async function setUserDoc(uid, email, role) {
  const url = `${FIRESTORE}/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const res = await fetch(url, {
    method: 'PATCH',
    // "Bearer owner" = emulator admin access (bypasses security rules).
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({
      fields: {
        email: { stringValue: email },
        displayName: { stringValue: email },
        role: { stringValue: role },
      },
    }),
  });
  if (!res.ok) throw new Error(`Firestore write failed (${res.status}): ${await res.text()}`);
}

await waitFor(`${AUTH}/`);
await waitFor(`${FIRESTORE}/`);
const uid = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD);
await setUserDoc(uid, ADMIN_EMAIL, 'admin');
console.log(`Seeded emulator admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (uid ${uid}, project ${PROJECT_ID})`);
