
'use client';

import { useState, useMemo, useContext } from 'react';
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
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { LanguageContext } from '@/contexts/language-context';
import { motion } from 'framer-motion';

export default function BookingBar() {
    const { translations } = useContext(LanguageContext);
    const [checkInDate, setCheckInDate] = useState<Date | undefined>();
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const roomTypes = [
        { value: 'double', label: translations.room1Title },
        { value: 'deluxe', label: translations.room2Title },
        { value: 'single', label: translations.room3Title },
    ];
    
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
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={checkInDate}
                            onSelect={setCheckInDate}
                            disabled={{ before: today }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Select>
                    <SelectTrigger className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 text-base">
                        <SelectValue placeholder="Tip Cameră" />
                    </SelectTrigger>
                    <SelectContent>
                        {roomTypes.map(room => (
                            <SelectItem key={room.value} value={room.value}>{room.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select>
                    <SelectTrigger className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 text-base">
                        <SelectValue placeholder="Oaspeți" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 2, 3, 4].map(num => (
                            <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button className="w-full text-base" size="lg">
                    <Search className="mr-2 h-4 w-4" /> Caută
                </Button>
            </div>
        </motion.div>
    )
}

    