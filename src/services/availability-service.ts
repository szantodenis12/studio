
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { parseISO } from 'date-fns';

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
    console.error("Error fetching unavailable dates: ", error);
    // Depending on requirements, you might want to re-throw or handle differently
    throw new Error("Could not fetch room availability.");
  }
};
