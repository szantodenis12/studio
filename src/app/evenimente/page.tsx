import EventsPageContent from '@/components/events-page-content';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';

export const metadata = META.evenimente;

/**
 * Route /evenimente Server Component.
 */
export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd nume="Evenimente" ruta="/evenimente" />
      <EventsPageContent />
    </>
  );
}
