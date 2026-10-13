import { FAQ } from '@/content/faq';

// FAQPage schema (GEO) for /intrebari-frecvente, rendered server-side.

const data = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://www.hotel-maxim.ro/intrebari-frecvente#faq',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.intrebare,
    acceptedAnswer: { '@type': 'Answer', text: f.raspuns },
  })),
};

export default function FaqJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
