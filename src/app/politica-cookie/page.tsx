import CookiePolicyPageContent from '@/components/cookie-policy-page-content';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';

export const metadata = META.politicaCookie;

/**
 * Route /politica-cookie Server Component.
 */
export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd nume="Politica de Cookies" ruta="/politica-cookie" />
      <CookiePolicyPageContent />
    </>
  );
}
