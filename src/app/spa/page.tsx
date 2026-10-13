import SpaPageContent from '@/components/spa-page-content';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';

export const metadata = META.spa;

/**
 * Route /spa Server Component.
 */
export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd nume="Spa" ruta="/spa" />
      <SpaPageContent />
    </>
  );
}
