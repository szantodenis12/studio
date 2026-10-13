import HomeContent from '@/components/home-content';
import HotelJsonLd from '@/components/seo/HotelJsonLd';
import { META } from '@/lib/seo/metadata';
import { getSiteRooms } from '@/lib/rooms-server';

export const metadata = META.home;

// ISR: re-rendered at most hourly, and immediately after an admin edits rooms
// (POST /api/revalidate).
export const revalidate = 3600;

/**
 * Route / Server Component.
 * Room data (texts, prices, photos) is read from Firestore on the server so it
 * is part of the HTML crawlers see.
 */
export default async function Page() {
  const rooms = await getSiteRooms();
  return (
    <>
      <HotelJsonLd rooms={rooms} />
      <HomeContent rooms={rooms} />
    </>
  );
}
