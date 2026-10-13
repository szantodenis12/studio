import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { FIRESTORE, STORAGE, TEST_PROJECT_ID } from './helpers/env';

let env: RulesTestEnvironment;
const root = path.resolve(__dirname, '..');

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: TEST_PROJECT_ID,
    firestore: { host: FIRESTORE.host, port: FIRESTORE.port, rules: readFileSync(path.join(root, 'firestore.rules'), 'utf8') },
    storage: { host: STORAGE.host, port: STORAGE.port, rules: readFileSync(path.join(root, 'storage.rules'), 'utf8') },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc('users/admin').set({ email: 'admin@test.local', role: 'admin' });
    await db.doc('users/alice').set({ email: 'alice@test.local', role: 'user' });
    await db.doc('rooms/double').set({ basePrice: 390, totalRooms: 6, active: true });
    await db.doc('availability/2030-01-01').set({ date: '2030-01-01', double: 1 });
    await db.doc('bookings/b1').set({ fullName: 'X', roomType: 'double', status: 'New' });
  });
});

describe('users: no privilege escalation', () => {
  it('a new user can create their own profile only as a plain user', async () => {
    const db = env.authenticatedContext('bob').firestore();
    await assertSucceeds(db.doc('users/bob').set({ email: 'bob@test.local', role: 'user' }));
    const db2 = env.authenticatedContext('carol').firestore();
    await assertSucceeds(db2.doc('users/carol').set({ email: 'carol@test.local' }));
  });

  it('denies creating a profile with role admin', async () => {
    const db = env.authenticatedContext('mallory').firestore();
    await assertFails(db.doc('users/mallory').set({ email: 'm@test.local', role: 'admin' }));
  });

  it('denies creating someone else\'s profile', async () => {
    const db = env.authenticatedContext('mallory').firestore();
    await assertFails(db.doc('users/someone').set({ role: 'user' }));
  });

  it('denies a user changing their own role', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(db.doc('users/alice').update({ role: 'admin' }));
    await assertSucceeds(db.doc('users/alice').update({ displayName: 'Alice' }));
  });

  it('denies a user adding a role to a role-less profile', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/dave').set({ email: 'dave@test.local' });
    });
    const db = env.authenticatedContext('dave').firestore();
    await assertFails(db.doc('users/dave').set({ email: 'dave@test.local', role: 'admin' }, { merge: true }));
  });

  it('lets an admin change roles', async () => {
    const db = env.authenticatedContext('admin').firestore();
    await assertSucceeds(db.doc('users/alice').update({ role: 'admin' }));
  });

  it('users cannot list or read other profiles', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(db.collection('users').get());
    await assertFails(db.doc('users/admin').get());
    await assertSucceeds(db.doc('users/alice').get());
  });
});

describe('availability', () => {
  it('is publicly readable', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(db.doc('availability/2030-01-01').get());
    await assertSucceeds(db.collection('availability').get());
  });

  it('denies public and non-admin writes', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(anon.doc('availability/2030-01-01').update({ double: 0 }));
    await assertFails(anon.doc('availability/2030-01-02').set({ double: 1 }));
    const alice = env.authenticatedContext('alice').firestore();
    await assertFails(alice.doc('availability/2030-01-01').update({ double: 99 }));
  });

  it('allows admin writes (manual blocks, cancellations)', async () => {
    const db = env.authenticatedContext('admin').firestore();
    await assertSucceeds(db.doc('availability/2030-01-01').set({ blocked: { double: 2 } }, { merge: true }));
  });
});

describe('bookings', () => {
  it('denies direct public creation (must go through the createBooking function)', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(anon.collection('bookings').add({ fullName: 'X', roomType: 'double' }));
    const alice = env.authenticatedContext('alice').firestore();
    await assertFails(alice.doc('bookings/new').set({ fullName: 'X' }));
  });

  it('denies public reads', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(anon.doc('bookings/b1').get());
    await assertFails(anon.collection('bookings').get());
  });

  it('allows admins full access', async () => {
    const db = env.authenticatedContext('admin').firestore();
    await assertSucceeds(db.doc('bookings/b1').get());
    await assertSucceeds(db.doc('bookings/b1').update({ status: 'Cancelled' }));
    await assertSucceeds(db.doc('bookings/b2').set({ fullName: 'Y' }));
    await assertSucceeds(db.doc('bookings/b2').delete());
  });
});

describe('rooms', () => {
  it('is publicly readable', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertSucceeds(anon.doc('rooms/double').get());
    await assertSucceeds(anon.collection('rooms').get());
  });

  it('is writable by admins only', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(anon.doc('rooms/double').update({ basePrice: 1 }));
    const alice = env.authenticatedContext('alice').firestore();
    await assertFails(alice.doc('rooms/double').update({ basePrice: 1 }));
    await assertFails(alice.doc('rooms/new').set({ basePrice: 1 }));
    const admin = env.authenticatedContext('admin').firestore();
    await assertSucceeds(admin.doc('rooms/double').update({ basePrice: 400 }));
    await assertSucceeds(admin.doc('rooms/new').set({ basePrice: 1 }));
  });
});

describe('menus (unchanged)', () => {
  it('public read, admin write', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertSucceeds(anon.doc('menus/main-menu').get());
    await assertFails(anon.doc('menus/main-menu').set({ pages: [] }));
    const admin = env.authenticatedContext('admin').firestore();
    await assertSucceeds(admin.doc('menus/main-menu').set({ pages: [] }));
  });
});

describe('storage: room photos', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  it('lets admins upload images under rooms/', async () => {
    const storage = env.authenticatedContext('admin').storage();
    await assertSucceeds(Promise.resolve(storage.ref('rooms/double/test.webp').put(png, { contentType: 'image/webp' })));
  });

  it('is publicly readable', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.storage().ref('rooms/double/public.webp').put(png, { contentType: 'image/webp' });
    });
    const storage = env.unauthenticatedContext().storage();
    await assertSucceeds(storage.ref('rooms/double/public.webp').getDownloadURL());
  });

  it('denies uploads by anonymous users and non-admins', async () => {
    await assertFails(Promise.resolve(env.unauthenticatedContext().storage().ref('rooms/double/x.webp').put(png, { contentType: 'image/webp' })));
    await assertFails(Promise.resolve(env.authenticatedContext('alice').storage().ref('rooms/double/x.webp').put(png, { contentType: 'image/webp' })));
  });

  it('denies non-images and files over 10 MB', async () => {
    const storage = env.authenticatedContext('admin').storage();
    await assertFails(Promise.resolve(storage.ref('rooms/double/evil.html').put(png, { contentType: 'text/html' })));
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    await assertFails(Promise.resolve(storage.ref('rooms/double/big.webp').put(big, { contentType: 'image/webp' })));
  });

  it('denies writes outside rooms/', async () => {
    const storage = env.authenticatedContext('admin').storage();
    await assertFails(Promise.resolve(storage.ref('other/file.webp').put(png, { contentType: 'image/webp' })));
  });

  it('only admins can delete', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.storage().ref('rooms/double/del.webp').put(png, { contentType: 'image/webp' });
    });
    await assertFails(env.authenticatedContext('alice').storage().ref('rooms/double/del.webp').delete());
    await assertSucceeds(env.authenticatedContext('admin').storage().ref('rooms/double/del.webp').delete());
  });
});
