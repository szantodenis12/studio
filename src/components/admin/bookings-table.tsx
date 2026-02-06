
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
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { BookingData } from '@/services/booking-service';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { deleteBooking } from '@/services/booking-service';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

interface BookingsTableProps {
  data: BookingData[];
}

export function BookingsTable({ data }: BookingsTableProps) {
  const [filter, setFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const db = useFirestore();
  const { toast } = useToast();

  const filteredData = data.filter(booking => {
    const nameMatch = booking.fullName.toLowerCase().includes(filter.toLowerCase());
    const roomMatch = roomFilter === 'all' || booking.roomType === roomFilter;
    return nameMatch && roomMatch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const roomTypeTranslations: { [key: string]: string } = {
    'double': 'Dublă',
    'deluxe': 'Deluxe',
    'apartment': 'Apartament',
    'triple': 'Triplă',
    'single-standard': 'Single Standard',
    'single-deluxe': 'Single Deluxe'
  };
  
  const handleDeleteClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBooking || !selectedBooking.id || !db) return;
    
    setIsDeleting(true);

    try {
        await deleteBooking(
            db,
            selectedBooking.id,
            selectedBooking.roomType,
            new Date(selectedBooking.checkIn.seconds * 1000),
            new Date(selectedBooking.checkOut.seconds * 1000)
        );
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


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
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
                <SelectItem value="double">Dublă</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="apartment">Apartament</SelectItem>
                <SelectItem value="triple">Triplă</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Oaspete</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Tip Cameră</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Preț Total</TableHead>
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
                  <TableCell>{format(new Date(booking.checkIn.seconds * 1000), 'PP', { locale: ro })}</TableCell>
                  <TableCell>{format(new Date(booking.checkOut.seconds * 1000), 'PP', { locale: ro })}</TableCell>
                   <TableCell>{(booking.totalPrice || 0).toFixed(2)} RON</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
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
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editare Status</DropdownMenuItem>
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
                <TableCell colSpan={9} className="h-24 text-center">
                  Niciun rezultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
