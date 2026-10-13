import BookingPageContent from '@/components/booking-page-content';
import { FirebaseClientProvider } from '@/firebase';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';
import { getSiteRooms } from '@/lib/rooms-server';

export const metadata = META.rezervare;

// ISR: re-rendered at most hourly, and on demand after admin edits.
export const revalidate = 3600;

/**
 * Route /rezervare Server Component.
 * Firebase (used for live availability + submitting bookings) is only loaded
 * here and on the few other routes that actually need it, instead of in
 * the root layout, so it isn't shipped to every public marketing page.
 * The room list is rendered from server data and kept live in the form.
 */
export default async function Page() {
  const rooms = await getSiteRooms();
  return (
    <>
      <BreadcrumbJsonLd nume="Rezervare" ruta="/rezervare" />
      <FirebaseClientProvider>
        <BookingPageContent rooms={rooms} />
      </FirebaseClientProvider>
    </>
  );
}
