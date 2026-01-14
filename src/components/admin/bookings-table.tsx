
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

interface BookingsTableProps {
  data: BookingData[];
}

export function BookingsTable({ data }: BookingsTableProps) {
  const [filter, setFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');

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
    'single': 'Single',
    'double': 'Dublă',
    'deluxe': 'Deluxe',
    'apartment': 'Apartament',
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
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Dublă</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="apartment">Apartament</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Oaspete</TableHead>
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
                        <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Ștergere</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Niciun rezultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
