
'use client';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { BookingData } from '@/services/booking-service';
import { StatCard } from '@/components/admin/stat-card';
import { BookingsTable } from '@/components/admin/bookings-table';
import { isToday } from 'date-fns';
import { useMemo } from 'react';

export default function AdminDashboard() {
  const db = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: bookings, isLoading, error } = useCollection<BookingData>(bookingsQuery);

  const stats = useMemo(() => {
    if (!bookings) {
      return {
        bookingsToday: 0,
        monthlyRevenue: 0,
        // availableRooms needs a more complex calculation based on total rooms vs occupied
      };
    }

    const bookingsToday = bookings.filter(b => b.createdAt && isToday(new Date(b.createdAt.seconds * 1000))).length;
    
    const monthlyRevenue = bookings.reduce((acc, booking) => {
        // Assuming booking.totalPrice exists
        return acc + (booking.totalPrice || 0);
    }, 0);

    return {
      bookingsToday,
      monthlyRevenue,
    };
  }, [bookings]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Bookings Today" value={stats.bookingsToday} />
        <StatCard title="Available Rooms Now" value={12} description="Dummy data" />
        <StatCard title="Monthly Revenue" value={`$${stats.monthlyRevenue.toFixed(2)}`} />
      </div>
      <div>
        {isLoading && <p>Loading bookings...</p>}
        {error && <p className="text-red-500">Error loading bookings: {error.message}</p>}
        {bookings && <BookingsTable data={bookings} />}
      </div>
    </div>
  );
}
