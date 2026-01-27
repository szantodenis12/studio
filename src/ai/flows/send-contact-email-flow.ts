'use server';
/**
 * @fileOverview A flow to handle sending contact form emails.
 *
 * - sendContactEmail - A function that handles processing the contact form submission.
 * - ContactFormInput - The input type for the sendContactEmail function.
 * - ContactFormOutput - The return type for the sendContactEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ContactFormInputSchema = z.object({
  fullName: z.string().describe('The full name of the person sending the message.'),
  email: z.string().email().describe('The email address of the sender.'),
  subject: z.string().describe('The subject of the message.'),
  message: z.string().describe('The content of the message.'),
});
export type ContactFormInput = z.infer<typeof ContactFormInputSchema>;

export const ContactFormOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type ContactFormOutput = z.infer<typeof ContactFormOutputSchema>;

// This is the main function that will be called from the client.
export async function sendContactEmail(input: ContactFormInput): Promise<ContactFormOutput> {
  return sendContactEmailFlow(input);
}

const sendContactEmailFlow = ai.defineFlow(
  {
    name: 'sendContactEmailFlow',
    inputSchema: ContactFormInputSchema,
    outputSchema: ContactFormOutputSchema,
  },
  async (input) => {
    console.log('Received contact form submission:', input);

    // In a real application, you would add your email sending logic here.
    // For example, using a service like Nodemailer or an email API like SendGrid.
    // The email would be sent to "rezervari@hotel-maxim.ro".

    // For this prototype, we'll just simulate a successful submission.
    const to = 'rezervari@hotel-maxim.ro';
    console.log(`Simulating sending email to ${to} with the following data:`, input);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Your message has been sent successfully.',
    };
  }
);
