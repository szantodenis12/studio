
'use client';

import { useState } from 'react';
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
import { useFirestore } from '@/firebase';
import { adjustAvailability } from '@/services/availability-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

const FormSchema = z.object({
  date: z.date({ required_error: 'Data este obligatorie.' }),
  roomType: z.string({ required_error: 'Selectați un tip de cameră.' }),
  adjustment: z.coerce.number().int().refine(val => val !== 0, {
      message: 'Ajustarea trebuie să fie diferită de zero.'
  }),
});

interface ManualAvailabilityFormProps {
    onUpdate: () => void;
}

export default function ManualAvailabilityForm({ onUpdate }: ManualAvailabilityFormProps) {
  const { toast } = useToast();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        adjustment: 1,
    }
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!db) {
      toast({ variant: 'destructive', title: 'Eroare', description: 'Baza de date nu este disponibilă.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await adjustAvailability(db, data.date, data.roomType, data.adjustment);
      toast({
        title: 'Succes!',
        description: `Disponibilitatea pentru camera ${data.roomType} în data de ${format(data.date, 'PPP', { locale: ro })} a fost ajustată.`,
      });
      form.reset({ adjustment: 1 });
      onUpdate(); // Trigger parent component to refetch stats
    } catch (error: any) {
      console.error('Failed to adjust availability:', error);
      toast({
        variant: 'destructive',
        title: 'Eroare la ajustare',
        description: error.message || 'A apărut o problemă.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajustare Manuală Disponibilitate</CardTitle>
        <CardDescription>
            Adaugă sau anulează o rezervare externă (ex. Booking.com). Folosește `1` pentru o rezervare nouă, `-1` pentru o anulare.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                )}
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
                                disabled={{ before: today }}
                                initialFocus
                                locale={ro}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tip Cameră</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selectați tipul" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="double">Dublă</SelectItem>
                            <SelectItem value="deluxe">Deluxe</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="adjustment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ajustare Număr Camere</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Se procesează...' : 'Aplică Ajustarea'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
