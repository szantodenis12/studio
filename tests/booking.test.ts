import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { addDaysIso, todayIso } from '@/lib/rooms/pricing';
import { deleteBooking, setBookingStatus, setBlockedRooms, SoldOutError, recalculateAvailability } from '@/services/booking-service';
import { AUTH, FIRESTORE, FUNCTIONS, TEST_PROJECT_ID } from './helpers/env';

/**
 * End-to-end tests of booking creation (the real `createBooking` Cloud
 * Function running in the Functions emulator) and of the admin booking
 * management service (client SDK, real security rules).
 */

let env: RulesTestEnvironment;
let publicApp: FirebaseApp;
let adminApp: FirebaseApp;
let userApp: FirebaseApp;
let adminDb: Firestore;

const root = path.resolve(__dirname, '..');
const BASE = addDaysIso(todayIso(), 40);
const d = (offset: number) => addDaysIso(BASE, offset);

let seq = 0;
const rid = () => `test-${Date.now()}-${++seq}-${Math.random().toString(36).slice(2, 10)}`;

function makeApp(name: string) {
  const app = initializeApp({ projectId: TEST_PROJECT_ID, apiKey: 'fake-api-key', authDomain: 'localhost' }, name);
  connectAuthEmulator(getAuth(app), `http://${AUTH.host}:${AUTH.port}`, { disableWarnings: true });
  connectFirestoreEmulator(getFirestore(app), FIRESTORE.host, FIRESTORE.port);
  connectFunctionsEmulator(getFunctions(app, 'us-central1'), FUNCTIONS.host, FUNCTIONS.port);
  return app;
}

function callCreate(app: FirebaseApp, data: Record<string, unknown>) {
  return httpsCallable(getFunctions(app, 'us-central1'), 'createBooking')(data).then((r) => r.data as {
    bookingId: string;
    totalPrice: number;
    nights: number;
    status: string;
    duplicate: boolean;
  });
}

function booking(overrides: Record<string, unknown> = {}) {
  return {
    requestId: rid(),
    roomType: 'double',
    checkIn: d(0),
    checkOut: d(2),
    guests: '2',
    fullName: 'Ion Popescu',
    email: 'ion@example.com',
    phone: '0712 345 678',
    ...overrides,
  };
}

async function reason(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as { details?: { reason?: string } }).details?.reason || (e as Error).message;
  }
  return 'NO_ERROR';
}

async function readDoc(p: string) {
  let data: Record<string, unknown> | undefined;
  await env.withSecurityRulesDisabled(async (ctx) => {
    const snap = await ctx.firestore().doc(p).get();
    data = snap.exists ? (snap.data() as Record<string, unknown>) : undefined;
  });
  return data;
}

async function countBookings() {
  let n = 0;
  await env.withSecurityRulesDisabled(async (ctx) => {
    n = (await ctx.firestore().collection('bookings').get()).size;
  });
  return n;
}

const booked = async (date: string, type: string) => Number((await readDoc(`availability/${date}`))?.[type] ?? 0);

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: TEST_PROJECT_ID,
    firestore: { host: FIRESTORE.host, port: FIRESTORE.port, rules: readFileSync(path.join(root, 'firestore.rules'), 'utf8') },
  });
  publicApp = makeApp('public');
  adminApp = makeApp('admin');
  userApp = makeApp('user');

  const adminAuth = getAuth(adminApp);
  const adminCred = await createUserWithEmailAndPassword(adminAuth, `admin-${Date.now()}@test.local`, 'test1234')
    .catch(() => signInWithEmailAndPassword(adminAuth, 'admin@test.local', 'test1234'));
  const userCred = await createUserWithEmailAndPassword(getAuth(userApp), `user-${Date.now()}@test.local`, 'test1234');
  adminDb = getFirestore(adminApp);

  (globalThis as { __uids?: string[] }).__uids = [adminCred.user.uid, userCred.user.uid];
});

