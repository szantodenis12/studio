import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createRemoteJWKSet, decodeJwt, jwtVerify, type JWTPayload } from 'jose';
import { firebaseConfig } from '@/firebase/config';
import { decodeFields, firestoreRestTarget, restUrl, type RestDocument } from '@/lib/rooms/firestore-rest';
import { ROOMS_CACHE_TAG } from '@/lib/rooms-server';

/**
 * POST /api/revalidate  (Authorization: Bearer <Firebase ID token>)
 *
 * Called by the admin after saving rooms: re-renders the ISR pages that show
 * room data. The caller must be signed in AND have users/{uid}.role == 'admin'
 * (read through the Firestore REST API with the caller's own ID token, which
 * the security rules allow for a user's own profile). No service account.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PATHS = ['/', '/camere', '/tarife', '/rezervare', '/sitemap.xml'];

const projectId = firebaseConfig.projectId;

// Emulator mode: local development only (never set on Vercel).
const authEmulatorHost =
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||
  (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
    ? '127.0.0.1:9099'
    : null);
const firestoreEmulatorHost =
  process.env.FIRESTORE_EMULATOR_HOST ||
  (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
    ? '127.0.0.1:8080'
    : null);

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

async function verifyIdToken(token: string): Promise<JWTPayload> {
  if (authEmulatorHost) {
    // The Auth emulator issues unsigned tokens; check the claims only.
    const payload = decodeJwt(token);
    if (payload.aud !== projectId) throw new Error('wrong audience');
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) throw new Error('expired');
    return payload;
  }
  const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  return payload;
}

async function isAdmin(uid: string, token: string): Promise<boolean> {
  const target = firestoreRestTarget({ projectId, apiKey: firebaseConfig.apiKey, emulatorHost: firestoreEmulatorHost });
  const res = await fetch(restUrl(target, `users/${encodeURIComponent(uid)}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const doc = (await res.json()) as RestDocument;
  return decodeFields(doc.fields).role === 'admin';
}

// Simple in-memory rate limit (per server instance): enough to stop a buggy
// client from hammering revalidation; real auth is the admin check above.
const WINDOW_MS = 60_000;
const MAX_PER_USER = 20;
const MAX_GLOBAL = 120;
const hits = new Map<string, number[]>();

function rateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export async function POST(req: NextRequest) {
  if (rateLimited('*', MAX_GLOBAL)) {
    return NextResponse.json({ error: 'Prea multe cereri. Încercați din nou peste un minut.' }, { status: 429 });
  }

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return NextResponse.json({ error: 'Lipsește autentificarea.' }, { status: 401 });

  let uid: string;
  try {
    const payload = await verifyIdToken(token);
    uid = String(payload.user_id || payload.sub || '');
    if (!uid) throw new Error('no uid');
  } catch {
    return NextResponse.json({ error: 'Sesiune invalidă. Autentificați-vă din nou.' }, { status: 401 });
  }

  if (rateLimited(uid, MAX_PER_USER)) {
    return NextResponse.json({ error: 'Prea multe actualizări. Încercați din nou peste un minut.' }, { status: 429 });
  }

  if (!(await isAdmin(uid, token).catch(() => false))) {
    return NextResponse.json({ error: 'Doar administratorii pot actualiza site-ul.' }, { status: 403 });
  }

  revalidateTag(ROOMS_CACHE_TAG);
  for (const p of PATHS) revalidatePath(p);

  return NextResponse.json({ revalidated: true, paths: PATHS, at: new Date().toISOString() });
}
