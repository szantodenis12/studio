import {HttpsError, onCall, type CallableRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore, FieldValue, Timestamp, type Firestore} from "firebase-admin/firestore";
import {z} from "zod";
import {
  MAX_ADMIN_STAY_NIGHTS,
  MAX_DAYS_IN_ADVANCE,
  MAX_PUBLIC_STAY_NIGHTS,
  addDaysIso,
  canBookOneMore,
  diffDaysIso,
  isIsoDate,
  noonInTimeZone,
  quoteStay,
  todayIso,
  type AvailabilityDoc,
  type PricedRoom,
} from "./shared/pricing.js";

/**
 * Stable machine-readable error reasons (sent in HttpsError.details.reason)
 * so the site can show a friendly, localized message.
 */
export type BookingErrorReason =
  | "INVALID_INPUT"
  | "INVALID_DATES"
  | "DATE_IN_PAST"
  | "TOO_FAR_AHEAD"
  | "STAY_TOO_LONG"
  | "ROOM_NOT_FOUND"
  | "ROOM_INACTIVE"
  | "TOO_MANY_GUESTS"
  | "SOLD_OUT"
  | "NOT_ADMIN"
  | "NO_PRICE";

const MESSAGES: Record<BookingErrorReason, string> = {
  INVALID_INPUT: "Datele rezervării nu sunt valide.",
  INVALID_DATES: "Data de check-out trebuie să fie după data de check-in.",
  DATE_IN_PAST: "Data de check-in nu poate fi în trecut.",
  TOO_FAR_AHEAD: "Rezervările se pot face cu cel mult 2 ani înainte.",
  STAY_TOO_LONG: "Durata șederii depășește limita permisă.",
  ROOM_NOT_FOUND: "Tipul de cameră selectat nu există.",
  ROOM_INACTIVE: "Tipul de cameră selectat nu este disponibil pentru rezervare.",
  TOO_MANY_GUESTS: "Numărul de oaspeți depășește capacitatea camerei.",
  SOLD_OUT: "Nu mai există camere libere de acest tip pentru perioada selectată.",
  NOT_ADMIN: "Doar administratorii pot efectua această operațiune.",
  NO_PRICE: "Camera nu are un preț configurat.",
};

function fail(
  code: "invalid-argument" | "failed-precondition" | "not-found" | "permission-denied" | "resource-exhausted",
  reason: BookingErrorReason,
  extra: Record<string, unknown> = {},
): never {
  throw new HttpsError(code, MESSAGES[reason], {reason, ...extra});
}

const STATUSES = ["New", "Confirmed", "Email Sent"] as const;

export const bookingInputSchema = z.object({
  requestId: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
  roomType: z.string().regex(/^[a-z0-9-]{1,40}$/),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.union([z.string(), z.number()]).transform((v) => Number(v))
    .pipe(z.number().int().min(1).max(10)),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().max(200),
  phone: z.string().trim().max(40),
  locale: z.enum(["ro", "en"]).optional(),
  admin: z.object({
    status: z.enum(STATUSES).optional(),
    totalPrice: z.number().min(0).max(1_000_000).optional(),
    paymentMethod: z.string().trim().min(1).max(60).optional(),
    notes: z.string().trim().max(2000).optional(),
  }).optional(),
});

export type BookingInput = z.input<typeof bookingInputSchema>;

export interface CreateBookingResult {
  bookingId: string;
  totalPrice: number;
  nights: number;
  status: string;
  duplicate: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RoomDocData extends PricedRoom {
  active?: boolean;
  totalRooms?: number;
  maxGuests?: number;
}

/**
 * Core booking logic, independent of the Cloud Functions wrapper so it can be
 * exercised directly in tests.
 */
export async function createBookingCore(
  db: Firestore,
  rawInput: unknown,
  auth: {uid: string} | null,
  now: Date = new Date(),
): Promise<CreateBookingResult> {
  const parsed = bookingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    fail("invalid-argument", "INVALID_INPUT", {issues: parsed.error.issues.map((i) => i.path.join("."))});
  }
  const input = parsed.data;
  const isAdminRequest = !!input.admin;

  // --- Admin path: caller must be users/{uid}.role == 'admin' ---------------
  if (isAdminRequest) {
    if (!auth) fail("permission-denied", "NOT_ADMIN");
    const userSnap = await db.collection("users").doc(auth.uid).get();
    if (userSnap.get("role") !== "admin") fail("permission-denied", "NOT_ADMIN");
  }

  // --- Contact details -----------------------------------------------------
  if (!isAdminRequest) {
    if (!EMAIL_RE.test(input.email)) fail("invalid-argument", "INVALID_INPUT", {field: "email"});
    if (input.phone.replace(/\D/g, "").length < 10) fail("invalid-argument", "INVALID_INPUT", {field: "phone"});
  } else if (input.email && !EMAIL_RE.test(input.email)) {
    fail("invalid-argument", "INVALID_INPUT", {field: "email"});
  }

