
'use client';
import {
  collection,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

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

export const createBooking = (db: Firestore, bookingData: BookingData) => {
  const bookingsCollection = collection(db, 'bookings');
  
  const dataWithTimestamp = {
    ...bookingData,
    createdAt: serverTimestamp(),
  };

  addDocumentNonBlocking(bookingsCollection, dataWithTimestamp);
};
