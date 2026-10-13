import RestaurantPageContent from '@/components/restaurant-page-content';
import { FirebaseClientProvider } from '@/firebase';
import RestaurantJsonLd from '@/components/seo/RestaurantJsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';

export const metadata = META.restaurant;

/**
 * Route /restaurant Server Component.
 * By being a server component, it avoids issues with searchParams serialization during static export.
 * Firebase (used to load the menu) is scoped to this route instead of the root
 * layout, so it isn't shipped to every public marketing page.
 */
export default function Page() {
  return (
    <>
      <RestaurantJsonLd />
      <BreadcrumbJsonLd nume="Restaurant" ruta="/restaurant" />
      <FirebaseClientProvider>
        <RestaurantPageContent />
      </FirebaseClientProvider>
    </>
  );
}
