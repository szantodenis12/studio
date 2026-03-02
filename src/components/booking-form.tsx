
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, eachDayOfInterval, isSameDay, differenceInCalendarDays, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import BlurText from './ui/blur-text';
import { useToast } from '@/hooks/use-toast';
import { useContext, useState, useEffect, useMemo, Suspense } from 'react';
import { LanguageContext } from '@/contexts/language-context';
import { createBooking } from '@/services/booking-service';
import { useFirestore } from '@/firebase';
import { getUnavailableDates } from '@/services/availability-service';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { roomData } from '@/lib/room-data';

const FormSchema = z.object({
  fullName: z.string().min(2, { message: 'Numele trebuie să aibă cel puțin 2 caractere.' }),
  email: z.string().email({ message: 'Adresa de email nu este validă.' }),
  phone: z.string().min(10, { message: 'Numărul de telefon trebuie să aibă 10 cifre.' }),
  checkIn: z.date({ required_error: 'Data de check-in este obligatorie.' }),
  checkOut: z.date({ required_error: 'Data de check-out este obligatorie.' }),
  roomType: z.string({ required_error: 'Selectați un tip de cameră.' }),
  guests: z.string().min(1, { message: 'Selectați numărul de oaspeți.' }),
});

function BookingFormContent() {
  const { toast } = useToast();
  const { translations, locale } = useContext(LanguageContext);
  const db = useFirestore();

  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [nights, setNights] = useState(0);
  const [today, setToday] = useState(new Date());
  
  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setToday(d);
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      checkIn: undefined,
      roomType: undefined,
      guests: undefined,
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const checkInParam = params.get('checkIn');
    const roomTypeParam = params.get('roomType');
    const guestsParam = params.get('guests');

    if (checkInParam) form.setValue('checkIn', parseISO(checkInParam));
    if (roomTypeParam) form.setValue('roomType', roomTypeParam);
    if (guestsParam) form.setValue('guests', guestsParam);
  }, [form]);
  
  const selectedRoomType = form.watch('roomType');
  const checkInDate = form.watch('checkIn');
  const checkOutDate = form.watch('checkOut');

  useEffect(() => {
    if (selectedRoomType && db) {
      setIsLoadingAvailability(true);
      setAvailabilityError(null);
      getUnavailableDates(db, selectedRoomType)
        .then(dates => {
          setUnavailableDates(dates);
        })
        .catch(err => {
          console.error("Error fetching availability:", err);
          setAvailabilityError("Nu am putut verifica disponibilitatea. Vă rugăm încercați mai târziu.");
        })
        .finally(() => {
          setIsLoadingAvailability(false);
        });
    } else {
      setUnavailableDates([]);
    }
  }, [selectedRoomType, db]);

  useEffect(() => {
    if (checkInDate && checkOutDate && selectedRoomType) {
        const numNights = differenceInCalendarDays(checkOutDate, checkInDate);
        const room = roomData.find(r => r.type === selectedRoomType);
        const pricePerNight = room?.price || 0;
        if (numNights > 0 && pricePerNight) {
            const finalPrice = numNights * pricePerNight;
            setTotalPrice(finalPrice);
            setNights(numNights);
        } else {
            setTotalPrice(null);
            setNights(0);
        }
    } else {
        setTotalPrice(null);
        setNights(0);
    }
  }, [checkInDate, checkOutDate, selectedRoomType]);

  const isDateRangeConflict = useMemo(() => {
    if (!checkInDate || !checkOutDate) return false;
    const range = eachDayOfInterval({ start: checkInDate, end: checkOutDate });
    return range.some(dateInRange => 
      unavailableDates.some(unavailableDate => isSameDay(dateInRange, unavailableDate))
    );
  }, [checkInDate, checkOutDate, unavailableDates]);


  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Baza de date nu este disponibilă. Vă rugăm încercați mai târziu."
      });
      return;
    }
     if (isDateRangeConflict) {
      setAvailabilityError("Intervalul selectat conține zile deja rezervate. Vă rugăm alegeți alte date.");
      return;
    }
    try {
      await createBooking(db, { ...data, paymentMethod: 'property' });
      toast({
        title: "Rezervare trimisă!",
        description: "Vă mulțumim! Veți primi în curând un email de confirmare.",
      });
      form.reset();
      setUnavailableDates([]);
      setTotalPrice(null);
      setNights(0);
    } catch (error: any) {
      console.error("Booking failed:", error);
      toast({
        variant: "destructive",
        title: "Eroare la rezervare",
        description: `A apărut o problemă. Cod eroare: ${error.code || 'necunoscut'}`,
      });
    }
  }
  
  const roomTypes = roomData.map(room => ({
    value: room.type,
    label: room.details[locale]?.title || room.details['en'].title
  }));

  const disabledDates = useMemo(() => {
    const pastDates = { before: today };
    return [pastDates, ...unavailableDates];
  }, [today, unavailableDates]);

  return (
    <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-lg border border-white/20 text-white p-6 md:p-10 rounded-lg shadow-2xl">
      <div className="text-center mb-8">
        <BlurText
          text="Efectuați o Rezervare"
          delay={70}
          className="text-3xl md:text-4xl font-bold mb-3 text-white justify-center"
        />
        <p className="text-white/80 text-sm">
          Completați formularul de mai jos pentru a vă asigura șederea.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="single" defaultValue="item-1" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="text-lg font-medium text-white hover:no-underline">Pasul 1: Detaliile Rezervării</AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                 <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tip Cameră</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('checkIn', undefined);
                            form.setValue('checkOut', undefined);
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/30 text-white">
                              <SelectValue placeholder="Selectați tipul camerei" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roomTypes.map(room => (
                              <SelectItem key={room.value} value={room.value}>{room.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isLoadingAvailability && <p className="text-sm text-white/70">Se verifică disponibilitatea...</p>}
                  
                  {availabilityError && (
                     <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Eroare disponibilitate</AlertTitle>
                      <AlertDescription>
                        {availabilityError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-in</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                   className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                                   disabled={!selectedRoomType || isLoadingAvailability}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: ro })
                                  ) : (
                                    <span>Alegeți data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-black/50 backdrop-blur-lg border-white/20 text-white" align="start">
                              <Calendar
                                locale={ro}
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={disabledDates}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-out</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                                  disabled={!checkInDate || isLoadingAvailability}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: ro })
                                  ) : (
                                    <span>Alegeți data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-black/50 backdrop-blur-lg border-white/20 text-white" align="start">
                              <Calendar
                                locale={ro}
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={[...disabledDates, { before: checkInDate || today }]}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                 {isDateRangeConflict && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Conflict de date</AlertTitle>
                      <AlertDescription>
                        Intervalul de date selectat include zile care sunt deja rezervate. Vă rugăm să alegeți un alt interval.
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                      control={form.control}
                      name="guests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Număr Oaspeți</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/10 border-white/30 text-white">
                                <SelectValue placeholder="Selectați numărul de oaspeți" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4].map(num => (
                                <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-b-0">
                <AccordionTrigger className="text-lg font-medium text-white hover:no-underline">Pasul 2: Detalii Contact</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nume Complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Popescu Ion" {...field} className="bg-white/10 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="ion.popescu@email.com" {...field} type="email" className="bg-white/10 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="0712 345 678" {...field} type="tel" className="bg-white/10 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </AccordionContent>
            </AccordionItem>
          </Accordion>

          {totalPrice !== null && nights > 0 && (
            <div className="mt-6 pt-4 border-t border-white/20 space-y-3 text-white">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>{translations.bookingTotal}:</span>
                    <span>{totalPrice.toFixed(2)} RON</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/80 font-medium">{translations.bookingPaymentNotice}</p>
                  <p className="text-[10px] text-white/60 italic leading-tight">{translations.localTaxDisclaimer}</p>
                </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full rounded-full text-base md:text-lg mt-8 bg-white text-black hover:bg-white/90" disabled={isDateRangeConflict || !form.formState.isValid || totalPrice === null}>
            Finalizează Rezervarea
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-lg border border-white/20 text-white p-6 md:p-10 rounded-lg shadow-2xl text-center">Loading form...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}
