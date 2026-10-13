// Restaurant schema, rendered server-side on /restaurant.
// The restaurant is open to the public, not just hotel guests (confirmed 04.09.2026).

const data = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': 'https://www.hotel-maxim.ro/restaurant#restaurant',
  name: 'Restaurant Hotel Maxim',
  url: 'https://www.hotel-maxim.ro/restaurant',
  description:
    'Restaurant în Oradea, în Hotel Maxim, deschis și publicului, cu meniu propriu și preparate servite zilnic.',
  telephone: '+40771014506',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Strada Victor Babeș 5',
    addressLocality: 'Oradea',
    postalCode: '410141',
    addressRegion: 'Bihor',
    addressCountry: 'RO',
  },
  containedInPlace: { '@id': 'https://www.hotel-maxim.ro/#hotel' },
};

export default function RestaurantJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
