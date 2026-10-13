
'use client';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import type { BookingData } from '@/services/booking-service';
import { toDate } from '@/lib/firestore-utils';
import { StatCard } from '@/components/admin/stat-card';
import { BookingsTable } from '@/components/admin/bookings-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, BedDouble, Wallet } from 'lucide-react';
import { isToday, getMonth, format } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import { normalizeRoom } from '@/lib/rooms/normalize';
import { STATIC_ROOMS } from '@/lib/rooms/static-rooms';
import { freeRooms, type AvailabilityDoc } from '@/lib/rooms/pricing';

type AvailabilityData = AvailabilityDoc;

export default function DashboardContent() {
  const db = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: bookings, isLoading, error } = useCollection<BookingData>(bookingsQuery);

  const [todayStr, setTodayStr] = useState('');
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);

  useEffect(() => {
    setTodayStr(format(new Date(), 'yyyy-MM-dd'));
    setCurrentMonth(getMonth(new Date()));
  }, []);
  
  const availabilityDocRef = useMemoFirebase(() => {
    if(!db || !todayStr) return null;
    return doc(db, 'availability', todayStr);
  }, [db, todayStr]);

  const { data: todaysAvailability } = useDoc<AvailabilityData>(availabilityDocRef);

  const roomsQuery = useMemoFirebase(() => (db ? collection(db, 'rooms') : null), [db]);
  const { data: roomDocs } = useCollection<Record<string, unknown>>(roomsQuery);

  // Free rooms tonight across all active room types (inventory from Firestore,
  // minus booked and manually blocked rooms).
  const availableRooms = useMemo(() => {
    const rooms = roomDocs && roomDocs.length
      ? roomDocs.map(d => normalizeRoom(d.id, d))
      : STATIC_ROOMS;
    return rooms
      .filter(r => r.active)
      .reduce((acc, r) => acc + freeRooms(todaysAvailability, r.type, r.totalRooms), 0);
  }, [todaysAvailability, roomDocs]);


  const stats = useMemo(() => {
    if (!bookings || currentMonth === null) {
      return {
        bookingsToday: 0,
        monthlyRevenue: 0,
      };
    }

    const bookingsToday = bookings.filter(b => b.createdAt && isToday(toDate(b.createdAt))).length;

    const monthlyRevenue = bookings.reduce((acc, booking) => {
        const bookingMonth = booking.createdAt ? getMonth(toDate(booking.createdAt)) : -1;
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
       <div className="space-y-8">
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
    </div>
  );
}
