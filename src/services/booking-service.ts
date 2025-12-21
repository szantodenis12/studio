
'use client';
import {
  collection,
  writeBatch,
  doc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { eachDayOfInterval, format, differenceInCalendarDays } from 'date-fns';

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

const roomPrices = {
    'single': 380,
    'double': 450,
    'deluxe': 750,
}

export const createBooking = async (db: Firestore, bookingData: BookingData) => {
  // Use a batch to ensure atomic writes for booking and availability
  const batch = writeBatch(db);

  // 1. Create a reference for the new booking document
  const bookingsCollection = collection(db, 'bookings');
  const newBookingRef = doc(bookingsCollection); // Create a ref with a new ID

  const numberOfNights = differenceInCalendarDays(bookingData.checkOut, bookingData.checkIn);
  const roomPrice = roomPrices[bookingData.roomType] || 0;
  const totalPrice = numberOfNights * roomPrice;

  const dataWithTimestamp = {
    ...bookingData,
    createdAt: serverTimestamp(),
    status: 'Confirmed', // Default status
    totalPrice: totalPrice,
  };
  batch.set(newBookingRef, dataWithTimestamp);

  // 2. Create availability documents for each day of the booking
  const availabilityCollection = collection(db, 'availability');
  const bookedDates = eachDayOfInterval({
    start: bookingData.checkIn,
    end: bookingData.checkOut,
  });
  
  // Don't include the checkout day itself as unavailable for the *next* booking
  if (bookedDates.length > 0) {
    bookedDates.pop();
  }

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
