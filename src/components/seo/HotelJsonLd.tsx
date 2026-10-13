// Hotel schema - rendered ONCE on the homepage, server-side, so it is present
// in the static HTML (AI crawlers only read the initial HTML, not the
// client-rendered DOM).
//
// Data verified 06.10.2026 (SEO handoff). Postal code: 410141 (confirmed by
// the hotel, 04.09.2026). checkinTime/checkoutTime taken from the hotel's own
// published Terms & Conditions (section 2.3) rather than invented.
//
// aggregateRating: 4.4 / 1,124 Google reviews as of 22.07.2026 (per handoff).
// This must be refreshed at deploy time with the current values from the
// hotel's Google Business Profile -- do not let this go stale.
//
// priceRange / makesOffer use the cheapest *today* nightly price across the
// active rooms (Firestore, server-rendered) -- the same "de la X RON" figure
// the rooms section shows.

import type { SiteRoom } from '@/lib/rooms/types';
import { minTodayPrice } from '@/lib/rooms/normalize';

/** Used only if no room has a price (never expected). */
const FALLBACK_FROM_PRICE = 300;

function buildHotelJsonLd(fromPrice: number) {
  return {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  '@id': 'https://www.hotel-maxim.ro/#hotel',
  name: 'Hotel Maxim',
  url: 'https://www.hotel-maxim.ro/',
  description:
    'Hotel de 4 stele în Oradea, cu camere și apartamente, restaurant, piscină interioară încălzită, saună uscată și săli de conferințe. Hotelul este la 1,1 km de centrul istoric.',
  telephone: '+40771014506',
  email: 'rezervari@hotel-maxim.ro',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Strada Victor Babeș 5',
    addressLocality: 'Oradea',
    postalCode: '410141',
    addressRegion: 'Bihor',
    addressCountry: 'RO',
  },
  starRating: { '@type': 'Rating', ratingValue: '4' },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.4',
    reviewCount: '1124',
  },
  checkinTime: '14:00',
  checkoutTime: '12:00',
  priceRange: `de la ${fromPrice} RON`,
  currenciesAccepted: 'RON',
  numberOfRooms: '39',
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Piscină interioară încălzită', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Saună uscată', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Restaurant', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Săli de conferințe', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Internet', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Parcare gratuită', value: true },
  ],
  makesOffer: {
    '@type': 'Offer',
    url: 'https://www.hotel-maxim.ro/rezervare',
    price: String(fromPrice),
    priceCurrency: 'RON',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: String(fromPrice),
      priceCurrency: 'RON',
      unitText: 'noapte',
    },
  },
  };
}

export default function HotelJsonLd({ rooms }: { rooms: SiteRoom[] }) {
  const data = buildHotelJsonLd(minTodayPrice(rooms) ?? FALLBACK_FROM_PRICE);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