afterAll(async () => {
  await Promise.all([publicApp, adminApp, userApp].filter(Boolean).map((a) => deleteApp(a)));
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  const [adminUid, userUid] = (globalThis as { __uids?: string[] }).__uids!;
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc(`users/${adminUid}`).set({ role: 'admin' });
    await db.doc(`users/${userUid}`).set({ role: 'user' });
    await db.doc('rooms/double').set({
      active: true,
      totalRooms: 2,
      maxGuests: 2,
      basePrice: 390,
      priceOverrides: [{ id: 'o1', startDate: d(1), endDate: d(1), price: 500, createdAt: 1 }],
    });
    await db.doc('rooms/apartment').set({ active: true, totalRooms: 1, maxGuests: 2, basePrice: 500, priceOverrides: [] });
    await db.doc('rooms/double-balcony').set({ active: false, totalRooms: 8, maxGuests: 2, basePrice: 0, priceOverrides: [] });
  });
});

describe('createBooking (Cloud Function)', () => {
  it('creates a booking priced per night on the server and reserves availability', async () => {
    const res = await callCreate(publicApp, booking({ totalPrice: 1, status: 'Confirmed' }));
    expect(res.duplicate).toBe(false);
    expect(res.status).toBe('New');
    expect(res.totalPrice).toBe(390 + 500); // night d(1) has an override; client price ignored
    const doc = await readDoc(`bookings/${res.bookingId}`);
    expect(doc?.status).toBe('New');
    expect(doc?.checkInDate).toBe(d(0));
    expect(doc?.paymentMethod).toBe('property');
    expect(doc?.availabilityReserved).toBe(true);
    expect(await booked(d(0), 'double')).toBe(1);
    expect(await booked(d(1), 'double')).toBe(1);
    expect(await booked(d(2), 'double')).toBe(0); // check-out day is not a night
  });

  it('validates input', async () => {
    expect(await reason(callCreate(publicApp, booking({ checkOut: d(0) })))).toBe('INVALID_DATES');
    expect(await reason(callCreate(publicApp, booking({ checkIn: addDaysIso(todayIso(), -2), checkOut: todayIso() })))).toBe('DATE_IN_PAST');
    expect(await reason(callCreate(publicApp, booking({ checkOut: d(90) })))).toBe('STAY_TOO_LONG');
    expect(await reason(callCreate(publicApp, booking({ roomType: 'nope' })))).toBe('ROOM_NOT_FOUND');
    expect(await reason(callCreate(publicApp, booking({ roomType: 'double-balcony' })))).toBe('ROOM_INACTIVE');
    expect(await reason(callCreate(publicApp, booking({ guests: '3' })))).toBe('TOO_MANY_GUESTS');
    expect(await reason(callCreate(publicApp, booking({ email: 'not-an-email' })))).toBe('INVALID_INPUT');
    expect(await reason(callCreate(publicApp, booking({ requestId: 'short' })))).toBe('INVALID_INPUT');
    expect(await countBookings()).toBe(0);
  });

  it('enforces the inventory cap (booked + blocked + 1 <= totalRooms)', async () => {
    await callCreate(publicApp, booking());
    await callCreate(publicApp, booking());
    const third = await reason(callCreate(publicApp, booking()));
    expect(third).toBe('SOLD_OUT');
    expect(await countBookings()).toBe(2);
    expect(await booked(d(0), 'double')).toBe(2);
    // A stay that only touches the check-out day of the full nights is fine.
    await callCreate(publicApp, booking({ checkIn: d(2), checkOut: d(3) }));
  });

  it('counts manually blocked rooms', async () => {
    await setBlockedRooms(adminDb, d(5), 'double', 1);
    await callCreate(publicApp, booking({ checkIn: d(5), checkOut: d(6) }));
    expect(await reason(callCreate(publicApp, booking({ checkIn: d(4), checkOut: d(6) })))).toBe('SOLD_OUT');
    // Can't block more rooms than are free.
    await expect(setBlockedRooms(adminDb, d(5), 'double', 2)).rejects.toThrow(/cel mult 1/);
  });

  it('is idempotent per requestId (retries / double clicks)', async () => {
    const input = booking();
    const first = await callCreate(publicApp, input);
    const second = await callCreate(publicApp, input);
    expect(second.duplicate).toBe(true);
    expect(second.bookingId).toBe(first.bookingId);
    const parallel = await Promise.all([callCreate(publicApp, input), callCreate(publicApp, input)]);
    expect(parallel.every((r) => r.bookingId === first.bookingId)).toBe(true);
    expect(await countBookings()).toBe(1);
    expect(await booked(d(0), 'double')).toBe(1);
  });

  it('parallel double submit with the same requestId creates one booking', async () => {
    const input = booking({ roomType: 'apartment' });
    const results = await Promise.allSettled([1, 2, 3, 4].map(() => callCreate(publicApp, input)));
    const ok = results.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<{ duplicate: boolean }>[];
    expect(ok.length).toBe(4);
    expect(ok.filter((r) => !r.value.duplicate).length).toBe(1);
    expect(await countBookings()).toBe(1);
    expect(await booked(d(0), 'apartment')).toBe(1);
  });

  it('concurrent bookings for the last room: exactly one succeeds', async () => {
    const results = await Promise.allSettled(
      [1, 2, 3, 4, 5].map(() => callCreate(publicApp, booking({ roomType: 'apartment' }))),
    );
    const ok = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    expect(ok.length).toBe(1);
    expect(failed.every((r) => (r.reason as { details?: { reason?: string } }).details?.reason === 'SOLD_OUT')).toBe(true);
    expect(await countBookings()).toBe(1);
    expect(await booked(d(0), 'apartment')).toBe(1);
    expect(await booked(d(1), 'apartment')).toBe(1);
  });

  it('admin path requires an admin', async () => {
    const adminInput = booking({ admin: { status: 'Confirmed' } });
    expect(await reason(callCreate(publicApp, adminInput))).toBe('NOT_ADMIN');
    expect(await reason(callCreate(userApp, booking({ admin: { status: 'Confirmed' } })))).toBe('NOT_ADMIN');
    expect(await countBookings()).toBe(0);
  });

  it('admin path: confirmed status, price override, source/notes, still inventory-checked', async () => {
    const res = await callCreate(adminApp, booking({
      email: '',
      phone: '',
      admin: { status: 'Confirmed', totalPrice: 777, paymentMethod: 'Booking.com', notes: 'BDC-123' },
    }));
    expect(res.status).toBe('Confirmed');
    const doc = await readDoc(`bookings/${res.bookingId}`);
    expect(doc?.totalPrice).toBe(777);
    expect(doc?.calculatedPrice).toBe(890);
    expect(doc?.paymentMethod).toBe('Booking.com');
    expect(doc?.notes).toBe('BDC-123');
    expect(doc?.source).toBe('admin');
    await callCreate(adminApp, booking({ admin: {} }));
    expect(await reason(callCreate(adminApp, booking({ admin: {} })))).toBe('SOLD_OUT');
  });
});

