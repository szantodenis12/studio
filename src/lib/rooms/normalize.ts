import { nightlyPrice, todayIso, isIsoDate, type PriceOverride } from './pricing';
import type { RoomDoc, RoomLocale, SiteRoom, RoomImage } from './types';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

/* Defensive conversion of whatever is stored in Firestore into a RoomDoc. */

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

function toMillis(v: unknown): number | null {
  if (!v) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  }
  const maybe = v as { toMillis?: () => number; seconds?: number };
  if (typeof maybe.toMillis === 'function') return maybe.toMillis();
  if (typeof maybe.seconds === 'number') return maybe.seconds * 1000;
  return null;
}

function normalizeOverride(v: unknown, index: number): PriceOverride | null {
  const o = obj(v);
  const startDate = str(o.startDate);
  const endDate = str(o.endDate);
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) return null;
  const out: PriceOverride = {
    id: str(o.id) || `ovr-${index}`,
    startDate,
    endDate,
    price: num(o.price),
  };
  const label = str(o.label);
  if (label) out.label = label;
  const createdAt = toMillis(o.createdAt);
  if (createdAt !== null) out.createdAt = createdAt;
  return out;
}

export function normalizeRoom(id: string, data: unknown): RoomDoc {
  const d = obj(data);
  const details = obj(d.details);
  const loc = (l: RoomLocale) => {
    const x = obj(details[l]);
    return { title: str(x.title), description: str(x.description), priceLabel: str(x.priceLabel) };
  };
  return {
    type: id,
    slug: str(d.slug) || `room-${id}`,
    order: num(d.order, 999),
    active: d.active !== false,
    totalRooms: Math.max(0, Math.floor(num(d.totalRooms))),
    maxGuests: Math.max(1, Math.floor(num(d.maxGuests, 2))),
    basePrice: Math.max(0, num(d.basePrice)),
    priceOverrides: arr(d.priceOverrides)
      .map(normalizeOverride)
      .filter((o): o is PriceOverride => !!o),
    details: { ro: loc('ro'), en: loc('en') },
    amenities: arr(d.amenities).map((a) => {
      const x = obj(a);
      return { icon: str(x.icon, 'Check'), ro: str(x.ro), en: str(x.en) };
    }),
    specs: arr(d.specs).map((s) => {
      const x = obj(s);
      return { icon: str(x.icon, 'Check'), text: str(x.text) };
    }),
    images: arr(d.images)
      .map((i) => {
        const x = obj(i);
        const img: RoomImage = { url: str(x.url), alt: str(x.alt) };
        const p = str(x.storagePath);
        if (p) img.storagePath = p;
        return img;
      })
      .filter((i) => !!i.url),
    updatedAt: toMillis(d.updatedAt),
  };
}

export function sortRooms<T extends { order: number; type: string }>(rooms: T[]): T[] {
  return [...rooms].sort((a, b) => a.order - b.order || a.type.localeCompare(b.type));
}

/** Active rooms in display order, each with today's nightly price. */
export function toSiteRooms(rooms: RoomDoc[], today: string = todayIso()): SiteRoom[] {
  return sortRooms(rooms.filter((r) => r.active)).map((r) => ({ ...r, todayPrice: nightlyPrice(r, today) }));
}

/** "de la 390 RON / noapte" (or the room's custom price text if set). */
export function roomPriceLabel(room: SiteRoom, locale: string): string {
  const l: RoomLocale = locale === 'en' ? 'en' : 'ro';
  const custom = room.details[l]?.priceLabel;
  if (custom) return custom;
  return l === 'ro' ? `de la ${room.todayPrice} RON / noapte` : `from ${room.todayPrice} RON / night`;
}

export function roomTitle(room: RoomDoc, locale: string): string {
  const l: RoomLocale = locale === 'en' ? 'en' : 'ro';
  return room.details[l]?.title || room.details.ro?.title || room.details.en?.title || room.type;
}

export function roomDescription(room: RoomDoc, locale: string): string {
  const l: RoomLocale = locale === 'en' ? 'en' : 'ro';
  return room.details[l]?.description || room.details.ro?.description || '';
}

/** Room photos in the shape the existing image components expect. */
export function roomImagePlaceholders(room: RoomDoc): ImagePlaceholder[] {
  return room.images.map((img, i) => {
    // Keep the original id/hint for the site's bundled photos.
    const known = PlaceHolderImages.find((p) => p.imageUrl === img.url);
    return {
      id: known?.id ?? `${room.type}-${i}`,
      description: img.alt,
      imageUrl: img.url,
      imageHint: known?.imageHint ?? '',
    };
  });
}

/** Cheapest "today" price across rooms (for "de la X RON" in SEO data). */
export function minTodayPrice(rooms: SiteRoom[]): number | null {
  const prices = rooms.map((r) => r.todayPrice).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : null;
}
