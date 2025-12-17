
'use client';
import {
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';

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

export const createBooking = (bookingData: BookingData) => {
  const db = useFirestore();
  const bookingsCollection = collection(db, 'bookings');
  
  const dataWithTimestamp = {
    ...bookingData,
    createdAt: serverTimestamp(),
  };

  addDocumentNonBlocking(bookingsCollection, dataWithTimestamp);
};
