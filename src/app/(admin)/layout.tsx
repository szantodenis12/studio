
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
    // If we are not in the initial loading state and there is no user,
    // redirect to the login page.
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // Unified loading state: show while checking auth OR fetching the profile for a logged-in user.
  const isLoading = isUserLoading || (user && isProfileLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Verifying access...</p>
      </div>
    );
  }

  // After all loading is complete, we can make a final decision.

  // If there is a user and they are an admin, show the dashboard.
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

  // If there is a user but they are NOT an admin, show a permission denied message.
  if (user && userProfile?.role !== 'admin') {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-lg text-gray-600 mt-2">You do not have permission to view this page.</p>
            </div>
        </div>
    );
  }

  // Fallback for the brief moment before the useEffect redirect kicks in for non-logged-in users.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Redirecting...</p>
    </div>
  );
}
