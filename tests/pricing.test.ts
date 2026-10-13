import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  addDaysIso,
  blockedCount,
  bookedCount,
  canBookOneMore,
  diffDaysIso,
  freeRooms,
  isIsoDate,
  nightlyPrice,
  noonInTimeZone,
  overrideFor,
  priceCalendar,
  quoteStay,
  stayNights,
  todayIso,
  type PricedRoom,
} from '@/lib/rooms/pricing';
import { STATIC_ROOMS } from '@/lib/rooms/static-rooms';
import { toSiteRooms, roomPriceLabel } from '@/lib/rooms/normalize';

describe('shared pricing module', () => {
  it('is byte-identical in the app and in Cloud Functions', () => {
    const root = path.resolve(__dirname, '..');
    const app = readFileSync(path.join(root, 'src/lib/rooms/pricing.ts'), 'utf8');
    const fn = readFileSync(path.join(root, 'functions/src/shared/pricing.ts'), 'utf8');
    expect(fn).toBe(app);
  });
});

describe('dates', () => {
  it('validates ISO dates', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-2-3')).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });

  it('adds days across month/year and DST boundaries', () => {
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysIso('2026-03-28', 2)).toBe('2026-03-30'); // DST starts 29 Mar in RO
    expect(diffDaysIso('2026-10-24', '2026-10-26')).toBe(2); // DST ends 25 Oct
  });

  it('lists the nights of a stay, excluding the check-out day', () => {
    expect(stayNights('2026-11-01', '2026-11-04')).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
    expect(stayNights('2026-11-04', '2026-11-04')).toEqual([]);
    expect(stayNights('2026-11-05', '2026-11-04')).toEqual([]);
  });

  it('computes today in Europe/Bucharest', () => {
    // 22:30 UTC on 31 Dec is already 1 Jan in Bucharest (UTC+2).
    expect(todayIso(new Date('2026-12-31T22:30:00Z'))).toBe('2027-01-01');
    expect(todayIso(new Date('2026-07-01T20:59:00Z'))).toBe('2026-07-01');
  });

  it('computes local noon in Bucharest in winter and summer', () => {
    expect(noonInTimeZone('2026-01-15').toISOString()).toBe('2026-01-15T10:00:00.000Z');
    expect(noonInTimeZone('2026-07-15').toISOString()).toBe('2026-07-15T09:00:00.000Z');
  });
});

describe('nightly pricing', () => {
  const room: PricedRoom = {
    basePrice: 390,
    priceOverrides: [
      { id: 'summer', startDate: '2026-07-01', endDate: '2026-08-31', price: 450, createdAt: 1 },
      { id: 'festival', startDate: '2026-07-10', endDate: '2026-07-12', price: 600, createdAt: 2 },
      { id: 'older-same-span', startDate: '2026-08-01', endDate: '2026-08-03', price: 500, createdAt: 10 },
      { id: 'newer-same-span', startDate: '2026-08-02', endDate: '2026-08-04', price: 520, createdAt: 20 },
    ],
  };

  it('uses the base price outside overrides', () => {
    expect(nightlyPrice(room, '2026-06-30')).toBe(390);
    expect(nightlyPrice(room, '2026-09-01')).toBe(390);
  });

  it('applies inclusive date ranges', () => {
    expect(nightlyPrice(room, '2026-07-01')).toBe(450);
    expect(nightlyPrice(room, '2026-08-31')).toBe(450);
  });

  it('prefers the most specific (shortest) override', () => {
    expect(nightlyPrice(room, '2026-07-11')).toBe(600);
    expect(overrideFor(room, '2026-07-11')?.id).toBe('festival');
  });

  it('breaks ties by latest createdAt', () => {
    expect(nightlyPrice(room, '2026-08-02')).toBe(520);
    expect(nightlyPrice(room, '2026-08-01')).toBe(500);
  });

  it('ignores malformed overrides', () => {
    const bad: PricedRoom = {
      basePrice: 100,
      priceOverrides: [
        { id: 'x', startDate: '2026-05-10', endDate: '2026-05-01', price: 999 },
        { id: 'y', startDate: 'nope', endDate: '2026-05-01', price: 999 },
        { id: 'z', startDate: '2026-05-01', endDate: '2026-05-31', price: Number.NaN },
      ],
    };
    expect(nightlyPrice(bad, '2026-05-05')).toBe(100);
  });

  it('quotes a stay night by night', () => {
    const q = quoteStay(room, '2026-07-09', '2026-07-13');
    expect(q.nights.map((n) => n.price)).toEqual([450, 600, 600, 600]);
    expect(q.total).toBe(2250);
  });

  it('builds a price calendar', () => {
    const cal = priceCalendar(room, '2026-06-29', 4);
    expect(cal.map((n) => [n.date, n.price])).toEqual([
      ['2026-06-29', 390],
      ['2026-06-30', 390],
      ['2026-07-01', 450],
      ['2026-07-02', 450],
    ]);
  });

  it('treats a missing or zero base price as 0', () => {
    expect(nightlyPrice({ basePrice: 0 }, '2026-01-01')).toBe(0);
    expect(nightlyPrice({ basePrice: Number.NaN }, '2026-01-01')).toBe(0);
  });
});

describe('availability helpers', () => {
  const doc = { date: '2026-11-01', double: 4, blocked: { double: 1, deluxe: 2 } };

  it('reads booked and blocked counts', () => {
    expect(bookedCount(doc, 'double')).toBe(4);
    expect(blockedCount(doc, 'double')).toBe(1);
    expect(bookedCount(doc, 'deluxe')).toBe(0);
    expect(blockedCount(doc, 'deluxe')).toBe(2);
    expect(bookedCount(doc, 'blocked')).toBe(0);
    expect(bookedCount(null, 'double')).toBe(0);
  });

  it('computes free rooms and the booking cap', () => {
    expect(freeRooms(doc, 'double', 6)).toBe(1);
    expect(canBookOneMore(doc, 'double', 6)).toBe(true);
    expect(canBookOneMore(doc, 'double', 5)).toBe(false);
    expect(freeRooms(doc, 'deluxe', 2)).toBe(0);
    expect(canBookOneMore(undefined, 'apartment', 0)).toBe(false);
  });
});

describe('static room catalogue (seed + fallback)', () => {
  it('matches the hardcoded site data', () => {
    const double = STATIC_ROOMS.find((r) => r.type === 'double')!;
    expect(double.basePrice).toBe(390);
    expect(double.totalRooms).toBe(6);
    expect(double.maxGuests).toBe(2);
    expect(double.images[0].url).toBe('/assets/images/room-1-a.webp');
    expect(double.details.ro.priceLabel).toBe('');
  });

  it('seeds double-balcony inactive with no price', () => {
    const balcony = STATIC_ROOMS.find((r) => r.type === 'double-balcony')!;
    expect(balcony.active).toBe(false);
    expect(balcony.basePrice).toBe(0);
    expect(balcony.totalRooms).toBe(8);
  });

  it('renders the same price labels as before', () => {
    const site = toSiteRooms(STATIC_ROOMS, '2026-10-07');
    expect(site.map((r) => r.type)).not.toContain('double-balcony');
    const label = (t: string, l: string) => roomPriceLabel(site.find((r) => r.type === t)!, l);
    expect(label('single-standard', 'ro')).toBe('de la 300 RON / noapte');
    expect(label('double', 'en')).toBe('from 390 RON / night');
    expect(label('apartment', 'ro')).toBe('de la 500-550 RON / noapte');
  });
});
