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
import { CalendarIcon, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import BlurText from './ui/blur-text';
import { useToast } from '@/hooks/use-toast';
import { useContext, useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { LanguageContext } from '@/contexts/language-context';
import { useFirebaseApp } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { SiteRoom } from '@/lib/rooms/types';
import { roomTitle } from '@/lib/rooms/normalize';
import { useLiveAvailability, useLiveRooms } from '@/lib/rooms/use-live-booking-data';
import { addDaysIso, freeRooms, quoteStay, stayNights, MAX_PUBLIC_STAY_NIGHTS } from '@/lib/rooms/pricing';
import { describeBookingError, newRequestId, submitBooking } from '@/services/booking-api';

/** Calendar Date (local midnight from the date picker) -> 'YYYY-MM-DD'. */
const toIso = (d: Date) => format(d, 'yyyy-MM-dd');

const FormSchema = z.object({
  fullName: z.string().min(2, { message: 'Numele trebuie să aibă cel puțin 2 caractere.' }),
  email: z.string().email({ message: 'Adresa de email nu este validă.' }),
  phone: z.string().min(10, { message: 'Numărul de telefon trebuie să aibă 10 cifre.' }),
  checkIn: z.date({ required_error: 'Data de check-in este obligatorie.' }),
  checkOut: z.date({ required_error: 'Data de check-out este obligatorie.' }),
  roomType: z.string({ required_error: 'Selectați un tip de cameră.' }),
  guests: z.string().min(1, { message: 'Selectați numărul de oaspeți.' }),
});

function BookingFormContent({ rooms: initialRooms }: { rooms: SiteRoom[] }) {
  const { toast } = useToast();
  const { translations, locale } = useContext(LanguageContext);
  const firebaseApp = useFirebaseApp();
  const rooms = useLiveRooms(initialRooms);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronous guard against double clicks (state updates are async).
  const submittingRef = useRef(false);
  // Idempotency key for this form session: a retried/double submit of the same
  // booking returns the booking already created instead of creating another.
  const requestIdRef = useRef<string | null>(null);
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

  const selectedRoom = useMemo(() => rooms.find(r => r.type === selectedRoomType), [rooms, selectedRoomType]);

  // Live availability (onSnapshot) -- updates as soon as someone else books.
  const { byDate: availability, isLoading: isLoadingAvailability, error: availabilityError } =
    useLiveAvailability();

  /** True if no room of the selected type is left for the night starting on iso. */
  const isSoldOutNight = useCallback((iso: string) => {
    if (!selectedRoom) return false;
    return freeRooms(availability[iso], selectedRoom.type, selectedRoom.totalRooms) <= 0;
  }, [availability, selectedRoom]);

  // Per-night pricing (base price or date-range overrides).
  const quote = useMemo(() => {
    if (!selectedRoom || !checkInDate || !checkOutDate) return null;
    const q = quoteStay(selectedRoom, toIso(checkInDate), toIso(checkOutDate));
    if (!q.nights.length || q.nights.some(n => !(n.price > 0))) return null;
    return q;
  }, [selectedRoom, checkInDate, checkOutDate]);
  const totalPrice = quote ? quote.total : null;
  const nights = quote ? quote.nights.length : 0;

  const isDateRangeConflict = useMemo(() => {
    if (!checkInDate || !checkOutDate) return false;
    // The check-out day itself is not a booked night.
    return stayNights(toIso(checkInDate), toIso(checkOutDate)).some(isSoldOutNight);
  }, [checkInDate, checkOutDate, isSoldOutNight]);

  // Guests allowed by the selected room (capacity); 1-4 as before otherwise.
  const guestOptions = useMemo(() => {
    const max = selectedRoom?.maxGuests || 4;
    return Array.from({ length: Math.max(1, Math.min(max, 10)) }, (_, i) => i + 1);
  }, [selectedRoom]);
  const guestsValue = form.watch('guests');
  useEffect(() => {
    if (guestsValue && Number(guestsValue) > guestOptions.length) {
      form.setValue('guests', String(guestOptions.length), { shouldValidate: true });
    }
  }, [guestsValue, guestOptions, form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (submittingRef.current) return; // double click / double submit
    if (isDateRangeConflict) {
      setSubmitError("Intervalul selectat conține zile deja rezervate. Vă rugăm alegeți alte date.");
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    if (!requestIdRef.current) requestIdRef.current = newRequestId();
    try {
      await submitBooking(firebaseApp, {
        requestId: requestIdRef.current,
        roomType: data.roomType,
        checkIn: toIso(data.checkIn),
        checkOut: toIso(data.checkOut),
        guests: data.guests,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        locale: locale === 'en' ? 'en' : 'ro',
      });
      toast({
        title: "Rezervare trimisă!",
        description: "Vă mulțumim! Veți primi în curând un email de confirmare.",
      });
      form.reset();
      // A new booking from the same page is a new request.
      requestIdRef.current = null;
    } catch (error: unknown) {
      console.error("Booking failed:", error);
      const info = describeBookingError(error);
      // The server rejected this attempt without creating anything, so a
      // corrected resubmission gets a fresh idempotency key. (On network
      // errors the key is kept: the retry must not create a duplicate.)
      if (info.reason) requestIdRef.current = null;
      setSubmitError(info.message);
      toast({
        variant: "destructive",
        title: "Eroare la rezervare",
        description: info.message,
      });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const roomTypes = rooms.map(room => ({
    value: room.type,
    label: roomTitle(room, locale),
  }));

  const disabledDates = useMemo(() => {
    const pastDates = { before: today };
    return [pastDates, (date: Date) => isSoldOutNight(toIso(date))];
  }, [today, isSoldOutNight]);

  // Check-out: after check-in, and no later than the first sold-out night
  // following check-in (the check-out day itself may be sold out).
  const checkOutDisabled = useMemo(() => {
    if (!checkInDate) return [{ before: today }];
    const startIso = toIso(checkInDate);
    let lastAllowed = addDaysIso(startIso, MAX_PUBLIC_STAY_NIGHTS);
    for (let i = 0; i < MAX_PUBLIC_STAY_NIGHTS; i++) {
      const night = addDaysIso(startIso, i);
      if (isSoldOutNight(night)) {
        lastAllowed = night;
        break;
      }
    }
    return [
      { before: checkInDate },
      (date: Date) => {
        const iso = toIso(date);
        return iso <= startIso || iso > lastAllowed;
      },
    ];
  }, [checkInDate, today, isSoldOutNight]);

  // Clear a stale server error once the user changes the selection.
  useEffect(() => {
    setSubmitError(null);
  }, [selectedRoomType, checkInDate, checkOutDate]);

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
                            // Radix re-emits the current value when it is set
                            // programmatically (e.g. ?roomType= from the booking
                            // bar); only a real change should clear the dates.
                            if (!value || value === field.value) return;
                            field.onChange(value);
                            form.resetField('checkIn');
                            form.resetField('checkOut');
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

                  {selectedRoomType && isLoadingAvailability && <p className="text-sm text-white/70">Se verifică disponibilitatea...</p>}
                  
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
                                disabled={checkOutDisabled}
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
                          <Select onValueChange={(value) => { if (value) field.onChange(value); }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/10 border-white/30 text-white">
                                <SelectValue placeholder="Selectați numărul de oaspeți" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {guestOptions.map(num => (
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

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Rezervarea nu a putut fi trimisă</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full rounded-full text-base md:text-lg mt-8 bg-white text-black hover:bg-white/90" disabled={isSubmitting || isDateRangeConflict || !form.formState.isValid || totalPrice === null} aria-busy={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSubmitting ? 'Se trimite rezervarea...' : 'Finalizează Rezervarea'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function BookingForm({ rooms }: { rooms: SiteRoom[] }) {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-lg border border-white/20 text-white p-6 md:p-10 rounded-lg shadow-2xl text-center">Loading form...</div>}>
      <BookingFormContent rooms={rooms} />
    </Suspense>
  );
}
