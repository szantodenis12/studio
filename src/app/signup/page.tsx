import SignupPageContent from '@/components/signup-page-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Admin Account | Hotel Maxim Oradea',
  robots: { index: false, follow: false },
};

/**
 * Route /signup Server Component. Staff-only, kept out of search results.
 */
export default function Page() {
  return <SignupPageContent />;
}
