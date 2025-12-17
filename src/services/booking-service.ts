
'use client';
import {
  collection,
  writeBatch,
  doc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { eachDayOfInterval, format } from 'date-fns';

// Define a TypeScript interface for the booking data
export interface BookingData {
  fullName: string;
  email: string;
  phone: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  guests: string;
  paymentMethod: 'card' | 'property';
}

export const createBooking = async (db: Firestore, bookingData: BookingData) => {
  // Use a batch to ensure atomic writes for booking and availability
  const batch = writeBatch(db);

  // 1. Create a reference for the new booking document
  const bookingsCollection = collection(db, 'bookings');
  const newBookingRef = doc(bookingsCollection); // Create a ref with a new ID

  const dataWithTimestamp = {
    ...bookingData,
    createdAt: serverTimestamp(),
  };
  batch.set(newBookingRef, dataWithTimestamp);

  // 2. Create availability documents for each day of the booking
  const availabilityCollection = collection(db, 'availability');
  const bookedDates = eachDayOfInterval({
    start: bookingData.checkIn,
    end: bookingData.checkOut,
  });
  
  // Don't include the checkout day itself as unavailable for the *next* booking
  bookedDates.pop();

  bookedDates.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd');
    const availabilityDocId = `${bookingData.roomType}_${dateString}`;
    const availabilityDocRef = doc(availabilityCollection, availabilityDocId);
    
    batch.set(availabilityDocRef, {
      roomType: bookingData.roomType,
      date: dateString,
      bookingId: newBookingRef.id,
    });
  });

  // 3. Commit the batch
  await batch.commit();
};
