
'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { LanguageContext } from '@/contexts/language-context';
import { motion } from 'framer-motion';
import type { SiteRoom } from '@/lib/rooms/types';
import { roomTitle } from '@/lib/rooms/normalize';

/** `rooms`: the active rooms rendered by the page (Firestore, server-side). */
export default function BookingBar({ rooms }: { rooms: SiteRoom[] }) {
    const { translations, locale } = useContext(LanguageContext);
    const [checkInDate, setCheckInDate] = useState<Date | undefined>();
    const [roomType, setRoomType] = useState<string | undefined>();
    const [guests, setGuests] = useState<string | undefined>();
    const [isClient, setIsClient] = useState(false);
    const [today, setToday] = useState(new Date());

    useEffect(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setToday(d);
        setIsClient(true);
    }, []);

    const roomTypes = rooms.map(room => ({
        value: room.type,
        label: roomTitle(room, locale),
    }));

    const bookingUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (checkInDate) {
            params.set('checkIn', formatISO(checkInDate, { representation: 'date' }));
        }
        if (roomType) {
            params.set('roomType', roomType);
        }
        if (guests) {
            params.set('guests', guests);
        }
        return `/rezervare?${params.toString()}`;
    }, [checkInDate, roomType, guests]);
    
    if (!isClient) {
        return <div className="h-[96px] w-full bg-black/20 backdrop-blur-lg border border-white/20 rounded-lg animate-pulse"></div>;
    }

    return (
        <motion.div 
          className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white h-12 text-base',
                            !checkInDate && 'text-white/70'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, 'PPP', { locale: ro }) : <span>Check-in</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black/20 backdrop-blur-lg border-white/20 text-white" align="start">
                        <Calendar
                            mode="single"
                            selected={checkInDate}
                            onSelect={setCheckInDate}
                            disabled={{ before: today }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Select onValueChange={setRoomType} value={roomType}>
                    <SelectTrigger className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 text-base">
                        <SelectValue placeholder="Tip Cameră" />
                    </SelectTrigger>
                    <SelectContent>
                        {roomTypes.map(room => (
                            <SelectItem key={room.value} value={room.value}>{room.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={setGuests} value={guests}>
                    <SelectTrigger className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 text-base">
                        <SelectValue placeholder="Oaspeți" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 2, 3, 4].map(num => (
                            <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button asChild className="w-full text-base" size="lg">
                    <Link href={bookingUrl}>
                        <Search className="mr-2 h-4 w-4" /> Caută
                    </Link>
                </Button>
            </div>
        </motion.div>
    )
}
