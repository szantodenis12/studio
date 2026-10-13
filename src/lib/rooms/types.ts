import type { PriceOverride } from './pricing';

export type RoomLocale = 'ro' | 'en';
export const ROOM_LOCALES: RoomLocale[] = ['ro', 'en'];

export interface RoomLocaleDetails {
  title: string;
  description: string;
  /**
   * Optional custom price text (e.g. "de la 500-550 RON / noapte"). When empty
   * the site shows "de la {today's price} RON / noapte" automatically.
   */
  priceLabel: string;
}

export interface RoomAmenity {
  /** lucide icon name, one of ROOM_ICON_NAMES */
  icon: string;
  ro: string;
  en: string;
}

export interface RoomSpec {
  icon: string;
  text: string;
}

export interface RoomImage {
  url: string;
  alt: string;
  /** Firebase Storage object path when uploaded from the admin. */
  storagePath?: string;
}

/**
 * Firestore document rooms/{type}. The doc id is the room type key used by
 * bookings and availability (e.g. 'double'), so those keys stay valid.
 */
export interface RoomDoc {
  type: string;
  /** Stable anchor id used on /camere (e.g. 'room-double'). */
  slug: string;
  order: number;
  active: boolean;
  totalRooms: number;
  maxGuests: number;
  basePrice: number;
  priceOverrides: PriceOverride[];
  details: Record<RoomLocale, RoomLocaleDetails>;
  amenities: RoomAmenity[];
  specs: RoomSpec[];
  images: RoomImage[];
  /** Epoch millis of the last admin save (serverTimestamp in Firestore). */
  updatedAt?: number | null;
}

/** A room as rendered on the public site: the doc plus today's nightly price. */
export interface SiteRoom extends RoomDoc {
  todayPrice: number;
}
