import TarifePageContent from '@/components/tarife-page-content';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';
import { getSiteRooms } from '@/lib/rooms-server';

export const metadata = META.tarife;

// ISR: re-rendered at most hourly, and on demand after admin edits.
export const revalidate = 3600;

/**
 * Route /tarife Server Component.
 */
export default async function Page() {
  const rooms = await getSiteRooms();
  return (
    <>
      <BreadcrumbJsonLd nume="Tarife" ruta="/tarife" />
      <TarifePageContent rooms={rooms} />
    </>
  );
}
