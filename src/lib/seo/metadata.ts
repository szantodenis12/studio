import type { Metadata } from 'next';

// Title + meta description + canonical + Open Graph/Twitter for every route.
// Adapted from the SEO handoff package (PACHET_SEO_SITE_2026-10, 06.10.2026).
//
// Usage: in app/layout.tsx -> `metadataBase: new URL(BASE_URL), ...META.home`.
// On every other static page -> `export const metadata = META.camere` etc.
//
// Mandatory condition from the handoff: title, description, canonical and
// JSON-LD must exist in the HTML served by the server (server components /
// build time), never injected from the client only -- AI crawlers (GPTBot,
// PerplexityBot, ClaudeBot) only read the initial HTML.

export const BASE_URL = 'https://www.hotel-maxim.ro';
export const SITE_NAME = 'Hotel Maxim';

function pagina(
  title: string,
  description: string,
  canonical: string,
  image: string
): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'ro_RO',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export const META = {
  home: pagina(
    'Hotel Maxim Oradea | Hotel 4 stele cu spa',
    'Hotel de 4 stele în Oradea, la 1,1 km de centru. Camere, restaurant, piscină interioară, saună uscată și săli de conferințe.',
    '/',
    '/assets/images/hero-background.webp'
  ),
  camere: pagina(
    'Camere Hotel Maxim Oradea | De la 300 RON',
    'Camere și apartamente în Oradea, de la 300 RON/noapte. Mic dejun, internet, parcare, piscină și fitness incluse. Taxa locală se achită separat.',
    '/camere',
    '/assets/images/room-2-a.webp'
  ),
  spa: pagina(
    'Hotel cu piscină în Oradea | Spa Hotel Maxim',
    'Piscină interioară încălzită și saună uscată în Oradea. Acces spa pentru vizitatori, cu tarife afișate pe site.',
    '/spa',
    '/assets/images/spa-main.webp'
  ),
  restaurant: pagina(
    'Restaurant în Oradea | Hotel Maxim',
    'Restaurant în Oradea, în Hotel Maxim, cu meniu propriu și preparate servite zilnic. Pentru rezervări, sunați la 0771 014 506.',
    '/restaurant',
    '/assets/images/restaurant-main.webp'
  ),
  evenimente: pagina(
    'Sală conferințe Oradea | Hotel Maxim',
    'Săli de conferințe și evenimente în Oradea, pentru 16 până la 100 de persoane. Wi-Fi, videoproiector, ecran, flipchart și catering.',
    '/evenimente',
    '/assets/images/events-main.webp'
  ),
  tarife: pagina(
    'Tarife cazare Hotel Maxim Oradea',
    'Tarife cazare Hotel Maxim Oradea: camere de la 300 RON/noapte. Taxa locală de 3% se achită separat la check-in.',
    '/tarife',
    '/assets/images/room-1-a.webp'
  ),
  undeSuntem: pagina(
    'Hotel central în Oradea | Unde suntem',
    'Hotel Maxim este pe Strada Victor Babeș 5, Oradea, la 1,1 km de centrul istoric. Vedeți adresa, reperele și datele de contact.',
    '/unde-suntem',
    '/assets/images/hero-background.webp'
  ),
  rezervare: pagina(
    'Rezervare Hotel Maxim Oradea',
    'Rezervați direct la Hotel Maxim Oradea. Completați formularul sau sunați la 0771 014 506 pentru camere, spa, restaurant sau evenimente.',
    '/rezervare',
    '/assets/images/room-2-a.webp'
  ),
  intrebariFrecvente: pagina(
    'Întrebări frecvente | Hotel Maxim Oradea',
    'Răspunsuri despre cazare, spa, restaurant, tarife, distanța până în centru și evenimente la Hotel Maxim Oradea.',
    '/intrebari-frecvente',
    '/assets/images/hero-background.webp'
  ),
  // Not part of the handoff's 9-page list, but the audit's core complaint was
  // "every page shares the same title/description" -- that applies here too.
  termeni: pagina(
    'Termeni și Condiții | Hotel Maxim Oradea',
    'Termenii și condițiile de rezervare, plată, anulare și cazare la Hotel Maxim Oradea.',
    '/termeni',
    '/assets/images/hero-background.webp'
  ),
  politicaCookie: pagina(
    'Politica de Cookies | Hotel Maxim Oradea',
    'Politica de utilizare a cookie-urilor pe site-ul Hotel Maxim Oradea.',
    '/politica-cookie',
    '/assets/images/hero-background.webp'
  ),
} as const;
