
'use client';
import { collection, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { BookingData } from '@/services/booking-service';
import { StatCard } from '@/components/admin/stat-card';
import { BookingsTable } from '@/components/admin/bookings-table';
import { isToday, getMonth, format } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import ManualAvailabilityForm from '@/components/admin/manual-availability-form';

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

            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const availabilityDocRef = doc(db, 'availability', todayStr);
            
            try {
                const docSnap = await getDoc(availabilityDocRef);

                let occupiedRooms = 0;
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Sum up the counts for all room types present in the document
                    occupiedRooms = Object.keys(roomInventory).reduce((acc, roomType) => {
                        return acc + (data[roomType] || 0);
                    }, 0);
                }
                
                setAvailableRooms(totalRooms - occupiedRooms);
            } catch (e) {
                console.error("Error fetching availability for today:", e);
                // In case of error, maybe show a fallback value
                setAvailableRooms(totalRooms); 
            }
        };

        calculateAvailableRooms();
        // This will now recalculate whenever new bookings are added, which is a good trigger
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

  const handleManualUpdate = async () => {
     if (!db) return;

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const availabilityDocRef = doc(db, 'availability', todayStr);
       try {
          const docSnap = await getDoc(availabilityDocRef);
          let occupiedRooms = 0;
          if (docSnap.exists()) {
              const data = docSnap.data();
              occupiedRooms = Object.keys(roomInventory).reduce((acc, roomType) => {
                  return acc + (data[roomType] || 0);
              }, 0);
          }
          setAvailableRooms(totalRooms - occupiedRooms);
      } catch (e) {
          console.error("Error re-fetching availability:", e);
      }
  }

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
      <div className="grid gap-4 md:grid-cols-2">
          <ManualAvailabilityForm onUpdate={handleManualUpdate} />
      </div>
      <div>
        {isLoading && <p>Se încarcă rezervările...</p>}
        {error && <p className="text-red-500">Eroare la încărcarea rezervărilor: {error.message}</p>}
        {bookings && <BookingsTable data={bookings} />}
      </div>
    </div>
  );
}
