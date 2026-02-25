import HomeContent from '@/components/home-content';

/**
 * Route / Server Component.
 * By being a server component, it handles searchParams safely during static export.
 */
export default function Page() {
  return <HomeContent />;
}
