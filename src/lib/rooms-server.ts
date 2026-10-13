import 'server-only';
import { firebaseConfig } from '@/firebase/config';
import { decodeFields, docId, firestoreRestTarget, restUrl, type RestDocument } from '@/lib/rooms/firestore-rest';
import { normalizeRoom, toSiteRooms } from '@/lib/rooms/normalize';
import { STATIC_ROOMS } from '@/lib/rooms/static-rooms';
import type { RoomDoc, SiteRoom } from '@/lib/rooms/types';
import { todayIso } from '@/lib/rooms/pricing';

/**
 * Server-side reader for the public `rooms` collection (Firestore REST API,
 * public-read rules -- no service account needed).
 *
 * Falls back to the hardcoded catalogue (room-data.ts) if Firestore is empty
 * or unreachable, so builds and pages never fail because of Firestore.
 */

/** Cache tag revalidated by POST /api/revalidate after admin edits. */
export const ROOMS_CACHE_TAG = 'rooms';
/** Seconds between background refreshes when nobody triggers a revalidation. */
export const ROOMS_REVALIDATE_SECONDS = 3600;

function emulatorHost(): string | null {
  if (process.env.FIRESTORE_EMULATOR_HOST) return process.env.FIRESTORE_EMULATOR_HOST;
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    return '127.0.0.1:8080';
  }
  return null;
}

export interface RoomsResult {
  rooms: RoomDoc[];
  source: 'firestore' | 'static';
}

/** All room docs (active and inactive). */
export async function fetchAllRooms(): Promise<RoomsResult> {
  const host = emulatorHost();
  const target = firestoreRestTarget({
    projectId: firebaseConfig.projectId,
    apiKey: firebaseConfig.apiKey,
    emulatorHost: host,
  });
  try {
    const res = await fetch(restUrl(target, 'rooms', { pageSize: '100' }), {
      // In dev always read fresh data; in production cache with the 'rooms'
      // tag so admin saves can revalidate it on demand (POST /api/revalidate).
      ...(process.env.NODE_ENV !== 'production'
        ? { cache: 'no-store' as const }
        : { next: { revalidate: ROOMS_REVALIDATE_SECONDS, tags: [ROOMS_CACHE_TAG] } }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Firestore REST ${res.status}`);
    const json = (await res.json()) as { documents?: RestDocument[] };
    const docs = json.documents || [];
    if (!docs.length) return { rooms: STATIC_ROOMS, source: 'static' };
    return {
      rooms: docs.map((d) => normalizeRoom(docId(d), decodeFields(d.fields))),
      source: 'firestore',
    };
  } catch (err) {
    console.warn('[rooms] Firestore unavailable, using static room data:', (err as Error).message);
    return { rooms: STATIC_ROOMS, source: 'static' };
  }
}

/** Active rooms, in display order, with today's (Europe/Bucharest) nightly price. */
export async function getSiteRooms(): Promise<SiteRoom[]> {
  const { rooms } = await fetchAllRooms();
  const site = toSiteRooms(rooms, todayIso());
  // Never render an empty catalogue because of a misconfiguration.
  return site.length ? site : toSiteRooms(STATIC_ROOMS, todayIso());
}

/** Latest admin edit across rooms (for sitemap lastModified), or null. */
export async function getRoomsLastModified(): Promise<Date | null> {
  const { rooms, source } = await fetchAllRooms();
  if (source !== 'firestore') return null;
  const latest = Math.max(0, ...rooms.map((r) => r.updatedAt || 0));
  return latest > 0 ? new Date(latest) : null;
}
