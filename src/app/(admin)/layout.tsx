
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
    // 1. Wait until the initial user authentication check is complete.
    if (isUserLoading) {
      return;
    }

    // 2. If no user is logged in after the check, redirect to the login page.
    if (!user) {
      router.replace('/login');
      return;
    }
    
    // 3. If a user is logged in, but we are still loading their profile, wait.
    if (isProfileLoading) {
        return;
    }

    // 4. Once the user and their profile are loaded, check their role.
    // If they don't have an admin role, redirect them away.
    if (userProfile?.role !== 'admin') {
      console.warn('User does not have admin role. Redirecting.');
      router.replace('/');
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  // Show a loading screen while checking authentication and then the user's role.
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Verifying access...</p>
      </div>
    );
  }

  // If the user is a verified admin, render the dashboard layout.
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

  // This is a fallback state, typically shown briefly during the redirect process.
  return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Redirecting...</p>
      </div>
  );
}
