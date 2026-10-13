'use client';

import type { FirebaseApp } from 'firebase/app';
import { getFunctionsSdk } from '@/firebase';

/**
 * Client for the `createBooking` Cloud Function (functions/src/booking.ts).
 * All bookings -- public and admin manual ones -- are created server-side:
 * the function validates the request, prices it per night from rooms/{type},
 * checks inventory in a transaction and reserves availability.
 */

export interface CreateBookingPayload {
  /** Per-form-session idempotency key (becomes the booking doc id). */
  requestId: string;
  roomType: string;
  /** 'YYYY-MM-DD' */
  checkIn: string;
  /** 'YYYY-MM-DD' */
  checkOut: string;
  guests: string | number;
  fullName: string;
  email: string;
  phone: string;
  locale?: 'ro' | 'en';
  /** Admin-only options (caller must be an admin). */
  admin?: {
    status?: 'New' | 'Confirmed' | 'Email Sent';
    totalPrice?: number;
    paymentMethod?: string;
    notes?: string;
  };
}

export interface CreateBookingResult {
  bookingId: string;
  totalPrice: number;
  nights: number;
  status: string;
  duplicate: boolean;
}

export async function submitBooking(app: FirebaseApp, payload: CreateBookingPayload): Promise<CreateBookingResult> {
  const functions = await getFunctionsSdk(app);
  const { httpsCallable } = await import('firebase/functions');
  const call = httpsCallable<CreateBookingPayload, CreateBookingResult>(functions, 'createBooking');
  const res = await call(payload);
  return res.data;
}

/** A random id usable as an idempotency key (UUID when available). */
export function newRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const REASON_MESSAGES: Record<string, string> = {
  INVALID_INPUT: 'Unele date ale rezervării nu sunt valide. Verificați numele, emailul și telefonul.',
  INVALID_DATES: 'Data de check-out trebuie să fie după data de check-in.',
  DATE_IN_PAST: 'Data de check-in nu poate fi în trecut.',
  TOO_FAR_AHEAD: 'Rezervările se pot face cu cel mult 2 ani înainte.',
  STAY_TOO_LONG: 'Durata șederii depășește limita permisă pentru rezervări online. Vă rugăm să ne contactați.',
  ROOM_NOT_FOUND: 'Tipul de cameră selectat nu există.',
  ROOM_INACTIVE: 'Tipul de cameră selectat nu este disponibil momentan pentru rezervare.',
  TOO_MANY_GUESTS: 'Numărul de oaspeți depășește capacitatea camerei selectate.',
  SOLD_OUT: 'Ne pare rău, între timp camera a devenit indisponibilă pentru o parte din perioada selectată. Vă rugăm alegeți alte date sau alt tip de cameră.',
  NOT_ADMIN: 'Doar administratorii pot efectua această operațiune.',
  NO_PRICE: 'Camera nu are un preț configurat pentru perioada selectată. Vă rugăm să ne contactați.',
};

export interface BookingErrorInfo {
  reason: string | null;
  message: string;
  /** Sold-out nights, when reason === 'SOLD_OUT'. */
  dates: string[];
}

/** Turns a callable error into a friendly Romanian message. */
export function describeBookingError(error: unknown): BookingErrorInfo {
  const e = error as { code?: string; message?: string; details?: { reason?: string; dates?: string[] } };
  const reason = e?.details?.reason ?? null;
  if (reason && REASON_MESSAGES[reason]) {
    return { reason, message: REASON_MESSAGES[reason], dates: e.details?.dates ?? [] };
  }
  if (e?.code === 'functions/unavailable' || e?.code === 'functions/deadline-exceeded') {
    return { reason: null, message: 'Serviciul de rezervări nu răspunde. Verificați conexiunea și încercați din nou.', dates: [] };
  }
  return {
    reason: null,
    message: `A apărut o problemă la trimiterea rezervării. Vă rugăm încercați din nou sau sunați la recepție. (${e?.code || 'necunoscut'})`,
    dates: [],
  };
}
