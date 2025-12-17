
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { parseISO } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Fetches all unavailable dates for a given room type.
 * @param db The Firestore instance.
 * @param roomType The type of room to check (e.g., 'double', 'deluxe').
 * @returns A promise that resolves to an array of Date objects representing unavailable dates.
 */
export const getUnavailableDates = async (
  db: Firestore,
  roomType: string
): Promise<Date[]> => {
  if (!db) {
    throw new Error("Firestore database instance is not available.");
  }

  const availabilityCollection = collection(db, 'availability');
  const q = query(availabilityCollection, where('roomType', '==', roomType));

  try {
    const querySnapshot = await getDocs(q);
    const dates: Date[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // data.date is 'YYYY-MM-DD', parseISO correctly handles this format.
      dates.push(parseISO(data.date));
    });
    return dates;
  } catch (error) {
    // This is a read operation ('list' for a collection query)
    const permissionError = new FirestorePermissionError({
        path: `availability`,
        operation: 'list',
    });

    // Emit the specialized error for the global listener
    errorEmitter.emit('permission-error', permissionError);
    
    // Also re-throw the original error to ensure the calling code's catch block executes
    throw error;
  }
};
