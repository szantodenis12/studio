
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { ro } from 'date-fns/locale';
import BlurText from './ui/blur-text';
import { useToast } from '@/hooks/use-toast';
import { useContext, useState, useEffect, useMemo } from 'react';
import { LanguageContext } from '@/contexts/language-context';
import { createBooking } from '@/services/booking-service';
import { useFirestore } from '@/firebase';
import { getUnavailableDates } from '@/services/availability-service';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const FormSchema = z.object({
  fullName: z.string().min(2, { message: 'Numele trebuie să aibă cel puțin 2 caractere.' }),
  email: z.string().email({ message: 'Adresa de email nu este validă.' }),
  phone: z.string().min(10, { message: 'Numărul de telefon trebuie să aibă 10 cifre.' }),
  checkIn: z.date({ required_error: 'Data de check-in este obligatorie.' }),
  checkOut: z.date({ required_error: 'Data de check-out este obligatorie.' }),
  roomType: z.string({ required_error: 'Selectați un tip de cameră.' }),
  guests: z.string().min(1, { message: 'Selectați numărul de oaspeți.' }),
  paymentMethod: z.enum(['card', 'property'], { required_error: 'Selectați o metodă de plată.' }),
});

export default function BookingForm() {
  const { toast } = useToast();
  const { translations } = useContext(LanguageContext);
  const db = useFirestore();

  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });
  
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
      await createBooking(db, data);
      toast({
        title: "Rezervare trimisă!",
        description: "Vă mulțumim! Veți primi în curând un email de confirmare.",
      });
      form.reset();
      setUnavailableDates([]);
    } catch (error) {
      console.error("Booking failed:", error);
      toast({
        variant: "destructive",
        title: "Eroare la rezervare",
        description: "A apărut o problemă. Vă rugăm încercați din nou.",
      });
    }
  }
  
  const roomTypes = [
    { value: 'double', label: translations.room1Title },
    { value: 'deluxe', label: translations.room2Title },
    { value: 'single', label: translations.room3Title },
  ];

  const disabledDates = useMemo(() => {
    const pastDates = { before: today };
    return [pastDates, ...unavailableDates];
  }, [today, unavailableDates]);

  return (
    <div className="max-w-4xl mx-auto bg-card p-6 md:p-12 rounded-lg shadow-2xl">
      <div className="text-center mb-8 md:mb-10">
        <BlurText
          text="Efectuați o Rezervare"
          delay={70}
          className="text-3xl md:text-5xl font-headline font-bold mb-4 text-primary justify-center"
        />
        <p className="text-muted-foreground text-sm md:text-base">
          Completați formularul de mai jos pentru a vă asigura șederea.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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

            {isLoadingAvailability && <p>Se verifică disponibilitatea...</p>}
            
            {availabilityError && (
               <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Eroare disponibilitate</AlertTitle>
                <AlertDescription>
                  {availabilityError}
                </AlertDescription>
              </Alert>
            )}

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
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
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
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
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
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

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Număr Oaspeți</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
             <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume Complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Popescu Ion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <hr className="border-border" />
          
          <h3 className="text-lg font-medium text-foreground pt-2 md:pt-4">Detalii de Contact & Plată</h3>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="ion.popescu@email.com" {...field} />
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
                    <Input placeholder="0712 345 678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <hr className="border-border" />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-medium text-foreground">Metodă de Plată</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="property" id="property" className="sr-only" />
                      </FormControl>
                      <FormLabel htmlFor="property" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <Wallet className="mb-3 h-6 w-6" />
                        Plată la Proprietate
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="card" id="card" className="sr-only" />
                      </FormControl>
                      <FormLabel htmlFor="card" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <CreditCard className="mb-3 h-6 w-6" />
                        Plată cu Cardul
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full rounded-full text-base md:text-lg mt-8" disabled={isDateRangeConflict || !form.formState.isValid}>
            Finalizează Rezervarea
          </Button>
        </form>
      </Form>
    </div>
  );
}
