
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  Firestore,
} from 'firebase/firestore';
import { parseISO } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a simplified, client-side representation of our room inventory.
// In a real app, you might fetch this from a 'roomTypes' collection in Firestore.
const roomInventory = {
    'single': 5,
    'double': 10,
    'deluxe': 3,
};


/**
 * Fetches all dates where a specific room type is fully booked.
 * @param db The Firestore instance.
 * @param roomType The type of room to check (e.g., 'double', 'deluxe').
 * @returns A promise that resolves to an array of Date objects representing fully booked dates.
 */
export const getUnavailableDates = async (
  db: Firestore,
  roomType: string
): Promise<Date[]> => {
  if (!db) {
    throw new Error("Firestore database instance is not available.");
  }

  const totalRoomsOfTyp: number = roomInventory[roomType] || 0;
    if (totalRoomsOfTyp === 0) {
        // If we don't have this room type in inventory, all dates are "unavailable"
        // Return a function that disables all dates
        return [{ before: new Date(0) }] as any;
    }

  const availabilityCollection = collection(db, 'availability');
  
  // We query for all availability documents for the given room type
  // where the booking count is greater than or equal to the total inventory.
  const q = query(
    availabilityCollection, 
    where('roomType', '==', roomType),
    where('bookingCount', '>=', totalRoomsOfTyp)
  );

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
    console.error(`Error fetching unavailable dates for ${roomType}:`, error);

    const permissionError = new FirestorePermissionError({
        path: `availability`,
        operation: 'list',
    });

    errorEmitter.emit('permission-error', permissionError);
    
    throw error;
  }
};
