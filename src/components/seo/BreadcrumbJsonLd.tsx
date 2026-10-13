// BreadcrumbList schema, parameterized. Rendered server-side on every subpage:
//   <BreadcrumbJsonLd nume="Camere" ruta="/camere" />

const BASE = 'https://www.hotel-maxim.ro';

export default function BreadcrumbJsonLd({ nume, ruta }: { nume: string; ruta: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${BASE}${ruta}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Acasă', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: nume, item: `${BASE}${ruta}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
