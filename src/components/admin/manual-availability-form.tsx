'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseApp, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { describeBookingError, newRequestId, submitBooking } from '@/services/booking-api';
import { normalizeRoom, sortRooms } from '@/lib/rooms/normalize';
import { quoteStay } from '@/lib/rooms/pricing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const FormSchema = z.object({
  fullName: z.string().min(2, { message: 'Numele este obligatoriu.' }),
  checkIn: z.date({ required_error: 'Data de check-in este obligatorie.' }),
  checkOut: z.date({ required_error: 'Data de check-out este obligatorie.' }),
  roomType: z.string({ required_error: 'Selectați un tip de cameră.' }),
  guests: z.string().min(1, { message: 'Selectați numărul de oaspeți.' }),
  paymentMethod: z.string({ required_error: 'Selectați sursa rezervării.' }),
  email: z.string().email({ message: "Adresa de email nu este validă." }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['Confirmed', 'New']),
  totalPrice: z.string().optional().or(z.literal('')).refine(v => !v || (Number(v) >= 0 && Number.isFinite(Number(v))), { message: 'Preț invalid.' }),
  notes: z.string().max(2000).optional().or(z.literal('')),
}).refine(data => data.checkOut > data.checkIn, {
    message: "Data de check-out trebuie să fie după data de check-in.",
    path: ["checkOut"],
});


interface ManualAvailabilityFormProps {
    onUpdate: () => void;
}

export default function ManualAvailabilityForm({ onUpdate }: ManualAvailabilityFormProps) {
  const { toast } = useToast();
  const db = useFirestore();
  const firebaseApp = useFirebaseApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Idempotency key for the booking being entered (reset after success).
  const requestIdRef = useRef<string | null>(null);

  const roomsQuery = useMemoFirebase(() => (db ? collection(db, 'rooms') : null), [db]);
  const { data: roomDocs } = useCollection<Record<string, unknown>>(roomsQuery);
  const rooms = useMemo(() => sortRooms((roomDocs || []).map(d => normalizeRoom(d.id, d))), [roomDocs]);
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
        guests: '1',
        paymentMethod: 'Booking.com',
        email: '',
        phone: '',
        status: 'Confirmed',
        totalPrice: '',
        notes: '',
    }
  });

  const [wRoomType, wCheckIn, wCheckOut] = form.watch(['roomType', 'checkIn', 'checkOut']);
  const calculatedPrice = useMemo(() => {
    const room = rooms.find(r => r.type === wRoomType);
    if (!room || !wCheckIn || !wCheckOut || wCheckOut <= wCheckIn) return null;
    return quoteStay(room, format(wCheckIn, 'yyyy-MM-dd'), format(wCheckOut, 'yyyy-MM-dd')).total;
  }, [rooms, wRoomType, wCheckIn, wCheckOut]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!requestIdRef.current) requestIdRef.current = newRequestId();
    try {
      // Same server-side path as public bookings (inventory check, per-night
      // pricing, availability), with admin options.
      await submitBooking(firebaseApp, {
        requestId: requestIdRef.current,
        roomType: data.roomType,
        checkIn: format(data.checkIn, 'yyyy-MM-dd'),
        checkOut: format(data.checkOut, 'yyyy-MM-dd'),
        guests: data.guests,
        fullName: data.fullName,
        email: data.email || '',
        phone: data.phone || '',
        admin: {
          status: data.status,
          paymentMethod: data.paymentMethod,
          ...(data.totalPrice ? { totalPrice: Number(data.totalPrice) } : {}),
          ...(data.notes ? { notes: data.notes } : {}),
        },
      });
      requestIdRef.current = null;

      toast({
        title: 'Succes!',
        description: `Rezervarea pentru ${data.fullName} a fost adăugată.`,
      });
      form.reset({
        fullName: '',
        guests: '1',
        paymentMethod: 'Booking.com',
        email: '',
        phone: '',
        status: 'Confirmed',
        totalPrice: '',
        notes: '',
        checkIn: undefined,
        checkOut: undefined,
        roomType: undefined,
      });
      onUpdate(); 
    } catch (error: any) {
      console.error('Failed to create manual booking:', error);
      const info = describeBookingError(error);
      if (info.reason) requestIdRef.current = null;
      toast({
        variant: 'destructive',
        title: 'Eroare la crearea rezervării',
        description: info.reason === 'SOLD_OUT' && info.dates.length
          ? info.message + ' Nopți pline: ' + info.dates.join(', ') + '.'
          : info.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adăugare Rezervare Manuală</CardTitle>
        <CardDescription>
            Adaugă o rezervare de pe o platformă externă (ex. Booking.com) sau telefonică. Aceasta va bloca automat disponibilitatea.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume Oaspete</FormLabel>
                    <FormControl>
                      <Input placeholder="Numele complet al oaspetelui" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                >
                                {field.value ? format(field.value, 'PPP', { locale: ro }) : <span>Alegeți data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={{ before: today }} initialFocus locale={ro} />
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
                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                >
                                {field.value ? format(field.value, 'PPP', { locale: ro }) : <span>Alegeți data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={{ before: form.getValues('checkIn') || today }} initialFocus locale={ro} />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tip Cameră</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selectați tipul" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {rooms.map(room => (
                              <SelectItem key={room.type} value={room.type}>
                                {room.details.ro.title || room.type}{room.active ? '' : ' (inactivă)'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nr. Oaspeți</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selectați numărul" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                             <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sursa Rezervării</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selectați sursa" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Booking.com">Booking.com</SelectItem>
                            <SelectItem value="Travelminit">Travelminit</SelectItem>
                            <SelectItem value="Phone">Telefon</SelectItem>
                            <SelectItem value="property">Direct la Hotel</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email (Opțional)</FormLabel>
                        <FormControl>
                        <Input placeholder="Email oaspete" {...field} />
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
                        <FormLabel>Telefon (Opțional)</FormLabel>
                        <FormControl>
                        <Input placeholder="Telefon oaspete" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Confirmed">Confirmată</SelectItem>
                            <SelectItem value="New">Nouă</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="totalPrice"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Preț total (opțional, RON)</FormLabel>
                        <FormControl>
                        <Input type="number" min={0} placeholder={calculatedPrice !== null ? 'Calculat: ' + calculatedPrice : 'Calculat automat'} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Note (opțional)</FormLabel>
                    <FormControl>
                    <Textarea rows={2} placeholder="ex. cod rezervare Booking.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Se procesează...' : 'Adaugă Rezervarea'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
