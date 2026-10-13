import type { MetadataRoute } from 'next';
import { getRoomsLastModified } from '@/lib/rooms-server';

// Generates https://www.hotel-maxim.ro/sitemap.xml.
// Regenerated hourly (and on demand from POST /api/revalidate after an admin
// edits rooms). Pages showing room data (/, /camere, /tarife, /rezervare) get
// `lastModified` = the latest room edit; the rest keep a fixed date that should
// be bumped when their content changes.

export const revalidate = 3600;

const BASE = 'https://www.hotel-maxim.ro';
const CONTENT_LAST_MODIFIED = new Date('2026-10-07T00:00:00Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const roomsModified = (await getRoomsLastModified()) ?? CONTENT_LAST_MODIFIED;
  const rooms = roomsModified > CONTENT_LAST_MODIFIED ? roomsModified : CONTENT_LAST_MODIFIED;
  const fixed = CONTENT_LAST_MODIFIED;

  return [
    { url: `${BASE}/`, lastModified: rooms, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/camere`, lastModified: rooms, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/rezervare`, lastModified: rooms, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/spa`, lastModified: fixed, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/restaurant`, lastModified: fixed, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/evenimente`, lastModified: fixed, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/tarife`, lastModified: rooms, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/unde-suntem`, lastModified: fixed, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/intrebari-frecvente`, lastModified: fixed, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/termeni`, lastModified: fixed, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/politica-cookie`, lastModified: fixed, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
