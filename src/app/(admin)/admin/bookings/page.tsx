
'use client';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { BookingData } from '@/services/booking-service';
import { BookingsTable } from '@/components/admin/bookings-table';

export default function AdminBookingsPage() {
  const db = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: bookings, isLoading, error } = useCollection<BookingData>(bookingsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Rezervări</h2>
      </div>
      <div>
        {isLoading && <p>Se încarcă rezervările...</p>}
        {error && <p className="text-red-500">Eroare la încărcarea rezervărilor: {error.message}</p>}
        {bookings && <BookingsTable data={bookings} />}
      </div>
    </div>
  );
}
