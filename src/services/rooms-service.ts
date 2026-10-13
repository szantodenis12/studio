'use client';

import { collection, doc, Firestore, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { User } from 'firebase/auth';
import { getStorageSdk } from '@/firebase';
import { buildStaticRooms } from '@/lib/rooms/static-rooms';
import type { RoomDoc, RoomImage } from '@/lib/rooms/types';

/**
 * Admin-side writes for rooms/{type} (admin-only via firestore.rules) and room
 * photos in Firebase Storage under rooms/{type}/ (admin-only via storage.rules).
 */

/** Firestore data for a room (doc id = room type). */
function toFirestore(room: RoomDoc) {
  // `type` is the doc id; updatedAt is set by the server.
  const rest: Partial<RoomDoc> = { ...room };
  delete rest.type;
  delete rest.updatedAt;
  return {
    ...rest,
    priceOverrides: room.priceOverrides.map((o) => ({
      id: o.id,
      startDate: o.startDate,
      endDate: o.endDate,
      price: Number(o.price),
      label: o.label || '',
      createdAt: o.createdAt ?? Date.now(),
    })),
    images: room.images.map((i) => ({ url: i.url, alt: i.alt || '', ...(i.storagePath ? { storagePath: i.storagePath } : {}) })),
    updatedAt: serverTimestamp(),
  };
}

export async function saveRoom(db: Firestore, room: RoomDoc): Promise<void> {
  await runTransaction(db, async (tx) => {
    tx.set(doc(db, 'rooms', room.type), toFirestore(room));
  });
}

/**
 * Seeds `rooms` from the site's current hardcoded data (room-data.ts,
 * room-inventory.ts, bundled photos). Only runs when the collection is empty;
 * never overwrites existing rooms. Returns how many rooms were created.
 */
export async function importStaticRooms(db: Firestore): Promise<number> {
  const existing = await getDocs(collection(db, 'rooms'));
  if (!existing.empty) {
    throw new Error('Colecția de camere nu este goală. Importul se poate face doar o singură dată.');
  }
  const rooms = buildStaticRooms();
  await runTransaction(db, async (tx) => {
    // Re-check inside the transaction so two admins can't import twice.
    const snaps = await Promise.all(rooms.map((r) => tx.get(doc(db, 'rooms', r.type))));
    if (snaps.some((s) => s.exists())) throw new Error('Camerele au fost deja importate.');
    rooms.forEach((r) => tx.set(doc(db, 'rooms', r.type), toFirestore(r)));
  });
  return rooms.length;
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

const MAX_IMAGE_DIMENSION = 2400;
const WEBP_QUALITY = 0.85;

/** Resizes to max 2400px on the long side and re-encodes as WebP (canvas). */
export async function resizeToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponibil.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
    if (!blob) throw new Error('Conversia în WebP a eșuat.');
    return blob;
  } finally {
    bitmap.close();
  }
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\.[^.]+$/, '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'foto'
  );
}

export async function uploadRoomImage(app: FirebaseApp, roomType: string, file: File, alt: string): Promise<RoomImage> {
  if (!file.type.startsWith('image/')) throw new Error('Fișierul nu este o imagine.');
  const blob = await resizeToWebp(file);
  if (blob.size > 10 * 1024 * 1024) throw new Error('Imaginea depășește 10 MB chiar și după comprimare.');
  const storage = await getStorageSdk(app);
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const path = `rooms/${roomType}/${Date.now()}-${slugify(file.name)}.webp`;
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, blob, { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' });
  const url = await getDownloadURL(objectRef);
  return { url, alt, storagePath: path };
}

/** Deletes an uploaded photo from Storage (bundled site photos are left alone). */
export async function deleteRoomImageFile(app: FirebaseApp, image: RoomImage): Promise<void> {
  if (!image.storagePath) return;
  const storage = await getStorageSdk(app);
  const { ref, deleteObject } = await import('firebase/storage');
  try {
    await deleteObject(ref(storage, image.storagePath));
  } catch (err) {
    // Already gone is fine.
    if ((err as { code?: string }).code !== 'storage/object-not-found') throw err;
  }
}

// ---------------------------------------------------------------------------
// Public site refresh (ISR on-demand revalidation)
// ---------------------------------------------------------------------------

/**
 * Asks the Next.js server to re-render the pages that show room data
 * (POST /api/revalidate, admin ID token checked server-side).
 */
export async function revalidateSite(user: User | null): Promise<void> {
  if (!user) throw new Error('Nu sunteți autentificat.');
  const token = await user.getIdToken();
  const res = await fetch('/api/revalidate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Revalidarea a eșuat (${res.status}).`);
  }
}
