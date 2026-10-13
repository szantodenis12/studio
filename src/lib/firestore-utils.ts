import { Timestamp, FieldValue } from 'firebase/firestore';

/**
 * Safely converts a Firestore Timestamp, a plain Date, or a pending
 * server-timestamp sentinel (FieldValue, only present before a write is
 * committed) into a JS Date.
 *
 * Several booking fields are typed as `Date | Timestamp` (or
 * `Timestamp | FieldValue` for `createdAt`) because the same shape is used
 * both when building data to write and when reading it back from
 * Firestore. Accessing `.seconds` directly on that union is unsafe: a plain
 * `Date` (or an unresolved `FieldValue`) has no `.seconds` property, which
 * previously produced `NaN` / "Invalid Date" at runtime instead of a type
 * error. Always go through this helper instead.
 */
export function toDate(value: Date | Timestamp | FieldValue | null | undefined): Date {
  if (!value) return new Date(NaN);
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  // Unresolved FieldValue sentinel (e.g. serverTimestamp() before commit).
  return new Date(NaN);
}
