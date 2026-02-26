import RestaurantPageContent from '@/components/restaurant-page-content';

/**
 * Route /restaurant Server Component.
 * By being a server component, it avoids issues with searchParams serialization during static export.
 */
export default function Page() {
  return <RestaurantPageContent />;
}