describe('admin booking management (client service + rules)', () => {
  it('cancel frees availability; un-cancel re-reserves', async () => {
    const { bookingId } = await callCreate(publicApp, booking());
    expect(await booked(d(0), 'double')).toBe(1);

    await setBookingStatus(adminDb, bookingId, 'Cancelled');
    expect(await booked(d(0), 'double')).toBe(0);
    expect(await booked(d(1), 'double')).toBe(0);
    expect((await readDoc(`bookings/${bookingId}`))?.availabilityReserved).toBe(false);

    // Cancelling twice must not decrement again.
    await setBookingStatus(adminDb, bookingId, 'Cancelled');
    expect(await booked(d(0), 'double')).toBe(0);

    await setBookingStatus(adminDb, bookingId, 'Confirmed');
    expect(await booked(d(0), 'double')).toBe(1);
    expect(await booked(d(1), 'double')).toBe(1);

    // Status changes between active states don't touch availability.
    await setBookingStatus(adminDb, bookingId, 'Email Sent');
    expect(await booked(d(0), 'double')).toBe(1);
  });

  it('un-cancel fails with SoldOutError when the room type filled up meanwhile', async () => {
    const { bookingId } = await callCreate(publicApp, booking());
    await setBookingStatus(adminDb, bookingId, 'Cancelled');
    await callCreate(publicApp, booking());
    await callCreate(publicApp, booking());
    await expect(setBookingStatus(adminDb, bookingId, 'New')).rejects.toBeInstanceOf(SoldOutError);
    expect((await readDoc(`bookings/${bookingId}`))?.status).toBe('Cancelled');
    expect(await booked(d(0), 'double')).toBe(2);
  });

  it('delete frees a reserved booking', async () => {
    const { bookingId } = await callCreate(publicApp, booking());
    await deleteBooking(adminDb, bookingId);
    expect(await readDoc(`bookings/${bookingId}`)).toBeUndefined();
    expect(await booked(d(0), 'double')).toBe(0);
  });

  it('delete after cancel does not double-decrement', async () => {
    const a = await callCreate(publicApp, booking());
    await callCreate(publicApp, booking());
    expect(await booked(d(0), 'double')).toBe(2);
    await setBookingStatus(adminDb, a.bookingId, 'Cancelled');
    expect(await booked(d(0), 'double')).toBe(1);
    await deleteBooking(adminDb, a.bookingId);
    expect(await booked(d(0), 'double')).toBe(1);
  });

  it('handles legacy bookings (no availabilityReserved flag) and recalculation', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      // Old site: a cancelled booking that never released its room, plus a live one.
      await db.doc('bookings/legacy-cancelled').set({
        roomType: 'double', status: 'Cancelled', fullName: 'Old', checkInDate: d(10), checkOutDate: d(11),
      });
      await db.doc('bookings/legacy-live').set({
        roomType: 'double', status: 'New', fullName: 'Old 2', checkInDate: d(10), checkOutDate: d(11),
      });
      await db.doc(`availability/${d(10)}`).set({ date: d(10), double: 2, blocked: { double: 0 } });
    });
    await recalculateAvailability(adminDb);
    expect(await booked(d(10), 'double')).toBe(1);
    // Deleting the legacy cancelled booking must not decrement.
    await deleteBooking(adminDb, 'legacy-cancelled');
    expect(await booked(d(10), 'double')).toBe(1);
  });

  it('non-admins cannot use the management service', async () => {
    const { bookingId } = await callCreate(publicApp, booking());
    await expect(setBookingStatus(getFirestore(userApp), bookingId, 'Cancelled')).rejects.toThrow();
    await expect(setBookingStatus(getFirestore(publicApp), bookingId, 'Cancelled')).rejects.toThrow();
    expect(await booked(d(0), 'double')).toBe(1);
  });
});

describe('confirmation email trigger', () => {
  async function waitFor<T>(fn: () => Promise<T>, ok: (v: T) => boolean, ms = 15000): Promise<T> {
    const start = Date.now();
    let v = await fn();
    while (!ok(v) && Date.now() - start < ms) {
      await new Promise((r) => setTimeout(r, 300));
      v = await fn();
    }
    return v;
  }

  it('marks emailSent once and never re-sends on later status flips', async () => {
    const { bookingId } = await callCreate(publicApp, booking());
    await setBookingStatus(adminDb, bookingId, 'Confirmed');
    const first = await waitFor(() => readDoc(`bookings/${bookingId}`), (b) => b?.emailSent === true);
    expect(first?.emailSent).toBe(true);
    const sentAt = JSON.stringify(first?.emailSentAt);

    await setBookingStatus(adminDb, bookingId, 'New');
    await setBookingStatus(adminDb, bookingId, 'Confirmed');
    await new Promise((r) => setTimeout(r, 3000));
    const after = await readDoc(`bookings/${bookingId}`);
    expect(JSON.stringify(after?.emailSentAt)).toBe(sentAt);
  });
});
