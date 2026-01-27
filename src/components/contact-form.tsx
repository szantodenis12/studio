
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useContext } from 'react';
import { LanguageContext } from '@/contexts/language-context';
import { sendContactEmail } from '@/ai/flows/send-contact-email-flow';

export default function ContactForm() {
  const { toast } = useToast();
  const { translations } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(false);

  const FormSchema = z.object({
    fullName: z.string().min(2, { message: translations.formValidationName }),
    email: z.string().email({ message: translations.formValidationEmail }),
    subject: z.string().min(3, { message: translations.formValidationSubject }),
    message: z.string().min(10, { message: translations.formValidationMessage }),
  });


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      const result = await sendContactEmail(data);

      if (result.success) {
        toast({
          title: translations.formToastTitle,
          description: translations.formToastDescription,
        });
        form.reset();
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send Message',
        description: error.message || 'There was a problem sending your message. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.formFullName}</FormLabel>
              <FormControl>
                <Input placeholder={translations.formFullNamePlaceholder} {...field} />
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
              <FormLabel>{translations.formEmail}</FormLabel>
              <FormControl>
                <Input placeholder={translations.formEmailPlaceholder} {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.formSubject}</FormLabel>
              <FormControl>
                <Input placeholder={translations.formSubjectPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.formMessage}</FormLabel>
              <FormControl>
                <Textarea placeholder={translations.formMessagePlaceholder} {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? translations.formSending : translations.formSendMessage}
        </Button>
      </form>
    </Form>
  );
}
