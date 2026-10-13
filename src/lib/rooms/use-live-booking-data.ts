'use client';

import { useEffect, useState } from 'react';
import { collection, documentId, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { normalizeRoom, toSiteRooms } from './normalize';
import { todayIso, type AvailabilityDoc } from './pricing';
import type { SiteRoom } from './types';

/**
 * Live `rooms` collection for the booking form: starts from the server-rendered
 * rooms and switches to Firestore's live data once it arrives (so a price or
 * inventory change made in the admin is reflected without a reload).
 * Falls back to the initial rooms if Firestore is empty or unreachable.
 */
export function useLiveRooms(initialRooms: SiteRoom[]): SiteRoom[] {
  const db = useFirestore();
  const [rooms, setRooms] = useState<SiteRoom[]>(initialRooms);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(
      collection(db, 'rooms'),
      (snap) => {
        if (snap.empty) return;
        const live = toSiteRooms(snap.docs.map((d) => normalizeRoom(d.id, d.data())), todayIso());
        if (live.length) setRooms(live);
      },
      (err) => console.warn('[rooms] live listener failed, keeping server data:', err.message),
    );
    return () => unsubscribe();
  }, [db]);

  return rooms;
}

export interface LiveAvailability {
  /** availability docs keyed by 'YYYY-MM-DD' (from today on) */
  byDate: Record<string, AvailabilityDoc>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Live availability counters from today onward (public read). Subscribes as
 * soon as the form mounts so the calendar is ready when a room is chosen.
 */
export function useLiveAvailability(days = 800): LiveAvailability {
  const db = useFirestore();
  const [state, setState] = useState<LiveAvailability>({ byDate: {}, isLoading: true, error: null });

  useEffect(() => {
    if (!db) return;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const q = query(
      collection(db, 'availability'),
      where(documentId(), '>=', todayIso()),
      orderBy(documentId()),
      limit(days),
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const byDate: Record<string, AvailabilityDoc> = {};
        snap.forEach((d) => {
          byDate[d.id] = d.data() as AvailabilityDoc;
        });
        setState({ byDate, isLoading: false, error: null });
      },
      (err) => {
        console.error('Error listening to availability:', err);
        setState({ byDate: {}, isLoading: false, error: 'Nu am putut verifica disponibilitatea. Vă rugăm încercați mai târziu.' });
      },
    );
    return () => unsubscribe();
  }, [db, days]);

  return state;
}
