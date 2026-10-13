import ContactPageContent from '@/components/contact-page-content';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { META } from '@/lib/seo/metadata';

export const metadata = META.undeSuntem;

/**
 * Route /unde-suntem Server Component.
 * (Previously /contact -- the page covers both location/directions and the
 * contact form, which matches this route's SEO intent from the handoff.)
 */
export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd nume="Unde suntem" ruta="/unde-suntem" />
      <ContactPageContent />
    </>
  );
}
