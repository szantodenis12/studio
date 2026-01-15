
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarInset, 
  SidebarHeader, 
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, CalendarClock, UtensilsCrossed, LogOut } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';


const NavItem = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
     <SidebarMenuItem>
      <Link href={href} passHref>
        <SidebarMenuButton isActive={isActive} asChild>
          <>
            {icon}
            <span>{label}</span>
          </>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  )
}

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
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  const isLoading = isUserLoading || (user && isProfileLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Verifying access...</p>
      </div>
    );
  }

  if (user && userProfile?.role === 'admin') {
    return (
      <SidebarProvider>
          <div className="flex h-screen bg-background">
              <Sidebar>
                  <SidebarHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg">Hotel Maxim</h2>
                      <p className="text-sm text-sidebar-foreground/70">Admin</p>
                    </div>
                  </SidebarHeader>
                  <SidebarContent className="p-2">
                    <SidebarMenu>
                      <NavItem href="/admin" icon={<LayoutDashboard />} label="Dashboard" />
                      <NavItem href="/admin/bookings" icon={<BookOpen />} label="Rezervări" />
                      <NavItem href="/admin/availability" icon={<CalendarClock />} label="Disponibilitate" />
                      <NavItem href="/admin/menu" icon={<UtensilsCrossed />} label="Meniu" />
                    </SidebarMenu>
                  </SidebarContent>
                  <SidebarFooter className="p-2">
                     <SidebarMenu>
                       <SidebarMenuItem>
                         <SidebarMenuButton onClick={handleLogout}>
                           <LogOut />
                           <span>Deconectare</span>
                         </SidebarMenuButton>
                       </SidebarMenuItem>
                     </SidebarMenu>
                  </SidebarFooter>
              </Sidebar>
              <SidebarInset>
                <header className="md:hidden flex items-center justify-start p-2 border-b">
                   <SidebarTrigger />
                   <h3 className="ml-4 font-semibold">Admin</h3>
                </header>
                {children}
              </SidebarInset>
          </div>
      </SidebarProvider>
    );
  }

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

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Redirecting...</p>
    </div>
  );
}
