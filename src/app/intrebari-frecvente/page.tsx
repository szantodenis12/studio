import IntrebariFrecventePageContent from '@/components/intrebari-frecvente-page-content';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';

export const metadata = META.intrebariFrecvente;

/**
 * Route /intrebari-frecvente Server Component.
 */
export default function Page() {
  return (
    <>
      <FaqJsonLd />
      <BreadcrumbJsonLd nume="Întrebări frecvente" ruta="/intrebari-frecvente" />
      <IntrebariFrecventePageContent />
    </>
  );
}
