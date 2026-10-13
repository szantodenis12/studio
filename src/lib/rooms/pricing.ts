/**
 * Shared, dependency-free pricing + availability logic.
 *
 * THIS FILE EXISTS IN TWO PLACES AND MUST STAY BYTE-IDENTICAL:
 *   - src/lib/rooms/pricing.ts            (Next.js app: admin + public pages)
 *   - functions/src/shared/pricing.ts     (Cloud Functions: createBooking)
 * Edit src/lib/rooms/pricing.ts, then run `npm run sync:shared`.
 * The test suite fails if the two copies differ.
 *
 * All calendar dates are plain 'YYYY-MM-DD' strings in the hotel's time zone
 * (Europe/Bucharest). Date arithmetic is done in UTC on those strings, so it is
 * immune to the browser's / server's local time zone and DST.
 */

export const HOTEL_TIME_ZONE = 'Europe/Bucharest';

/** Longest stay a guest can book online (nights). */
export const MAX_PUBLIC_STAY_NIGHTS = 60;
/** Longest stay an admin can enter manually (nights). */
export const MAX_ADMIN_STAY_NIGHTS = 365;
/** How far in the future a booking may start (days). */
export const MAX_DAYS_IN_ADVANCE = 730;

export interface PriceOverride {
  id: string;
  /** First night covered (inclusive), 'YYYY-MM-DD'. */
  startDate: string;
  /** Last night covered (inclusive), 'YYYY-MM-DD'. */
  endDate: string;
  /** Nightly price in RON. */
  price: number;
  label?: string;
  /** Epoch millis; later-created overrides win ties. */
  createdAt?: number;
}

export interface PricedRoom {
  basePrice: number;
  priceOverrides?: PriceOverride[] | null;
}

export interface NightPrice {
  date: string;
  price: number;
  overrideId?: string;
}

export interface StayQuote {
  nights: NightPrice[];
  total: number;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return false;
  const t = Date.parse(value + 'T00:00:00Z');
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === value;
}

export function addDaysIso(iso: string, days: number): string {
  const t = Date.parse(iso + 'T00:00:00Z') + days * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDaysIso(from: string, to: string): number {
  return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / DAY_MS);
}

/** The nights of a stay: check-in date up to (excluding) the check-out date. */
export function stayNights(checkIn: string, checkOut: string): string[] {
  const n = diffDaysIso(checkIn, checkOut);
  const nights: string[] = [];
  for (let i = 0; i < n; i++) nights.push(addDaysIso(checkIn, i));
  return nights;
}

/** Calendar date ('YYYY-MM-DD') of `instant` as seen in `timeZone`. */
export function isoDateInTimeZone(instant: Date, timeZone: string = HOTEL_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Today's date in the hotel's time zone. */
export function todayIso(now: Date = new Date(), timeZone: string = HOTEL_TIME_ZONE): string {
  return isoDateInTimeZone(now, timeZone);
}

/**
 * The instant of 12:00 (noon) on `iso` in `timeZone`. Bookings store
 * check-in/check-out as Timestamps at local noon so they render as the right
 * calendar day in any nearby time zone.
 */
export function noonInTimeZone(iso: string, timeZone: string = HOTEL_TIME_ZONE): Date {
  const guess = Date.parse(iso + 'T12:00:00Z');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(guess));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  const wallAsUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  const offset = wallAsUtc - guess;
  return new Date(guess - offset);
}

function isValidOverride(o: PriceOverride | null | undefined): o is PriceOverride {
  return (
    !!o &&
    isIsoDate(o.startDate) &&
    isIsoDate(o.endDate) &&
    o.startDate <= o.endDate &&
    typeof o.price === 'number' &&
    Number.isFinite(o.price) &&
    o.price >= 0
  );
}

/**
 * The price override that applies to the night of `date`, or null.
 * When several overlap, the most specific (shortest range) wins; ties go to
 * the most recently created one (then to the one later in the list).
 */
export function overrideFor(room: PricedRoom, date: string): PriceOverride | null {
  const list = room.priceOverrides || [];
  let best: PriceOverride | null = null;
  let bestSpan = Infinity;
  let bestCreated = -Infinity;
  for (const o of list) {
    if (!isValidOverride(o)) continue;
    if (date < o.startDate || date > o.endDate) continue;
    const span = diffDaysIso(o.startDate, o.endDate);
    const created = typeof o.createdAt === 'number' ? o.createdAt : 0;
    if (span < bestSpan || (span === bestSpan && created >= bestCreated)) {
      best = o;
      bestSpan = span;
      bestCreated = created;
    }
  }
  return best;
}

/** Base price as a sane non-negative number. */
export function basePriceOf(room: PricedRoom): number {
  const base = Number(room.basePrice);
  return Number.isFinite(base) && base > 0 ? base : 0;
}

/** Nightly price for the night starting on `date`. */
export function nightlyPrice(room: PricedRoom, date: string): number {
  const o = overrideFor(room, date);
  return o ? o.price : basePriceOf(room);
}

/** Per-night prices and total for a stay [checkIn, checkOut). */
export function quoteStay(room: PricedRoom, checkIn: string, checkOut: string): StayQuote {
  const nights: NightPrice[] = stayNights(checkIn, checkOut).map((date) => {
    const o = overrideFor(room, date);
    return o ? { date, price: o.price, overrideId: o.id } : { date, price: basePriceOf(room) };
  });
  const total = Math.round(nights.reduce((sum, n) => sum + n.price, 0) * 100) / 100;
  return { nights, total };
}

/** Nightly prices for `days` consecutive nights starting at `from` (admin preview). */
export function priceCalendar(room: PricedRoom, from: string, days: number): NightPrice[] {
  return quoteStay(room, from, addDaysIso(from, days)).nights;
}

// ---------------------------------------------------------------------------
// Availability
//
// availability/{YYYY-MM-DD} = {
//   date: 'YYYY-MM-DD',
//   <roomType>: number,               // rooms booked (non-cancelled bookings)
//   blocked: { <roomType>: number },  // rooms manually blocked by an admin
// }
// ---------------------------------------------------------------------------

export type AvailabilityDoc = Record<string, unknown> & {
  blocked?: Record<string, unknown> | null;
};

function nonNegativeInt(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function bookedCount(doc: AvailabilityDoc | null | undefined, roomType: string): number {
  if (!doc || roomType === 'blocked' || roomType === 'date') return 0;
  return nonNegativeInt(doc[roomType]);
}

export function blockedCount(doc: AvailabilityDoc | null | undefined, roomType: string): number {
  const blocked = doc?.blocked;
  if (!blocked || typeof blocked !== 'object') return 0;
  return nonNegativeInt((blocked as Record<string, unknown>)[roomType]);
}

/** Rooms of `roomType` still sellable on that night. */
export function freeRooms(
  doc: AvailabilityDoc | null | undefined,
  roomType: string,
  totalRooms: number,
): number {
  return Math.max(0, nonNegativeInt(totalRooms) - bookedCount(doc, roomType) - blockedCount(doc, roomType));
}

/** True if one more room of `roomType` can be booked on that night. */
export function canBookOneMore(
  doc: AvailabilityDoc | null | undefined,
  roomType: string,
  totalRooms: number,
): boolean {
  return bookedCount(doc, roomType) + blockedCount(doc, roomType) + 1 <= nonNegativeInt(totalRooms);
}
