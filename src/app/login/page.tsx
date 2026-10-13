import LoginPageContent from '@/components/login-page-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Login | Hotel Maxim Oradea',
  robots: { index: false, follow: false },
};

/**
 * Route /login Server Component. Staff-only, kept out of search results.
 */
export default function Page() {
  return <LoginPageContent />;
}
