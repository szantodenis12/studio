import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/admin-layout-client';

export const metadata: Metadata = {
  title: 'Admin | Hotel Maxim Oradea',
  robots: { index: false, follow: false },
};

/**
 * Server Component wrapper for the (admin) route group, so `metadata`
 * (noindex -- this is a staff-only, auth-gated dashboard) can be exported
 * from a route segment whose actual UI/auth logic is a client component.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
