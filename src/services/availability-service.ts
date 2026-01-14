
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  Firestore,
  runTransaction,
  Transaction,
} from 'firebase/firestore';
import { parseISO, format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a simplified, client-side representation of our room inventory.
// In a real app, you might fetch this from a 'roomTypes' collection in Firestore.
const roomInventory: { [key: string]: number } = {
    'single': 5,
    'double': 10,
    'deluxe': 3,
    'apartment': 2,
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

  const totalRoomsOfType: number = roomInventory[roomType] || 0;
    if (totalRoomsOfType === 0) {
        // If we don't have this room type in inventory, all dates are "unavailable"
        // Return a function that disables all dates
        return [{ before: new Date(0) }] as any;
    }

  const availabilityCollection = collection(db, 'availability');
  
  // We query for all availability documents for the given room type
  // where the booking count is greater than or equal to the total inventory.
  const q = query(
    availabilityCollection, 
    where(roomType, '>=', totalRoomsOfType)
  );

  try {
    const querySnapshot = await getDocs(q);
    const dates: Date[] = [];
    querySnapshot.forEach((doc) => {
      // doc.id is the date string 'YYYY-MM-DD'
      dates.push(parseISO(doc.id));
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


/**
 * Manually adjusts the booking count for a specific room type on a given date.
 * @param db The Firestore instance.
 * @param date The date to adjust.
 * @param roomType The type of room to adjust.
 * @param adjustment The number to add to the booking count (can be negative).
 */
export const adjustAvailability = async (
  db: Firestore,
  date: Date,
  roomType: string,
  adjustment: number
) => {
  if (!db || !date || !roomType || adjustment === 0) {
    throw new Error("Invalid parameters for availability adjustment.");
  }

  const dateString = format(date, 'yyyy-MM-dd');
  const availabilityDocRef = doc(db, 'availability', dateString);

  try {
    await runTransaction(db, async (transaction: Transaction) => {
      const availabilityDoc = await transaction.get(availabilityDocRef);

      if (!availabilityDoc.exists()) {
        // If the document doesn't exist, create it.
        // We only create it if the adjustment is positive (adding a booking).
        if (adjustment > 0) {
          transaction.set(availabilityDocRef, {
            date: dateString,
            [roomType]: adjustment,
          });
        }
        // If adjustment is negative and doc doesn't exist, do nothing.
      } else {
        // If it exists, increment/decrement the count.
        const currentCount = availabilityDoc.data()[roomType] || 0;
        const newCount = Math.max(0, currentCount + adjustment); // Ensure count doesn't go below zero
        
        transaction.update(availabilityDocRef, {
          [roomType]: newCount,
        });
      }
    });
  } catch (error) {
    console.error("Error adjusting availability:", error);

    const permissionError = new FirestorePermissionError({
      path: `availability/${dateString}`,
      operation: 'update',
      requestResourceData: { [roomType]: `adjustment by ${adjustment}` },
    });

    errorEmitter.emit('permission-error', permissionError);
    throw error;
  }
};
