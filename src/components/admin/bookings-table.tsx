
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Download } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { BookingData } from '@/services/booking-service';
import { toDate } from '@/lib/firestore-utils';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { deleteBooking, setBookingStatus } from '@/services/booking-service';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BookingsTableProps {
  data: BookingData[];
  defaultDateFilter?: string;
}

const bookingStatuses = ["New", "Confirmed", "Email Sent", "Cancelled"];
const statusTranslations: { [key: string]: string } = {
  "New": "Nouă",
  "Confirmed": "Confirmată",
  "Email Sent": "Email Trimis",
  "Cancelled": "Anulată"
};

const paymentMethodTranslations: { [key: string]: string } = {
  'property': 'La Hotel',
  'card': 'Card Online',
  'Booking.com': 'Booking.com',
  'Travelminit': 'Travelminit',
  'Phone': 'Telefon',
};

export function BookingsTable({ data, defaultDateFilter = 'all' }: BookingsTableProps) {
  const [filter, setFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(defaultDateFilter);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<BookingData | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const db = useFirestore();
  const { toast } = useToast();

  const filteredData = data.filter(booking => {
    if (!booking.createdAt) return false;

    const nameMatch = booking.fullName.toLowerCase().includes(filter.toLowerCase());
    const roomMatch = roomFilter === 'all' || booking.roomType === roomFilter;
    
    const bookingDate = toDate(booking.createdAt);
    const now = new Date();
    let dateMatch = true;
    if (dateFilter !== 'all') {
        const days = parseInt(dateFilter, 10);
        if (!isNaN(days)) {
            dateMatch = isAfter(bookingDate, subDays(now, days));
        }
    }

    return nameMatch && roomMatch && dateMatch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'default';
      case 'New':
        return 'secondary';
      case 'Email Sent':
        return 'outline';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const roomTypeTranslations: { [key: string]: string } = {
    'double': 'Dublă/Twin Standard',
    'deluxe': 'Dublă/Twin Deluxe',
    'apartment': 'Apartament',
    'triple': 'Triplă Deluxe',
    'single-standard': 'Single Standard',
    'single-deluxe': 'Single Deluxe',
    'double-balcony': 'Dublă cu Balcon',
  };
  
  const handleDeleteClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBooking || !selectedBooking.id || !db) return;
    
    setIsDeleting(true);

    try {
        // Frees the nights only if the booking still held them (a cancelled
        // booking already released its rooms).
        await deleteBooking(db, selectedBooking.id);
        toast({
            title: 'Rezervare ștearsă',
            description: `Rezervarea pentru ${selectedBooking.fullName} a fost ștearsă cu succes.`,
        });
    } catch(error: any) {
         toast({
            variant: 'destructive',
            title: 'Eroare la ștergere',
            description: error.message || 'A apărut o problemă la ștergerea rezervării.',
        });
    } finally {
        setIsDeleting(false);
        setDialogOpen(false);
        setSelectedBooking(null);
    }
  };

  const handleStatusChange = async (booking: BookingData, newStatus: string) => {
    if (!booking.id || !db) return;
    if (newStatus === 'Cancelled') {
      // Ask first: cancelling frees the room for other guests.
      setCancelTarget(booking);
      return;
    }
    await applyStatus(booking, newStatus);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    await applyStatus(cancelTarget, 'Cancelled');
    setIsCancelling(false);
    setCancelTarget(null);
  };

  const applyStatus = async (booking: BookingData, newStatus: string) => {
    if (!booking.id || !db) return;

    try {
        // Transaction: cancelling frees the nights; re-activating a cancelled
        // booking re-reserves them (fails if the room type is full).
        await setBookingStatus(db, booking.id, newStatus);
        toast({
            title: 'Status Actualizat',
            description: `Statusul rezervării pentru ${booking.fullName} este acum "${statusTranslations[newStatus] || newStatus}".`,
        });
    } catch(error: any) {
         toast({
            variant: 'destructive',
            title: 'Eroare la actualizare',
            description: error.message || 'A apărut o problemă la actualizarea statusului.',
        });
    }
  };


  const handleExport = () => {
    if (!filteredData.length) {
      toast({
        variant: 'destructive',
        title: 'Nu există date de exportat',
        description: 'Vă rugăm să ajustați filtrele sau să așteptați încărcarea rezervărilor.',
      });
      return;
    }

    const headers = ['Full Name', 'Email', 'Phone'];
    const rows = filteredData.map(booking => [
      `"${booking.fullName.replace(/"/g, '""')}"`,
      booking.email,
      booking.phone
    ]);

    // Prepend BOM for Excel compatibility with UTF-8
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    const dateFilterOptions: { [key: string]: string } = {
      'all': 'all-time',
      '7': 'ultimele-7-zile',
      '30': 'ultimele-30-zile',
      '365': 'ultimele-12-luni'
    };
    const dateFilterText = dateFilterOptions[dateFilter] || 'custom';
    
    link.setAttribute('download', `client-list-${dateFilterText}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 flex-wrap">
        <Input
          placeholder="Filtrează după nume..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="max-w-sm"
        />
        <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrează după cameră" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Toate Camerele</SelectItem>
                <SelectItem value="single-standard">Single Standard</SelectItem>
                <SelectItem value="single-deluxe">Single Deluxe</SelectItem>
                <SelectItem value="double">Dublă/Twin Standard</SelectItem>
                <SelectItem value="deluxe">Dublă/Twin Deluxe</SelectItem>
                <SelectItem value="double-balcony">Dublă cu Balcon</SelectItem>
                <SelectItem value="apartment">Apartament</SelectItem>
                <SelectItem value="triple">Triplă Deluxe</SelectItem>
            </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrează după perioadă" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Toate perioadele</SelectItem>
                <SelectItem value="7">Ultimele 7 zile</SelectItem>
                <SelectItem value="30">Ultimele 30 de zile</SelectItem>
                <SelectItem value="365">Ultimele 12 luni</SelectItem>
            </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Oaspete</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Tip Cameră</TableHead>
              <TableHead>Persoane</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Preț Total</TableHead>
              <TableHead>Sursa/Plata</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Acțiuni</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.fullName}</TableCell>
                  <TableCell>{booking.email}</TableCell>
                  <TableCell>{booking.phone}</TableCell>
                  <TableCell>{roomTypeTranslations[booking.roomType] || booking.roomType}</TableCell>
                  <TableCell className="font-semibold">{booking.guests || '—'}</TableCell>
                  <TableCell>{format(toDate(booking.checkIn), 'PP', { locale: ro })}</TableCell>
                  <TableCell>{format(toDate(booking.checkOut), 'PP', { locale: ro })}</TableCell>
                   <TableCell>{(booking.totalPrice || 0).toFixed(2)} RON</TableCell>
                   <TableCell>{paymentMethodTranslations[booking.paymentMethod] || booking.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status || 'New')}>{statusTranslations[booking.status || 'New'] || booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acțiuni</DropdownMenuLabel>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editare Status</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                  {bookingStatuses.map(status => (
                                      <DropdownMenuItem
                                          key={status}
                                          onClick={() => handleStatusChange(booking, status)}
                                          disabled={booking.status === status}
                                      >
                                          {statusTranslations[status]}
                                      </DropdownMenuItem>
                                  ))}
                              </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(booking)}>
                            <Trash2 className="mr-2 h-4 w-4" />Ștergere
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Niciun rezultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!open && !isCancelling) setCancelTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anulați rezervarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Rezervarea pentru <span className="font-bold">{cancelTarget?.fullName}</span>
              {cancelTarget ? <> ({roomTypeTranslations[cancelTarget.roomType] || cancelTarget.roomType}, {format(toDate(cancelTarget.checkIn), 'PPP', { locale: ro })} – {format(toDate(cancelTarget.checkOut), 'PPP', { locale: ro })})</> : null}
              {' '}va fi marcată ca anulată, iar camera devine din nou disponibilă pentru acele nopți. O puteți reactiva ulterior doar dacă mai există camere libere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Înapoi</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleConfirmCancel(); }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Se anulează...' : 'Da, anulează rezervarea'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DeleteConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        booking={selectedBooking}
      />
    </div>
  );
}
