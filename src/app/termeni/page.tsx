import TermsPageContent from '@/components/terms-page-content';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';

export const metadata = META.termeni;

/**
 * Route /termeni Server Component.
 */
export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd nume="Termeni și Condiții" ruta="/termeni" />
      <TermsPageContent />
    </>
  );
}
