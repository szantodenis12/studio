
'use client';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import type { BookingData } from '@/services/booking-service';
import { StatCard } from '@/components/admin/stat-card';
import { BookingsTable } from '@/components/admin/bookings-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, BedDouble, Wallet } from 'lucide-react';
import { isToday, getMonth, format } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import { roomInventory, totalRooms } from '@/lib/room-inventory';
import ManualAvailabilityForm from '@/components/admin/manual-availability-form';

type AvailabilityData = {
    [roomType: string]: number;
}

export default function AdminDashboard() {
  const db = useFirestore();
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: bookings, isLoading, error } = useCollection<BookingData>(bookingsQuery);

  const [todayStr, setTodayStr] = useState('');
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);

  useEffect(() => {
    // Ensures new Date() is only called on the client, avoiding hydration mismatches.
    setTodayStr(format(new Date(), 'yyyy-MM-dd'));
    setCurrentMonth(getMonth(new Date()));
  }, []);
  
  const availabilityDocRef = useMemoFirebase(() => {
    if(!db || !todayStr) return null; // Guard against empty initial todayStr
    return doc(db, 'availability', todayStr);
  }, [db, todayStr, updateTrigger]); // Force re-fetch when a manual booking is added

  const { data: todaysAvailability } = useDoc<AvailabilityData>(availabilityDocRef);

  const availableRooms = useMemo(() => {
    if (!todaysAvailability) {
        return totalRooms;
    }
    const occupiedRooms = Object.values(todaysAvailability).reduce((acc, count) => {
        if (typeof count === 'number') {
            return acc + count;
        }
        return acc;
    }, 0);
    return totalRooms - occupiedRooms;
  }, [todaysAvailability]);


  const stats = useMemo(() => {
    if (!bookings || currentMonth === null) {
      return {
        bookingsToday: 0,
        monthlyRevenue: 0,
      };
    }

    const bookingsToday = bookings.filter(b => b.createdAt && isToday(new Date(b.createdAt.seconds * 1000))).length;
    
    const monthlyRevenue = bookings.reduce((acc, booking) => {
        const bookingMonth = booking.createdAt ? getMonth(new Date(booking.createdAt.seconds * 1000)) : -1;
        if (booking.status === 'Confirmed' && bookingMonth === currentMonth) {
            return acc + (booking.totalPrice || 0);
        }
        return acc;
    }, 0);

    return {
      bookingsToday,
      monthlyRevenue,
    };
  }, [bookings, currentMonth]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Panou General</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Rezervări Astăzi" value={stats.bookingsToday} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Camere Disponibile Acum" value={availableRooms} icon={<BedDouble className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Venituri Lunare" value={`${stats.monthlyRevenue.toFixed(2)} RON`} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Rezervări</CardTitle>
                    <CardDescription>
                        Afișează rezervările. Implicit sunt afișate cele din ultimele 7 zile. Folosește filtrele pentru a căuta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p>Se încarcă rezervările...</p>}
                    {error && <p className="text-red-500">Eroare la încărcarea rezervărilor: {error.message}</p>}
                    {bookings && <BookingsTable data={bookings} defaultDateFilter="7" />}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <ManualAvailabilityForm onUpdate={() => setUpdateTrigger(v => v + 1)} />
        </div>
      </div>
    </div>
  );
}