  // --- Dates ---------------------------------------------------------------
  const {checkIn, checkOut} = input;
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) fail("invalid-argument", "INVALID_DATES");
  const nightsCount = diffDaysIso(checkIn, checkOut);
  if (nightsCount <= 0) fail("invalid-argument", "INVALID_DATES");
  const today = todayIso(now);
  if (!isAdminRequest && checkIn < today) fail("invalid-argument", "DATE_IN_PAST");
  if (checkIn > addDaysIso(today, MAX_DAYS_IN_ADVANCE)) fail("invalid-argument", "TOO_FAR_AHEAD");
  const maxNights = isAdminRequest ? MAX_ADMIN_STAY_NIGHTS : MAX_PUBLIC_STAY_NIGHTS;
  if (nightsCount > maxNights) fail("invalid-argument", "STAY_TOO_LONG", {maxNights});

  const bookingRef = db.collection("bookings").doc(input.requestId);
  const roomRef = db.collection("rooms").doc(input.roomType);

  return db.runTransaction(async (tx) => {
    // ---- reads ----
    const existing = await tx.get(bookingRef);
    if (existing.exists) {
      // Idempotent retry / double submit: return the booking created earlier.
      const data = existing.data() || {};
      return {
        bookingId: existing.id,
        totalPrice: Number(data.totalPrice) || 0,
        nights: Number(data.nights) || nightsCount,
        status: String(data.status || "New"),
        duplicate: true,
      };
    }

    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists) fail("not-found", "ROOM_NOT_FOUND");
    const room = roomSnap.data() as RoomDocData;
    if (room.active === false && !isAdminRequest) fail("failed-precondition", "ROOM_INACTIVE");
    const maxGuests = Number(room.maxGuests);
    if (Number.isFinite(maxGuests) && maxGuests > 0 && input.guests > maxGuests) {
      fail("invalid-argument", "TOO_MANY_GUESTS", {maxGuests});
    }

    const quote = quoteStay(room, checkIn, checkOut);
    if (!isAdminRequest && quote.nights.some((n) => !(n.price > 0))) {
      fail("failed-precondition", "NO_PRICE");
    }

    const totalRooms = Number(room.totalRooms) || 0;
    const availabilityRefs = quote.nights.map((n) => db.collection("availability").doc(n.date));
    const availabilitySnaps = await tx.getAll(...availabilityRefs);
    const soldOutDates = availabilitySnaps
      .filter((snap) => !canBookOneMore((snap.data() || null) as AvailabilityDoc | null, input.roomType, totalRooms))
      .map((snap) => snap.id);
    if (soldOutDates.length > 0) {
      fail("resource-exhausted", "SOLD_OUT", {dates: soldOutDates});
    }

    // ---- writes ----
    const status = isAdminRequest ? (input.admin?.status || "Confirmed") : "New";
    const totalPrice = isAdminRequest && typeof input.admin?.totalPrice === "number" ?
      input.admin.totalPrice : quote.total;

    tx.create(bookingRef, {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      roomType: input.roomType,
      guests: String(input.guests),
      checkIn: Timestamp.fromDate(noonInTimeZone(checkIn)),
      checkOut: Timestamp.fromDate(noonInTimeZone(checkOut)),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights: quote.nights.length,
      nightlyPrices: quote.nights.map((n) => ({date: n.date, price: n.price})),
      totalPrice,
      calculatedPrice: quote.total,
      paymentMethod: isAdminRequest ? (input.admin?.paymentMethod || "property") : "property",
      status,
      source: isAdminRequest ? "admin" : "website",
      ...(isAdminRequest ? {createdBy: auth?.uid || null, notes: input.admin?.notes || ""} : {}),
      locale: input.locale || "ro",
      requestId: input.requestId,
      availabilityReserved: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    for (const ref of availabilityRefs) {
      tx.set(ref, {date: ref.id, [input.roomType]: FieldValue.increment(1)}, {merge: true});
    }

    return {
      bookingId: bookingRef.id,
      totalPrice,
      nights: quote.nights.length,
      status,
      duplicate: false,
    };
  });
}

export const createBooking = onCall(
  {
    // Same region as the other functions (default us-central1).
    cors: true,
    maxInstances: 10,
  },
  async (request: CallableRequest<unknown>) => {
    try {
      return await createBookingCore(getFirestore(), request.data, request.auth ? {uid: request.auth.uid} : null);
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      logger.error("createBooking failed", err);
      throw new HttpsError("internal", "A apărut o eroare la crearea rezervării. Vă rugăm încercați din nou.");
    }
  },
);
