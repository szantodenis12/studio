import RoomsPageContent from '@/components/rooms-page-content';
import HotelRoomsJsonLd from '@/components/seo/HotelRoomsJsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';
import { getSiteRooms } from '@/lib/rooms-server';

export const metadata = META.camere;

// ISR: re-rendered at most hourly, and on demand after admin edits.
export const revalidate = 3600;

/**
 * Route /camere Server Component.
 */
export default async function Page() {
  const rooms = await getSiteRooms();
  return (
    <>
      <HotelRoomsJsonLd rooms={rooms} />
      <BreadcrumbJsonLd nume="Camere" ruta="/camere" />
      <RoomsPageContent rooms={rooms} />
    </>
  );
}
