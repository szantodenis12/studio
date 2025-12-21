
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ role: string }>(userProfileRef);

  useEffect(() => {
    // If auth state or profile is still loading, don't do anything yet.
    if (isUserLoading || isProfileLoading) {
      return;
    }

    // After loading, if there's no user, redirect to login.
    if (!user) {
      router.replace('/login');
      return;
    }

    // If there is a user, but their profile doesn't have the 'admin' role, redirect to home.
    if (userProfile?.role !== 'admin') {
      console.warn('User is not an admin. Redirecting to home.');
      router.replace('/');
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  // Unified loading state: show while checking auth OR fetching profile.
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Verifying access...</p>
      </div>
    );
  }

  // If we have a user and their profile confirms they are an admin, show the dashboard.
  if (user && userProfile?.role === 'admin') {
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

  // Fallback state while redirects are in-flight.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Redirecting...</p>
    </div>
  );
}
