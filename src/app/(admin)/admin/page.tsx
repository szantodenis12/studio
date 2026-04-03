
import DashboardContent from '@/components/admin/dashboard-content';

/**
 * Route /admin Server Component.
 * Ensures compatibility with 'output: export' by avoiding searchParams issues in pre-rendering.
 */
export default function Page() {
  return <DashboardContent />;
}
