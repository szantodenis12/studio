
'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Create a memoized document reference for the user's profile
  const userProfileRef = useMemo(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  // Fetch the user's profile data
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ role: string }>(userProfileRef);

  useEffect(() => {
    // Wait until user loading and profile loading are complete
    if (isUserLoading || isProfileLoading) {
      return;
    }

    // If no user is logged in, redirect to login page
    if (!user) {
      router.replace('/login');
      return;
    }

    // If user profile exists, check for admin role
    if (userProfile?.role !== 'admin') {
      // If not an admin, redirect to the home page (or a "not authorized" page)
      console.warn('User does not have admin role. Redirecting.');
      router.replace('/');
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  // Show a loading screen while checking auth and role
  if (isUserLoading || isProfileLoading || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Verifying access...</p>
      </div>
    );
  }

  // If user is an admin, render the dashboard layout
  return (
    <SidebarProvider>
        <div className="flex h-screen">
            <Sidebar>
                <SidebarContent className="p-4">
                    <h2 className="font-bold text-lg">Hotel Maxim</h2>
                    <p className="text-sm text-sidebar-foreground/70">Admin Panel</p>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>{children}</SidebarInset>
        </div>
    </SidebarProvider>
  );
}
