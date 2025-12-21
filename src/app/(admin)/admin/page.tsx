
'use client';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { BookingData } from '@/services/booking-service';
import { StatCard } from '@/components/admin/stat-card';
import { BookingsTable } from '@/components/admin/bookings-table';
import { isToday, getMonth } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';

const roomInventory = {
    'single': 5,
    'double': 10,
    'deluxe': 3,
};
const totalRooms = Object.values(roomInventory).reduce((acc, count) => acc + count, 0);

export default function AdminDashboard() {
  const db = useFirestore();
  const [availableRooms, setAvailableRooms] = useState(totalRooms);

  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: bookings, isLoading, error } = useCollection<BookingData>(bookingsQuery);

    useEffect(() => {
        const calculateAvailableRooms = async () => {
            if (!db) return;

            const todayStr = new Date().toISOString().split('T')[0];
            const availabilityRef = collection(db, 'availability');
            const q = query(availabilityRef, where('date', '==', todayStr));
            
            const querySnapshot = await getDocs(q);

            let occupiedRooms = 0;
            querySnapshot.forEach(doc => {
                const data = doc.data();
                occupiedRooms += (data.bookingCount || 0);
            });
            
            setAvailableRooms(totalRooms - occupiedRooms);
        };

        calculateAvailableRooms();
        // Recalculate when new bookings come in
    }, [bookings, db]);


  const stats = useMemo(() => {
    if (!bookings) {
      return {
        bookingsToday: 0,
        monthlyRevenue: 0,
      };
    }
    
    const currentMonth = getMonth(new Date());

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
  }, [bookings]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Panou de Administrare</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Rezervări Astăzi" value={stats.bookingsToday} />
        <StatCard title="Camere Disponibile Acum" value={availableRooms} />
        <StatCard title="Venituri Lunare" value={`${stats.monthlyRevenue.toFixed(2)} RON`} />
      </div>
      <div>
        {isLoading && <p>Se încarcă rezervările...</p>}
        {error && <p className="text-red-500">Eroare la încărcarea rezervărilor: {error.message}</p>}
        {bookings && <BookingsTable data={bookings} />}
      </div>
    </div>
  );
}
