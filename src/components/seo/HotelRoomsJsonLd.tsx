import type { SiteRoom } from '@/lib/rooms/types';

// HotelRoom schema for every active room type, rendered server-side on /camere.
//
// Built from the same server-fetched room data (Firestore `rooms`, falling
// back to room-data.ts) that the /camere page renders, so prices and
// amenities can never drift out of sync between the page and the schema.
// The price is today's nightly price (base price or the active date-range
// override), i.e. exactly the "de la X RON / noapte" shown on the page.

const BASE = 'https://www.hotel-maxim.ro';

function firstNumber(text: string): string | undefined {
  return text.match(/\d+/)?.[0];
}

/** "de la 500-550 RON / noapte" -> [500, 550] */
function priceRange(label: string): [number, number] | null {
  const m = label.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!m) return null;
  const low = Number(m[1]);
  const high = Number(m[2]);
  return low > 0 && high >= low ? [low, high] : null;
}

export function buildHotelRoomsJsonLd(rooms: SiteRoom[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': rooms.map((room) => {
      const details = room.details.ro;
      const floorSizeSpec = room.specs.find((s) => s.icon === 'Square');
      const occupancySpec = room.specs.find((s) => s.icon === 'User' || s.icon === 'Users');
      const floorSize = floorSizeSpec ? firstNumber(floorSizeSpec.text) : undefined;
      const maxOccupancy = occupancySpec ? firstNumber(occupancySpec.text) : undefined;

      const amenityFeature = room.amenities.map((amenity) => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity.ro,
        value: true,
      }));

      // A room whose custom price text is a range (the apartment:
      // "500-550 RON/noapte") is published as an AggregateOffer.
      const range = details.priceLabel ? priceRange(details.priceLabel) : null;
      const offers = range
        ? {
            '@type': 'AggregateOffer',
            lowPrice: String(range[0]),
            highPrice: String(range[1]),
            priceCurrency: 'RON',
            url: `${BASE}/rezervare`,
          }
        : {
            '@type': 'Offer',
            price: String(room.todayPrice),
            priceCurrency: 'RON',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: String(room.todayPrice),
              priceCurrency: 'RON',
              unitText: 'noapte',
            },
            url: `${BASE}/rezervare`,
          };

      return {
        '@type': 'HotelRoom',
        '@id': `${BASE}/camere#${room.slug}`,
        name: details.title,
        url: `${BASE}/camere#${room.slug}`,
        containedInPlace: { '@id': `${BASE}/#hotel` },
        ...(maxOccupancy ? { occupancy: { '@type': 'QuantitativeValue', maxValue: Number(maxOccupancy) } } : {}),
        ...(floorSize ? { floorSize: { '@type': 'QuantitativeValue', value: floorSize, unitCode: 'MTK' } } : {}),
        amenityFeature,
        offers,
      };
    }),
  };
}

export default function HotelRoomsJsonLd({ rooms }: { rooms: SiteRoom[] }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so admin-entered text can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHotelRoomsJsonLd(rooms)).replace(/</g, '\\u003c') }}
    />
  );
}
